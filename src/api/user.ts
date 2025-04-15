import axiosInstance from '@/api/axiosInstance';

export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  avatar_url: string;
  password_changed_at: null;
  created_at: string;
  role: string;
  is_active: number;
}

export interface GetUserResponse {
  success: boolean;
  message: string;
  data: User[];
}

export interface GetUserInfoResponse {
  user: User;
}

export const getUser = async (): Promise<GetUserResponse> => {
  const res = await axiosInstance.get(`?request=get-users`);

  return res.data;
};

export const getUserInfo = async (userId: number): Promise<GetUserInfoResponse> => {
  const res = await axiosInstance.get(`?request=get-user-by-id&id=${userId}`);

  return res.data;
};
