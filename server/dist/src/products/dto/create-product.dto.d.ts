export declare class CreateProductDto {
    sku: string;
    name: string;
    description?: string;
    price: number;
    quantity?: number;
    imageUrl?: string;
    categoryId: string;
    reorderPoint?: number;
    targetStockLevel?: number;
    supplierId?: string;
}
