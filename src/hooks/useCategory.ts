import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAllCategory, GetAllCategoryResponse } from '@/api/category';

export const useCategory = (): UseQueryResult<GetAllCategoryResponse, Error> => {
  return useQuery<GetAllCategoryResponse, Error>({
    queryKey: ['all-category'],
    queryFn: () => getAllCategory(),
  });
};
