import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getDashboardStats(): Promise<{
        totalProducts: number;
        totalCategories: number;
        lowStockProducts: number;
        recentMovements: number;
        totalValue: number;
    }>;
}
