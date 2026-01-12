import { StockMovementsService } from './stock-movements.service';
export declare class StockMovementsController {
    private readonly stockMovementsService;
    constructor(stockMovementsService: StockMovementsService);
    findAll(): Promise<({
        employee: {
            name: string;
        } | null;
        product: {
            name: string;
            sku: string;
        };
    } & {
        id: string;
        createdAt: Date;
        quantity: number;
        type: import(".prisma/client").$Enums.MovementType;
        reason: string | null;
        productId: string;
        employeeId: string | null;
    })[]>;
}
