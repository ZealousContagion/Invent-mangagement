import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
const { POStatus, MovementType } = require('@prisma/client');

@Injectable()
export class PurchaseOrdersService {
    constructor(private prisma: PrismaService) { }

    async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
        const { supplierId, items, expectedDate } = createPurchaseOrderDto;

        // Generate a simple order number
        const count = await (this.prisma as any).purchaseOrder.count();
        const orderNumber = `PO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

        const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

        return (this.prisma as any).purchaseOrder.create({
            data: {
                orderNumber,
                supplier: { connect: { id: supplierId } },
                status: POStatus.DRAFT,
                totalAmount,
                expectedDate: expectedDate ? new Date(expectedDate) : null,
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
                supplier: { select: { name: true } },
            },
        });
    }

    async findAll() {
        return (this.prisma as any).purchaseOrder.findMany({
            include: {
                supplier: { select: { name: true } },
                _count: { select: { items: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const po = await (this.prisma as any).purchaseOrder.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: { select: { name: true, sku: true } } },
                },
                supplier: true,
            },
        });

        if (!po) throw new NotFoundException(`Purchase Order with ID ${id} not found`);
        return po;
    }

    async update(id: string, updatePurchaseOrderDto: any) {
        const currentPO = await this.findOne(id);

        if (currentPO.status === POStatus.RECEIVED) {
            throw new BadRequestException('Cannot update a received Purchase Order');
        }

        if (updatePurchaseOrderDto.status === POStatus.RECEIVED) {
            return this.receiveOrder(id);
        }

        const { items, supplierId, expectedDate, status } = updatePurchaseOrderDto;

        let totalAmount = currentPO.totalAmount;
        if (items) {
            totalAmount = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0);
        }

        return (this.prisma as any).purchaseOrder.update({
            where: { id },
            data: {
                status,
                expectedDate: expectedDate ? new Date(expectedDate) : undefined,
                supplierId,
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
                supplier: { select: { name: true } },
            },
        });
    }

    private async receiveOrder(id: string) {
        return (this.prisma as any).$transaction(async (tx: any) => {
            const po = await tx.purchaseOrder.findUnique({
                where: { id },
                include: { items: true },
            });

            if (!po || po.status === POStatus.RECEIVED) {
                throw new BadRequestException('Order already received or not found');
            }

            // 1. Update PO status
            const updatedPO = await tx.purchaseOrder.update({
                where: { id },
                data: {
                    status: POStatus.RECEIVED,
                    receivedDate: new Date(),
                },
            });

            // 2. Update stock for each item
            for (const item of po.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: { increment: item.quantity },
                    },
                });

                // 3. Record stock movement
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        quantity: item.quantity,
                        type: MovementType.IN,
                        reason: `Received from Purchase Order ${po.orderNumber}`,
                    },
                });
            }

            return updatedPO;
        });
    }

    async remove(id: string) {
        const po = await this.findOne(id);
        if (po.status === POStatus.RECEIVED) {
            throw new BadRequestException('Cannot delete a received Purchase Order');
        }

        return (this.prisma as any).purchaseOrder.delete({ where: { id } });
    }
}
