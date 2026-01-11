import { PrismaService } from '../prisma/prisma.service';
export declare class StockMovementsService {
    private prisma;
    constructor(prisma: PrismaService);
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
