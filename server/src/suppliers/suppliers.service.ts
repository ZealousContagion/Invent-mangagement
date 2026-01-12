import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) { }

    // Create a new supplier

    async create(createSupplierDto: CreateSupplierDto) {
        return (this.prisma as any).supplier.create({
            data: createSupplierDto,
        });
    }

    async findAll() {
        return (this.prisma as any).supplier.findMany({
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const supplier = await (this.prisma as any).supplier.findUnique({
            where: { id },
            include: { products: true },
        });
        if (!supplier) {
            throw new NotFoundException(`Supplier with ID ${id} not found`);
        }
        return supplier;
    }

    async update(id: string, updateSupplierDto: UpdateSupplierDto) {
        try {
            return await (this.prisma as any).supplier.update({
                where: { id },
                data: updateSupplierDto,
            });
        } catch (error) {
            throw new NotFoundException(`Supplier with ID ${id} not found`);
        }
    }

    async remove(id: string) {
        try {
            return await (this.prisma as any).supplier.delete({
                where: { id },
            });
        } catch (error) {
            throw new NotFoundException(`Supplier with ID ${id} not found`);
        }
    }
}
