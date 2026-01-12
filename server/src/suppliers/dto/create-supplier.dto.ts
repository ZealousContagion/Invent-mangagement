import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    name: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    leadTime?: number;
}
