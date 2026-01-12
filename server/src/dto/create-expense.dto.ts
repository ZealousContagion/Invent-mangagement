import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateExpenseDto {
    @IsString()
    description: string;

    @IsNumber()
    amount: number;

    @IsString()
    category: string;

    @IsOptional()
    @IsDateString()
    date?: string;
}
