import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  reorderPoint: number;
  targetStockLevel: number;
  imageUrl?: string;
  categoryId: string;
  category: {
    name: string;
  };
  supplierId?: string;
  supplier?: {
    name: string;
  };
  suggestedOrderQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

export const useReorderSuggestions = () => {
  return useQuery({
    queryKey: ['products', 'reorder-suggestions'],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await api.get('/products/reorder-suggestions');
      return data;
    },
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await api.get('/products');
      return data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async (): Promise<Product> => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await api.get('/products/low-stock');
      return data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct: any) => {
      const { data } = await api.post('/products', newProduct);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: responseData } = await api.patch(`/products/${id}`, data);
      return responseData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', data.id] });
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity, type, reason, employeeId }: any) => {
      const { data } = await api.post(`/products/${id}/adjust`, {
        quantity,
        type,
        reason,
        employeeId,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', data.id] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
