import { IsNumber, IsEnum, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { MovementType } from '@prisma/client';

export class AdjustStockDto {
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsUUID()
  @IsOptional()
  employeeId?: string;
}
