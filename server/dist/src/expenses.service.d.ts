import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from './prisma/prisma.service';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createExpenseDto: CreateExpenseDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<any>;
    remove(id: string): Promise<any>;
}
