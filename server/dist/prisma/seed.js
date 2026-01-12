"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({});
async function main() {
    console.log('Starting seed...');
    await prisma.stockMovement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.setting.deleteMany();
    const catElectronics = await prisma.category.create({
        data: { name: 'Electronics', description: 'Gadgets, devices and tech gear' },
    });
    const catFurniture = await prisma.category.create({
        data: { name: 'Furniture', description: 'Office and warehouse furniture' },
    });
    const catSupplies = await prisma.category.create({
        data: { name: 'Office Supplies', description: 'Stationery and daily essentials' },
    });
    const emp1 = await prisma.employee.create({
        data: { name: 'Alice Smith', email: 'alice@company.com', department: 'Engineering' },
    });
    const emp2 = await prisma.employee.create({
        data: { name: 'Bob Johnson', email: 'bob@company.com', department: 'Operations' },
    });
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
            quantity: 8,
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
            quantity: 3,
            categoryId: catElectronics.id,
        },
    ];
    for (const p of products) {
        const product = await prisma.product.create({
            data: p,
        });
        await prisma.stockMovement.create({
            data: {
                productId: product.id,
                quantity: p.quantity,
                type: client_1.MovementType.IN,
                reason: 'Initial seed stock',
            },
        });
    }
    const macbook = await prisma.product.findUnique({ where: { sku: 'LAP-001' } });
    if (macbook) {
        await prisma.stockMovement.create({
            data: {
                productId: macbook.id,
                employeeId: emp1.id,
                quantity: 1,
                type: client_1.MovementType.CHECK_OUT,
                reason: 'New hire equipment',
            },
        });
        await prisma.product.update({
            where: { id: macbook.id },
            data: { quantity: { decrement: 1 } },
        });
    }
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
//# sourceMappingURL=seed.js.map