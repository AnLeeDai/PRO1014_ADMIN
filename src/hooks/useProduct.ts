import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAllProduct, GetAllProductResponse } from '@/api/product';

export const useProduct = (): UseQueryResult<GetAllProductResponse, Error> => {
  return useQuery<GetAllProductResponse, Error>({
    queryKey: ['all-products'],
    queryFn: () => getAllProduct(),
  });
};
