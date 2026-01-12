import { PrismaService } from '../prisma/prisma.service';
export declare class StockMovementsService {
    private prisma;
    constructor(prisma: PrismaService);
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
