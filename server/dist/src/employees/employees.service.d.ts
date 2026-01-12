import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class EmployeesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.EmployeeCreateInput): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        department: string;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        department: string;
    }[]>;
    findOne(id: string): Promise<({
        movements: ({
            product: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                sku: string;
                price: number;
                quantity: number;
                reorderPoint: number;
                targetStockLevel: number;
                imageUrl: string | null;
                categoryId: string;
                supplierId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            type: import(".prisma/client").$Enums.MovementType;
            reason: string | null;
            productId: string;
            employeeId: string | null;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        department: string;
    }) | null>;
    update(id: string, data: Prisma.EmployeeUpdateInput): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        department: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        department: string;
    }>;
}
