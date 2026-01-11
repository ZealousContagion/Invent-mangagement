import { EmployeesService } from './employees.service';
import { Prisma } from '@prisma/client';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(createEmployeeDto: Prisma.EmployeeCreateInput): Promise<{
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
                sku: string;
                name: string;
                description: string | null;
                price: number;
                quantity: number;
                imageUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
                categoryId: string;
            };
        } & {
            id: string;
            quantity: number;
            createdAt: Date;
            type: import("@prisma/client").$Enums.MovementType;
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
    update(id: string, updateEmployeeDto: Prisma.EmployeeUpdateInput): Promise<{
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
