import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { deactivateUser } from '@/api/user';
import { ResponseErr } from '@/types/api';

export const useDeactiveUser = (options?: UseMutationOptions<any, ResponseErr, number>) => {
  return useMutation({
    mutationFn: (user_id: number) => deactivateUser(user_id),
    ...options,
  });
};
