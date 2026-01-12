import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
export declare class PurchaseOrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updatePurchaseOrderDto: any): Promise<any>;
    private receiveOrder;
    remove(id: string): Promise<any>;
}
