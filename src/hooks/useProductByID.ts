import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GetAllProductByIDResponse, getProductByID } from '@/api/product';

export const useProductByID = (id?: number): UseQueryResult<GetAllProductByIDResponse, Error> => {
  return useQuery<GetAllProductByIDResponse, Error>({
    queryKey: ['product-by-id', id],
    queryFn: () => getProductByID(id),
    enabled: !!id && id > 0,
  });
};
