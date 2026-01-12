import { IsString, IsArray, IsNumber, ValidateNested, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class SalesOrderItemDto {
    @IsString()
    productId: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    unitPrice: number;
}

export class CreateSalesOrderDto {
    @IsString()
    customerId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SalesOrderItemDto)
    items: SalesOrderItemDto[];

    @IsOptional()
    @IsDateString()
    date?: string;
}
