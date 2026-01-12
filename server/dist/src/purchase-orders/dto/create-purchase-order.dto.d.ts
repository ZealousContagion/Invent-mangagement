declare class PurchaseOrderItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreatePurchaseOrderDto {
    supplierId: string;
    expectedDate?: string;
    items: PurchaseOrderItemDto[];
}
export {};
