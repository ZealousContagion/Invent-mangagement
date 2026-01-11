import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Prisma, MovementType } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() data: any) {
    // In a real app, use a DTO for validation
    const { categoryId, imageUrl, ...rest } = data;
    return this.productsService.create({
      ...rest,
      imageUrl,
      category: { connect: { id: categoryId } },
    });
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('low-stock')
  findLowStock() {
    return this.productsService.findLowStock();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.ProductUpdateInput) {
    return this.productsService.update(id, data);
  }

  @Post(':id/adjust')
  adjustStock(
    @Param('id') id: string,
    @Body() body: { quantity: number; type: MovementType; reason?: string; employeeId?: string },
  ) {
    return this.productsService.adjustStock(id, body.quantity, body.type, body.reason, body.employeeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}