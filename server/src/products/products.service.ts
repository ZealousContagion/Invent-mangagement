import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, MovementType } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  // Find all products with category and supplier info

  async create(data: Prisma.ProductCreateInput) {
    try {
      const product = await this.prisma.product.create({ data });

      // Initial stock movement if quantity > 0
      if (product.quantity > 0) {
        await this.prisma.stockMovement.create({
          data: {
            productId: product.id,
            quantity: product.quantity,
            type: MovementType.IN,
            reason: 'Initial stock',
          },
        });
      }

      return product;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product with this SKU already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return (this.prisma as any).product.findMany({
      include: {
        category: {
          select: { name: true },
        },
        supplier: {
          select: { name: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findLowStock() {
    const products = await (this.prisma as any).product.findMany({
      include: {
        category: { select: { name: true } },
        supplier: { select: { name: true } },
      },
    });
    // Filter by individual reorderPoints
    return products.filter(p => p.quantity < p.reorderPoint);
  }

  async getReorderSuggestions() {
    // We fetch all products and filter in JS because Prisma doesn't support comparing two columns in the same row easily without raw SQL
    const allProducts = await (this.prisma as any).product.findMany({
      include: {
        supplier: true,
        category: true,
      },
    });

    return allProducts
      .filter(p => p.quantity < p.reorderPoint)
      .map(p => ({
        ...p,
        suggestedOrderQuantity: Math.max(0, p.targetStockLevel - p.quantity),
      }));
  }

  async findOne(id: string) {
    const product = await (this.prisma as any).product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async adjustStock(id: string, quantity: number, type: MovementType, reason?: string, employeeId?: string) {
    const product = await this.findOne(id);

    // Logic for CHECK_IN/OUT is similar to IN/OUT but implies ownership transfer
    // CHECK_OUT = OUT (Quantity decreases from stock)
    // CHECK_IN = IN (Quantity increases to stock)

    let effectiveType = type;
    let effectiveQuantityChange = 0;

    if (type === MovementType.IN || type === MovementType.CHECK_IN) {
      effectiveQuantityChange = quantity;
    } else if (type === MovementType.OUT || type === MovementType.CHECK_OUT) {
      effectiveQuantityChange = -quantity;
    } else {
      // ADJUSTMENT
      effectiveQuantityChange = quantity - product.quantity;
    }

    const newQuantity = product.quantity + effectiveQuantityChange;
    // For ADJUSTMENT type, the input quantity is the target, so newQuantity logic above is for IN/OUT
    // Let's correct:
    const finalQuantity = type === MovementType.ADJUSTMENT ? quantity : product.quantity + effectiveQuantityChange;

    const [updatedProduct] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id },
        data: { quantity: finalQuantity },
      }),
      this.prisma.stockMovement.create({
        data: {
          productId: id,
          quantity: type === MovementType.ADJUSTMENT ? quantity - product.quantity : quantity,
          type,
          reason,
          employeeId,
        },
      }),
    ]);

    return updatedProduct;
  }

  async remove(id: string) {
    try {
      // Note: In a real system, you might want soft delete
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }
}