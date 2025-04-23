import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getPasswordRequest, GetPasswordRequestResponse } from '@/api/user';

export const usePasswordRequests = (
  search?: string,
  status?: string,
  page: number = 1
): UseQueryResult<GetPasswordRequestResponse, Error> => {
  return useQuery<GetPasswordRequestResponse, Error>({
    queryKey: ['password-requests', { search, status, page }],
    queryFn: () => getPasswordRequest(search, status, page),
  });
};
