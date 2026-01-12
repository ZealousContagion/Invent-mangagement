import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reorderPoint?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  targetStockLevel?: number;

  @IsUUID()
  @IsOptional()
  supplierId?: string;
}
