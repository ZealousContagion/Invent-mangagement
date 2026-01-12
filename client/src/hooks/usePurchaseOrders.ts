import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type POStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
    id: string;
    productId: string;
    product: {
        name: string;
        sku: string;
    };
    quantity: number;
    unitPrice: number;
}

export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    supplierId: string;
    supplier: {
        name: string;
    };
    status: POStatus;
    items: PurchaseOrderItem[];
    totalAmount: number;
    expectedDate?: string;
    receivedDate?: string;
    createdAt: string;
    updatedAt: string;
}

export const usePurchaseOrders = () => {
    return useQuery({
        queryKey: ['purchase-orders'],
        queryFn: async (): Promise<PurchaseOrder[]> => {
            const { data } = await api.get('/purchase-orders');
            return data;
        },
    });
};

export const usePurchaseOrder = (id: string) => {
    return useQuery({
        queryKey: ['purchase-orders', id],
        queryFn: async (): Promise<PurchaseOrder> => {
            const { data } = await api.get(`/purchase-orders/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCreatePurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: responseData } = await api.post('/purchase-orders', data);
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        },
    });
};

export const useUpdatePurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: responseData } = await api.patch(`/purchase-orders/${id}`, data);
            return responseData;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', data.id] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Stock might have changed
            queryClient.invalidateQueries({ queryKey: ['movements'] });
        },
    });
};
export const useDeletePurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/purchase-orders/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        },
    });
};
