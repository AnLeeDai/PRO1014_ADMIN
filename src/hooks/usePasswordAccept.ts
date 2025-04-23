import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { processPasswordRequest } from '@/api/user';
import { ResponseErr } from '@/types/api';

export const usePasswordAccept = (
  request_id: number,
  action: string
): UseQueryResult<any, ResponseErr> => {
  return useQuery({
    queryKey: ['password-accept', { request_id, action }],
    queryFn: () => processPasswordRequest(request_id, action),
  });
};
