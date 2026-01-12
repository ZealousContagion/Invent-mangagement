import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface StockMovement {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT" | "CHECK_IN" | "CHECK_OUT";
  quantity: number;
  reason: string;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  };
  employee?: {
    name: string;
  };
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
