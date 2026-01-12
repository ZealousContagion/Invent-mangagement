import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { PrismaService } from './prisma/prisma.service';
const { SOStatus, MovementType } = require('@prisma/client');

@Injectable()
export class SalesOrdersService {
  constructor(private prisma: PrismaService) { }

  async create(createSalesOrderDto: CreateSalesOrderDto) {
    const { customerId, items, date } = createSalesOrderDto;

    // Generate order number
    const count = await (this.prisma as any).salesOrder.count();
    const orderNumber = `SO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return (this.prisma as any).salesOrder.create({
      data: {
        orderNumber,
        customer: { connect: { id: customerId } },
        status: SOStatus.DRAFT,
        totalAmount,
        date: date ? new Date(date) : new Date(),
        items: {
          create: items.map((item) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: { product: { select: { name: true, sku: true } } },
        },
        customer: { select: { name: true } },
      },
    });
  }

  async findAll() {
    return (this.prisma as any).salesOrder.findMany({
      include: {
        customer: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const so = await (this.prisma as any).salesOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { name: true, sku: true, quantity: true } } },
        },
        customer: true,
      },
    });
    if (!so) throw new NotFoundException(`Sales Order with ID ${id} not found`);
    return so;
  }

  async update(id: string, updateSalesOrderDto: any) {
    const currentSO = await this.findOne(id);

    if (currentSO.status === SOStatus.SHIPPED || currentSO.status === SOStatus.DELIVERED) {
      if (updateSalesOrderDto.status !== SOStatus.CANCELLED) {
        throw new BadRequestException('Cannot edit a shipped/delivered order except to cancel it');
      }
    }

    if (updateSalesOrderDto.status === SOStatus.SHIPPED && currentSO.status !== SOStatus.SHIPPED) {
      return this.shipOrder(id);
    }

    const { items, customerId, date, status } = updateSalesOrderDto;
    let totalAmount = currentSO.totalAmount;
    if (items) {
      totalAmount = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0);
    }

    return (this.prisma as any).salesOrder.update({
      where: { id },
      data: {
        status,
        date: date ? new Date(date) : undefined,
        customerId,
        totalAmount,
        items: items ? {
          deleteMany: {},
          create: items.map((item: any) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        } : undefined,
      },
      include: {
        items: {
          include: { product: { select: { name: true, sku: true } } },
        },
        customer: { select: { name: true } },
      },
    });
  }

  private async shipOrder(id: string) {
    return (this.prisma as any).$transaction(async (tx: any) => {
      const so = await tx.salesOrder.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });

      if (!so || so.status === SOStatus.SHIPPED || so.status === SOStatus.DELIVERED) {
        throw new BadRequestException('Order already shipped or not found');
      }

      // Check stock availability
      for (const item of so.items) {
        if (item.product.quantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product: ${item.product.name}. Required: ${item.quantity}, Available: ${item.product.quantity}`);
        }
      }

      // 1. Update SO status
      const updatedSO = await tx.salesOrder.update({
        where: { id },
        data: {
          status: SOStatus.SHIPPED,
          shippedDate: new Date(),
        },
      });

      // 2. Reduce stock and record movement
      for (const item of so.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: -item.quantity,
            type: MovementType.OUT,
            reason: `Shipped for Sales Order ${so.orderNumber}`,
          },
        });
      }

      return updatedSO;
    });
  }

  async remove(id: string) {
    const so = await this.findOne(id);
    if (so.status === SOStatus.SHIPPED || so.status === SOStatus.DELIVERED) {
      throw new BadRequestException('Cannot delete a shipped or delivered order');
    }
    return (this.prisma as any).salesOrder.delete({ where: { id } });
  }
}
