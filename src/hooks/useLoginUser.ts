import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { loginUser } from '@/api/auth';
import { ResponseErr } from '@/types/api';

interface LoginParams {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    user_id: number;
    username: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string;
  };
  expires_in: number;
}

export const useLoginUser = (
  options?: UseMutationOptions<LoginResponse, ResponseErr, LoginParams>
) => {
  return useMutation({
    mutationFn: ({ username, password }: LoginParams) => loginUser(username, password),
    ...options,
  });
};
