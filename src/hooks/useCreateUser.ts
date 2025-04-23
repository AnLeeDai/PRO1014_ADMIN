import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { createUser, CreateUserReq, CreateUserResponse } from '@/api/user';
import { ResponseErr } from '@/types/api';

export const useCreateUser = (
  options?: UseMutationOptions<CreateUserResponse, ResponseErr, CreateUserReq>
) => {
  return useMutation({
    mutationFn: (user: CreateUserReq) => createUser(user),
    ...options,
  });
};
