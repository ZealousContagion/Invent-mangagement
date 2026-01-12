import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { PrismaService } from './prisma/prisma.service';
export declare class SalesOrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSalesOrderDto: CreateSalesOrderDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSalesOrderDto: any): Promise<any>;
    private shipOrder;
    remove(id: string): Promise<any>;
}
