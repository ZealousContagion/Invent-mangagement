import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

    async getDashboardStats() {

      const [

        totalProducts,

        totalCategories,

        lowStockProducts,

        recentMovements,

        inventoryValue

      ] = await Promise.all([

        this.prisma.product.count(),

        this.prisma.category.count(),

        this.prisma.product.count({

          where: {

            quantity: {

              lt: 10, // Threshold for low stock

            },

          },

        }),

        this.prisma.stockMovement.count({

          where: {

            createdAt: {

              gte: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days

            },

          },

        }),

        this.prisma.product.aggregate({

          _sum: {

            price: true, // This is just sum of prices, we need price * quantity

          }

        })

      ]);

  

      // Prisma doesn't support sum(price * quantity) directly in aggregate without raw query

      // So we fetch all products to calculate value accurately (robustness over simple sum)

      const allProducts = await this.prisma.product.findMany({

        select: { price: true, quantity: true }

      });

      

      const totalValue = allProducts.reduce((acc, curr) => {

        return acc + (curr.price * curr.quantity);

      }, 0);

  

      return {

        totalProducts,

        totalCategories,

        lowStockProducts,

        recentMovements,

        totalValue,

      };

    }

  }

  