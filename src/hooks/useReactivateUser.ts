import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { reactivateUser } from '@/api/user';
import { ResponseErr } from '@/types/api';

export const useReactivateUser = (options?: UseMutationOptions<any, ResponseErr, number>) => {
  return useMutation({
    mutationKey: ['reactivateUser'],
    mutationFn: (user_id: number) => reactivateUser(user_id),
    ...options,
  });
};
