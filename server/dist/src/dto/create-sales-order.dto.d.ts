declare class SalesOrderItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateSalesOrderDto {
    customerId: string;
    items: SalesOrderItemDto[];
    date?: string;
}
export {};
