import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getOrders, GetOrdersResponse } from '@/api/orders';

export const useOrders = (
  search?: string,
  status?: string,
  page: number = 1
): UseQueryResult<GetOrdersResponse, Error> => {
  return useQuery<GetOrdersResponse, Error>({
    queryKey: ['orders', { search, status, page }],
    queryFn: () => getOrders(search, status, page),
  });
};
