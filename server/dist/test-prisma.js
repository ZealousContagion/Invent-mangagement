"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
require("dotenv/config");
async function main() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    const prisma = new client_1.PrismaClient({});
    try {
        await prisma.$connect();
        console.log('Connected successfully!');
        await prisma.$disconnect();
    }
    catch (e) {
        console.error('Connection failed:', e);
    }
}
main();
//# sourceMappingURL=test-prisma.js.map