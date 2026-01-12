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
exports.SalesOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const { SOStatus, MovementType } = require('@prisma/client');
let SalesOrdersService = class SalesOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSalesOrderDto) {
        const { customerId, items, date } = createSalesOrderDto;
        const count = await this.prisma.salesOrder.count();
        const orderNumber = `SO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
        const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        return this.prisma.salesOrder.create({
            data: {
                orderNumber,
                customer: { connect: { id: customerId } },
                status: SOStatus.DRAFT,
                totalAmount,
                date: date ? new Date(date) : new Date(),
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
                customer: { select: { name: true } },
            },
        });
    }
    async findAll() {
        return this.prisma.salesOrder.findMany({
            include: {
                customer: { select: { name: true } },
                _count: { select: { items: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const so = await this.prisma.salesOrder.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: { select: { name: true, sku: true, quantity: true } } },
                },
                customer: true,
            },
        });
        if (!so)
            throw new common_1.NotFoundException(`Sales Order with ID ${id} not found`);
        return so;
    }
    async update(id, updateSalesOrderDto) {
        const currentSO = await this.findOne(id);
        if (currentSO.status === SOStatus.SHIPPED || currentSO.status === SOStatus.DELIVERED) {
            if (updateSalesOrderDto.status !== SOStatus.CANCELLED) {
                throw new common_1.BadRequestException('Cannot edit a shipped/delivered order except to cancel it');
            }
        }
        if (updateSalesOrderDto.status === SOStatus.SHIPPED && currentSO.status !== SOStatus.SHIPPED) {
            return this.shipOrder(id);
        }
        const { items, customerId, date, status } = updateSalesOrderDto;
        let totalAmount = currentSO.totalAmount;
        if (items) {
            totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        }
        return this.prisma.salesOrder.update({
            where: { id },
            data: {
                status,
                date: date ? new Date(date) : undefined,
                customerId,
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
                customer: { select: { name: true } },
            },
        });
    }
    async shipOrder(id) {
        return this.prisma.$transaction(async (tx) => {
            const so = await tx.salesOrder.findUnique({
                where: { id },
                include: { items: { include: { product: true } } },
            });
            if (!so || so.status === SOStatus.SHIPPED || so.status === SOStatus.DELIVERED) {
                throw new common_1.BadRequestException('Order already shipped or not found');
            }
            for (const item of so.items) {
                if (item.product.quantity < item.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product: ${item.product.name}. Required: ${item.quantity}, Available: ${item.product.quantity}`);
                }
            }
            const updatedSO = await tx.salesOrder.update({
                where: { id },
                data: {
                    status: SOStatus.SHIPPED,
                    shippedDate: new Date(),
                },
            });
            for (const item of so.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: { decrement: item.quantity },
                    },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        quantity: -item.quantity,
                        type: MovementType.OUT,
                        reason: `Shipped for Sales Order ${so.orderNumber}`,
                    },
                });
            }
            return updatedSO;
        });
    }
    async remove(id) {
        const so = await this.findOne(id);
        if (so.status === SOStatus.SHIPPED || so.status === SOStatus.DELIVERED) {
            throw new common_1.BadRequestException('Cannot delete a shipped or delivered order');
        }
        return this.prisma.salesOrder.delete({ where: { id } });
    }
};
exports.SalesOrdersService = SalesOrdersService;
exports.SalesOrdersService = SalesOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesOrdersService);
//# sourceMappingURL=sales-orders.service.js.map