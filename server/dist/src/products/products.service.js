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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        try {
            const product = await this.prisma.product.create({ data });
            if (product.quantity > 0) {
                await this.prisma.stockMovement.create({
                    data: {
                        productId: product.id,
                        quantity: product.quantity,
                        type: client_1.MovementType.IN,
                        reason: 'Initial stock',
                    },
                });
            }
            return product;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Product with this SKU already exists');
            }
            throw error;
        }
    }
    async findAll() {
        return this.prisma.product.findMany({
            include: {
                category: {
                    select: { name: true },
                },
            },
        });
    }
    async findLowStock() {
        return this.prisma.product.findMany({
            where: {
                quantity: {
                    lt: 10,
                },
            },
            include: {
                category: {
                    select: { name: true },
                },
            },
        });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                movements: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async update(id, data) {
        try {
            return await this.prisma.product.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            throw error;
        }
    }
    async adjustStock(id, quantity, type, reason, employeeId) {
        const product = await this.findOne(id);
        let effectiveType = type;
        let effectiveQuantityChange = 0;
        if (type === client_1.MovementType.IN || type === client_1.MovementType.CHECK_IN) {
            effectiveQuantityChange = quantity;
        }
        else if (type === client_1.MovementType.OUT || type === client_1.MovementType.CHECK_OUT) {
            effectiveQuantityChange = -quantity;
        }
        else {
            effectiveQuantityChange = quantity - product.quantity;
        }
        const newQuantity = product.quantity + effectiveQuantityChange;
        const finalQuantity = type === client_1.MovementType.ADJUSTMENT ? quantity : product.quantity + effectiveQuantityChange;
        const [updatedProduct] = await this.prisma.$transaction([
            this.prisma.product.update({
                where: { id },
                data: { quantity: finalQuantity },
            }),
            this.prisma.stockMovement.create({
                data: {
                    productId: id,
                    quantity: type === client_1.MovementType.ADJUSTMENT ? quantity - product.quantity : quantity,
                    type,
                    reason,
                    employeeId,
                },
            }),
        ]);
        return updatedProduct;
    }
    async remove(id) {
        try {
            return await this.prisma.product.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            throw error;
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map