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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const [totalProducts, totalCategories, recentMovements, allProducts, thresholdSetting] = await Promise.all([
            this.prisma.product.count(),
            this.prisma.category.count(),
            this.prisma.stockMovement.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                    },
                },
            }),
            this.prisma.product.findMany({
                select: { price: true, quantity: true }
            }),
            this.prisma.setting.findUnique({
                where: { key: 'lowStockThreshold' }
            })
        ]);
        const lowStockThreshold = thresholdSetting ? parseInt(thresholdSetting.value) : 10;
        const lowStockProducts = allProducts.filter(p => p.quantity < lowStockThreshold).length;
        const totalValue = allProducts.reduce((acc, curr) => {
            return acc + (curr.price * curr.quantity);
        }, 0);
        const categories = await this.prisma.category.findMany({
            include: {
                products: {
                    select: {
                        quantity: true,
                        price: true,
                    }
                }
            }
        });
        const categoryData = categories.map(cat => ({
            name: cat.name,
            value: cat.products.reduce((sum, p) => sum + (p.quantity * p.price), 0),
        })).filter((cat) => cat.value > 0);
        return {
            totalProducts,
            totalCategories,
            lowStockProducts,
            recentMovements,
            totalValue,
            categoryData,
        };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map