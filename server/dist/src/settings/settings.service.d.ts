import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    update(key: string, value: string): Promise<any>;
    updateMany(settings: {
        key: string;
        value: string;
    }[]): Promise<any>;
}
