import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) { }

  async getDashboardStats() {
    const [
      totalProducts,
      totalCategories,
      recentMovements,
      allProducts,
      thresholdSetting
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.category.count(),
      this.prisma.stockMovement.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      }),
      this.prisma.product.findMany({
        select: { price: true, quantity: true }
      }),
      this.prisma.setting.findUnique({
        where: { key: 'lowStockThreshold' }
      })
    ]);

    const lowStockThreshold = thresholdSetting ? parseInt(thresholdSetting.value) : 10;

    const lowStockProducts = allProducts.filter(p => p.quantity < lowStockThreshold).length;

    const totalValue = allProducts.reduce((acc, curr) => {
      return acc + (curr.price * curr.quantity);
    }, 0);

    const categories = await (this.prisma as any).category.findMany({
      include: {
        products: {
          select: {
            quantity: true,
            price: true,
          }
        }
      }
    });

    const categoryData = categories.map(cat => ({
      name: cat.name,
      value: cat.products.reduce((sum, p: any) => sum + (p.quantity * p.price), 0),
    })).filter((cat: any) => cat.value > 0);

    return {
      totalProducts,
      totalCategories,
      lowStockProducts,
      recentMovements,
      totalValue,
      categoryData,
    };
  }
}