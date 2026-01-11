import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.EmployeeCreateInput) {
    try {
      return await this.prisma.employee.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Employee with this email already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.employee.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        movements: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { product: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.EmployeeUpdateInput) {
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}