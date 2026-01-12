import { MovementType } from '@prisma/client';
export declare class AdjustStockDto {
    quantity: number;
    type: MovementType;
    reason?: string;
    employeeId?: string;
}
