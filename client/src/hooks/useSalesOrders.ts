import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type SOStatus = 'DRAFT' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface SalesOrderItem {
    id: string;
    productId: string;
    product: {
        name: string;
        sku: string;
    };
    quantity: number;
    unitPrice: number;
}

export interface SalesOrder {
    id: string;
    orderNumber: string;
    customerId: string;
    customer: {
        name: string;
    };
    status: SOStatus;
    items: SalesOrderItem[];
    totalAmount: number;
    date: string;
    shippedDate?: string;
    createdAt: string;
    updatedAt: string;
}

export const useSalesOrders = () => {
    return useQuery({
        queryKey: ['sales-orders'],
        queryFn: async (): Promise<SalesOrder[]> => {
            const { data } = await api.get('/sales-orders');
            return data;
        },
    });
};

export const useCreateSalesOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: responseData } = await api.post('/sales-orders', data);
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useUpdateSalesOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: responseData } = await api.patch(`/sales-orders/${id}`, data);
            return responseData;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useDeleteSalesOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/sales-orders/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
        },
    });
};
