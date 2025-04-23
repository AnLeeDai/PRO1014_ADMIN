import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAllProduct, GetAllProductResponse } from '@/api/product';

export const useProduct = (
  category_id?: number,
  search?: string,
  min_price?: number,
  max_price?: number,
  brand?: string,
  page: number = 1
): UseQueryResult<GetAllProductResponse, Error> => {
  return useQuery<GetAllProductResponse, Error>({
    queryKey: ['user-product', { category_id, search, min_price, max_price, brand, page }],
    queryFn: () => getAllProduct(category_id, search, min_price, max_price, brand, page),
  });
};
