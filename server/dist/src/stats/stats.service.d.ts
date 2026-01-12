import { PrismaService } from '../prisma/prisma.service';
export declare class StatsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        totalProducts: number;
        totalCategories: number;
        lowStockProducts: number;
        recentMovements: number;
        totalValue: number;
        categoryData: any;
    }>;
}
