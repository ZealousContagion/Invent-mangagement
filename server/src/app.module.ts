import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { StatsModule } from './stats/stats.module';
import { UploadsController } from './uploads/uploads.controller';
import { EmployeesModule } from './employees/employees.module';
import { SettingsModule } from './settings/settings.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { ExpensesModule } from './expenses.module';
import { SalesOrdersModule } from './sales-orders.module';
import { CustomersModule } from './customers.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    ProductsModule,
    CategoriesModule,
    StockMovementsModule,
    StatsModule,
    EmployeesModule,
    SettingsModule,
    SuppliersModule,
    ExpensesModule,
    SalesOrdersModule,
    CustomersModule,
  ],
  controllers: [AppController, UploadsController],
  providers: [AppService],
})
export class AppModule { }
