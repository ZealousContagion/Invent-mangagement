import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.stockMovement.findMany({
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        employee: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}