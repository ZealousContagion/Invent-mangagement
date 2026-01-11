import { PrismaService } from '../prisma/prisma.service';
import { Prisma, MovementType } from '@prisma/client';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.ProductCreateInput): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string | null;
        price: number;
        quantity: number;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    }>;
    findAll(): Promise<({
        category: {
            name: string;
        };
    } & {
        id: string;
        sku: string;
        name: string;
        description: string | null;
        price: number;
        quantity: number;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    })[]>;
    findLowStock(): Promise<({
        category: {
            name: string;
        };
    } & {
        id: string;
        sku: string;
        name: string;
        description: string | null;
        price: number;
        quantity: number;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        movements: {
            id: string;
            quantity: number;
            createdAt: Date;
            type: import("@prisma/client").$Enums.MovementType;
            reason: string | null;
            productId: string;
            employeeId: string | null;
        }[];
    } & {
        id: string;
        sku: string;
        name: string;
        description: string | null;
        price: number;
        quantity: number;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    }>;
    update(id: string, data: Prisma.ProductUpdateInput): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string | null;
        price: number;
        quantity: number;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    }>;
    adjustStock(id: string, quantity: number, type: MovementType, reason?: string, employeeId?: string): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string | null;
        price: number;
        quantity: number;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string | null;
        price: number;
        quantity: number;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    }>;
}
