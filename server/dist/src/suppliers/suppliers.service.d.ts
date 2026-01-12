import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSupplierDto: CreateSupplierDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<any>;
    remove(id: string): Promise<any>;
}
