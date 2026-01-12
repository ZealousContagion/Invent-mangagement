"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const { POStatus, MovementType } = require('@prisma/client');
let PurchaseOrdersService = class PurchaseOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPurchaseOrderDto) {
        const { supplierId, items, expectedDate } = createPurchaseOrderDto;
        const count = await this.prisma.purchaseOrder.count();
        const orderNumber = `PO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
        const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        return this.prisma.purchaseOrder.create({
            data: {
                orderNumber,
                supplier: { connect: { id: supplierId } },
                status: POStatus.DRAFT,
                totalAmount,
                expectedDate: expectedDate ? new Date(expectedDate) : null,
                items: {
                    create: items.map((item) => ({
                        product: { connect: { id: item.productId } },
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    })),
                },
            },
            include: {
                items: {
                    include: { product: { select: { name: true, sku: true } } },
                },
                supplier: { select: { name: true } },
            },
        });
    }
    async findAll() {
        return this.prisma.purchaseOrder.findMany({
            include: {
                supplier: { select: { name: true } },
                _count: { select: { items: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: { select: { name: true, sku: true } } },
                },
                supplier: true,
            },
        });
        if (!po)
            throw new common_1.NotFoundException(`Purchase Order with ID ${id} not found`);
        return po;
    }
    async update(id, updatePurchaseOrderDto) {
        const currentPO = await this.findOne(id);
        if (currentPO.status === POStatus.RECEIVED) {
            throw new common_1.BadRequestException('Cannot update a received Purchase Order');
        }
        if (updatePurchaseOrderDto.status === POStatus.RECEIVED) {
            return this.receiveOrder(id);
        }
        const { items, supplierId, expectedDate, status } = updatePurchaseOrderDto;
        let totalAmount = currentPO.totalAmount;
        if (items) {
            totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        }
        return this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                status,
                expectedDate: expectedDate ? new Date(expectedDate) : undefined,
                supplierId,
                totalAmount,
                items: items ? {
                    deleteMany: {},
                    create: items.map((item) => ({
                        product: { connect: { id: item.productId } },
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    })),
                } : undefined,
            },
            include: {
                items: {
                    include: { product: { select: { name: true, sku: true } } },
                },
                supplier: { select: { name: true } },
            },
        });
    }
    async receiveOrder(id) {
        return this.prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.findUnique({
                where: { id },
                include: { items: true },
            });
            if (!po || po.status === POStatus.RECEIVED) {
                throw new common_1.BadRequestException('Order already received or not found');
            }
            const updatedPO = await tx.purchaseOrder.update({
                where: { id },
                data: {
                    status: POStatus.RECEIVED,
                    receivedDate: new Date(),
                },
            });
            for (const item of po.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: { increment: item.quantity },
                    },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        quantity: item.quantity,
                        type: MovementType.IN,
                        reason: `Received from Purchase Order ${po.orderNumber}`,
                    },
                });
            }
            return updatedPO;
        });
    }
    async remove(id) {
        const po = await this.findOne(id);
        if (po.status === POStatus.RECEIVED) {
            throw new common_1.BadRequestException('Cannot delete a received Purchase Order');
        }
        return this.prisma.purchaseOrder.delete({ where: { id } });
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map