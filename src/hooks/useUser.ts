import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getUser, GetUserResponse } from '@/api/user';

export const useUser = (): UseQueryResult<GetUserResponse, Error> => {
  return useQuery<GetUserResponse, Error>({
    queryKey: ['all-users'],
    queryFn: getUser,
  });
};
