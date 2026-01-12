import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    createdAt: string;
    updatedAt: string;
}

export const useExpenses = () => {
    return useQuery({
        queryKey: ['expenses'],
        queryFn: async (): Promise<Expense[]> => {
            const { data } = await api.get('/expenses');
            return data;
        },
    });
};

export const useCreateExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: responseData } = await api.post('/expenses', data);
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: responseData } = await api.patch(`/expenses/${id}`, data);
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/expenses/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};
