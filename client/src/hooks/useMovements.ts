import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface StockMovement {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
  };
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason?: string;
  employeeId?: string;
  employee?: {
    name: string;
  };
  createdAt: string;
}

export const useMovements = () => {
  return useQuery({
    queryKey: ['movements'],
    queryFn: async (): Promise<StockMovement[]> => {
      const { data } = await api.get('/stock-movements');
      return data;
    },
  });
};
