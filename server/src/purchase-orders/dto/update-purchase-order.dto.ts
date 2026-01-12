import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export class UpdatePurchaseOrderDto {
    @IsEnum(['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'])
    @IsOptional()
    status?: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';

    @IsDateString()
    @IsOptional()
    expectedDate?: string;
}
