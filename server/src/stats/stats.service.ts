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
      thresholdSetting,
      expenses,
      salesOrders,
      topSellers
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.category.count(),
      this.prisma.stockMovement.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
      this.prisma.product.findMany({
        select: { price: true, quantity: true, category: { select: { name: true } } }
      }),
      this.prisma.setting.findUnique({
        where: { key: 'lowStockThreshold' }
      }),
      this.prisma.expense.findMany(),
      (this.prisma as any).salesOrder.findMany({
        where: { status: { in: ['SHIPPED', 'DELIVERED'] } }
      }),
      (this.prisma as any).salesOrderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      })
    ]);

    const lowStockThreshold = thresholdSetting ? parseInt(thresholdSetting.value) : 10;
    const lowStockProducts = allProducts.filter(p => p.quantity < lowStockThreshold).length;

    const totalValue = allProducts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    // Grouping monthly data (Last 6 months)
    const monthlyDataMap: Record<string, { month: string; revenue: number; expenses: number }> = {};
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('default', { month: 'short' });
    }).reverse();

    months.forEach(m => monthlyDataMap[m] = { month: m, revenue: 0, expenses: 0 });

    salesOrders.forEach(so => {
      const m = new Date(so.date).toLocaleString('default', { month: 'short' });
      if (monthlyDataMap[m]) monthlyDataMap[m].revenue += so.totalAmount;
    });

    expenses.forEach(ex => {
      const m = new Date(ex.date).toLocaleString('default', { month: 'short' });
      if (monthlyDataMap[m]) monthlyDataMap[m].expenses += ex.amount;
    });

    // Category Distribution
    const categoryMap: Record<string, number> = {};
    allProducts.forEach(p => {
      const catName = p.category.name;
      categoryMap[catName] = (categoryMap[catName] || 0) + (p.price * p.quantity);
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Top Products with Names
    const topProducts = await Promise.all(topSellers.map(async (s: any) => {
      const product = await this.prisma.product.findUnique({
        where: { id: s.productId },
        select: { name: true }
      });
      return {
        name: product?.name || 'Unknown',
        quantity: s._sum.quantity
      };
    }));

    return {
      totalProducts,
      totalCategories,
      lowStockProducts,
      recentMovements,
      totalValue,
      categoryData,
      monthlyData: Object.values(monthlyDataMap),
      topProducts
    };
  }
}