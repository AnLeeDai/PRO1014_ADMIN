import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { CreateUserResponse, editUser, EditUserReq } from '@/api/user';
import { ResponseErr } from '@/types/api';

export const useEditUser = (
  options?: UseMutationOptions<CreateUserResponse, ResponseErr, EditUserReq>
) => {
  return useMutation({
    mutationFn: (user: EditUserReq) => editUser(user),
    ...options,
  });
};
