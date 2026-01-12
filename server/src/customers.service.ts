import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  async create(createCustomerDto: CreateCustomerDto) {
    return (this.prisma as any).customer.create({
      data: createCustomerDto,
    });
  }

  async findAll() {
    return (this.prisma as any).customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const customer = await (this.prisma as any).customer.findUnique({
      where: { id },
      include: { orders: true },
    });
    if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    await this.findOne(id);
    return (this.prisma as any).customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma as any).customer.delete({
      where: { id },
    });
  }
}
