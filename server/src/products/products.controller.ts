import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    const { categoryId, supplierId, imageUrl, ...rest } = createProductDto;
    return this.productsService.create({
      ...rest,
      imageUrl,
      category: { connect: { id: categoryId } },
      ...(supplierId ? { supplier: { connect: { id: supplierId } } } : {}),
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

  @Get('reorder-suggestions')
  getReorderSuggestions() {
    return this.productsService.getReorderSuggestions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const { categoryId, supplierId, ...rest } = updateProductDto;
    return this.productsService.update(id, {
      ...rest,
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      ...(supplierId ? { supplier: { connect: { id: supplierId } } } : { supplier: { disconnect: true } }),
    });
  }

  @Post(':id/adjust')
  adjustStock(
    @Param('id') id: string,
    @Body() adjustStockDto: AdjustStockDto,
  ) {
    const { quantity, type, reason, employeeId } = adjustStockDto;
    return this.productsService.adjustStock(id, quantity, type, reason, employeeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}