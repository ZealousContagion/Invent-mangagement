import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Stats {
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: number;
  recentMovements: number;
  totalValue: number;
  categoryData: { name: string; value: number }[];
}

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async (): Promise<Stats> => {
      const { data } = await api.get('/stats');
      return data;
    },
  });
};
