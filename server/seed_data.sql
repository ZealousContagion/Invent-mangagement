-- 1. Create EXTENSION uuid-ossp if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clear existing data
DELETE FROM "StockMovement";
DELETE FROM "Product";
DELETE FROM "Category";
DELETE FROM "Employee";
DELETE FROM "Setting";

-- 3. Seed Categories
INSERT INTO "Category" (id, name, description, "createdAt", "updatedAt") VALUES
('electronics-id', 'Electronics', 'Gadgets, devices and tech gear', NOW(), NOW()),
('furniture-id', 'Furniture', 'Office and warehouse furniture', NOW(), NOW()),
('office-supplies-id', 'Office Supplies', 'Stationery and daily essentials', NOW(), NOW());

-- 4. Seed Employees
INSERT INTO "Employee" (id, name, email, department, "createdAt", "updatedAt") VALUES
('employee-alice-id', 'Alice Smith', 'alice@company.com', 'Engineering', NOW(), NOW()),
('employee-bob-id', 'Bob Johnson', 'bob@company.com', 'Operations', NOW(), NOW());

-- 5. Seed Products
INSERT INTO "Product" (id, sku, name, description, price, quantity, "imageUrl", "categoryId", "createdAt", "updatedAt") VALUES
('product-macbook-id', 'LAP-001', 'MacBook Pro 14"', 'M2 Chip, 16GB RAM', 1999.99, 15, NULL, 'electronics-id', NOW(), NOW()),
('product-monitor-id', 'MON-002', 'Dell UltraSharp 27"', '4K UHD Monitor', 549.50, 8, NULL, 'electronics-id', NOW(), NOW()),
('product-chair-id', 'CHAIR-003', 'Ergonomic Office Chair', 'Mesh back with lumbar support', 299.00, 25, NULL, 'furniture-id', NOW(), NOW()),
('product-pen-id', 'PEN-004', 'Premium Gel Pens', 'Box of 12, Black ink', 15.00, 100, NULL, 'office-supplies-id', NOW(), NOW()),
('product-keyboard-id', 'KEY-005', 'Mechanical Keyboard', 'RGB Backlit, Brown Switches', 120.00, 3, NULL, 'electronics-id', NOW(), NOW());

-- 6. Create initial Stock Movements for products
INSERT INTO "StockMovement" (id, "productId", quantity, type, reason, "createdAt") VALUES
(gen_random_uuid(), 'product-macbook-id', 15, 'IN', 'Initial seed stock', NOW()),
(gen_random_uuid(), 'product-monitor-id', 8, 'IN', 'Initial seed stock', NOW()),
(gen_random_uuid(), 'product-chair-id', 25, 'IN', 'Initial seed stock', NOW()),
(gen_random_uuid(), 'product-pen-id', 100, 'IN', 'Initial seed stock', NOW()),
(gen_random_uuid(), 'product-keyboard-id', 3, 'IN', 'Initial seed stock', NOW());

-- 7. Seed some recent specific movements (MacBook CHECK_OUT)
INSERT INTO "StockMovement" (id, "productId", "employeeId", quantity, type, reason, "createdAt") VALUES
(gen_random_uuid(), 'product-macbook-id', 'employee-alice-id', 1, 'CHECK_OUT', 'New hire equipment', NOW());

-- Update MacBook quantity after CHECK_OUT
UPDATE "Product" SET quantity = quantity - 1 WHERE id = 'product-macbook-id';

-- 8. Seed Settings
INSERT INTO "Setting" (id, key, value, "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'companyName', 'Nexus Inventory Systems', NOW(), NOW()),
(gen_random_uuid(), 'supportEmail', 'ops@nexus.com', NOW(), NOW()),
(gen_random_uuid(), 'currency', '$', NOW(), NOW()),
(gen_random_uuid(), 'lowStockThreshold', '10', NOW(), NOW());
