import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseOrderItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    unitPrice: number;
}

export class CreatePurchaseOrderDto {
    @IsString()
    @IsNotEmpty()
    supplierId: string;

    @IsDateString()
    @IsOptional()
    expectedDate?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PurchaseOrderItemDto)
    items: PurchaseOrderItemDto[];
}
