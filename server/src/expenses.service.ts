import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) { }

  async create(createExpenseDto: CreateExpenseDto) {
    return (this.prisma as any).expense.create({
      data: {
        ...createExpenseDto,
        date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
      },
    });
  }

  async findAll() {
    return (this.prisma as any).expense.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const expense = await (this.prisma as any).expense.findUnique({
      where: { id },
    });
    if (!expense) throw new NotFoundException(`Expense with ID ${id} not found`);
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(id);
    return (this.prisma as any).expense.update({
      where: { id },
      data: {
        ...updateExpenseDto,
        date: updateExpenseDto.date ? new Date(updateExpenseDto.date) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma as any).expense.delete({
      where: { id },
    });
  }
}
