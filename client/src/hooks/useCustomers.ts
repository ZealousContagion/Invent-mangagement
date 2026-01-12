import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

export const useCustomers = () => {
    return useQuery({
        queryKey: ['customers'],
        queryFn: async (): Promise<Customer[]> => {
            const { data } = await api.get('/customers');
            return data;
        },
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: responseData } = await api.post('/customers', data);
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: responseData } = await api.patch(`/customers/${id}`, data);
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/customers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};
