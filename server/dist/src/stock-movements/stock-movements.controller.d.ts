import { StockMovementsService } from './stock-movements.service';
export declare class StockMovementsController {
    private readonly stockMovementsService;
    constructor(stockMovementsService: StockMovementsService);
    findAll(): Promise<({
        product: {
            sku: string;
            name: string;
        };
        employee: {
            name: string;
        } | null;
    } & {
        id: string;
        quantity: number;
        createdAt: Date;
        type: import("@prisma/client").$Enums.MovementType;
        reason: string | null;
        productId: string;
        employeeId: string | null;
    })[]>;
}
