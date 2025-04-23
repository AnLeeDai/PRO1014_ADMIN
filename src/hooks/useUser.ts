import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getUser, GetUserResponse } from '@/api/user';

export const useUser = (
  search?: string,
  status?: string,
  page: number = 1
): UseQueryResult<GetUserResponse, Error> => {
  return useQuery<GetUserResponse, Error>({
    queryKey: ['user', { search, status, page }],
    queryFn: () => getUser(search, status, page),
  });
};
