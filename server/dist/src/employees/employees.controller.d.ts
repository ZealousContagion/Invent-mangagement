import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(createEmployeeDto: CreateEmployeeDto): Promise<{
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
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<{
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
