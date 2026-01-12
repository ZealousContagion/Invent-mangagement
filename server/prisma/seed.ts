import 'dotenv/config';
import { PrismaClient, MovementType } from '@prisma/client';

const prisma = new PrismaClient({});

async function main() {
  console.log('Starting seed...');

  // 1. Clear existing data
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.setting.deleteMany();

  // 2. Seed Categories
  const catElectronics = await prisma.category.create({
    data: { name: 'Electronics', description: 'Gadgets, devices and tech gear' },
  });
  const catFurniture = await prisma.category.create({
    data: { name: 'Furniture', description: 'Office and warehouse furniture' },
  });
  const catSupplies = await prisma.category.create({
    data: { name: 'Office Supplies', description: 'Stationery and daily essentials' },
  });

  // 3. Seed Employees
  const emp1 = await prisma.employee.create({
    data: { name: 'Alice Smith', email: 'alice@company.com', department: 'Engineering' },
  });
  const emp2 = await prisma.employee.create({
    data: { name: 'Bob Johnson', email: 'bob@company.com', department: 'Operations' },
  });

  // 4. Seed Products
  const products = [
    {
      sku: 'LAP-001',
      name: 'MacBook Pro 14"',
      description: 'M2 Chip, 16GB RAM',
      price: 1999.99,
      quantity: 15,
      categoryId: catElectronics.id,
    },
    {
      sku: 'MON-002',
      name: 'Dell UltraSharp 27"',
      description: '4K UHD Monitor',
      price: 549.50,
      quantity: 8, // Low stock alert!
      categoryId: catElectronics.id,
    },
    {
      sku: 'CHAIR-003',
      name: 'Ergonomic Office Chair',
      description: 'Mesh back with lumbar support',
      price: 299.00,
      quantity: 25,
      categoryId: catFurniture.id,
    },
    {
      sku: 'PEN-004',
      name: 'Premium Gel Pens',
      description: 'Box of 12, Black ink',
      price: 15.00,
      quantity: 100,
      categoryId: catSupplies.id,
    },
    {
      sku: 'KEY-005',
      name: 'Mechanical Keyboard',
      description: 'RGB Backlit, Brown Switches',
      price: 120.00,
      quantity: 3, // Low stock alert!
      categoryId: catElectronics.id,
    },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: p,
    });

    // Create initial stock movements
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantity: p.quantity,
        type: MovementType.IN,
        reason: 'Initial seed stock',
      },
    });
  }

  // 5. Seed some recent specific movements
  const macbook = await prisma.product.findUnique({ where: { sku: 'LAP-001' } });
  if (macbook) {
    await prisma.stockMovement.create({
      data: {
        productId: macbook.id,
        employeeId: emp1.id,
        quantity: 1,
        type: MovementType.CHECK_OUT,
        reason: 'New hire equipment',
      },
    });
    // Update quantity
    await prisma.product.update({
      where: { id: macbook.id },
      data: { quantity: { decrement: 1 } },
    });
  }

  // 6. Seed Settings
  const settings = [
    { key: 'companyName', value: 'Nexus Inventory Systems' },
    { key: 'supportEmail', value: 'ops@nexus.com' },
    { key: 'currency', value: '$' },
    { key: 'lowStockThreshold', value: '10' },
  ];

  for (const s of settings) {
    await prisma.setting.create({ data: s });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
