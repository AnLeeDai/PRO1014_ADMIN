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

export interface CreateUserReq {
  username: string;
  password: string;
  password_confirm: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  address: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
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
  };
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

export const createUser = async (user: CreateUserReq): Promise<CreateUserResponse> => {
  const res = await axiosInstance.post(`?request=create-user`, user);

  return res.data;
};
