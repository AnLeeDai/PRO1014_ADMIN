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

export interface EditUserReq {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
}

export interface GetUserResponse {
  success: boolean;
  message: string;
  filters: {
    sort_by: string;
    search: string;
    status: null;
  };
  pagination: {
    current_page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
  data: User[];
}

export interface GetUserInfoResponse {
  user: User;
}

export const getUser = async (
  search?: string,
  status?: string,
  page: number = 1
): Promise<GetUserResponse> => {
  const res = await axiosInstance.get<GetUserResponse>('?request=get-users', {
    params: {
      ...(search && { search }),
      ...(status && { status }),
      page,
    },
  });

  return res.data;
};

export const getUserInfo = async (userId: number): Promise<GetUserInfoResponse> => {
  const res = await axiosInstance.get(`?request=get-user-by-id&id=${userId}`);

  return res.data;
};

export const createUser = async (user: CreateUserReq): Promise<CreateUserResponse> => {
  const res = await axiosInstance.post(`?request=post-register`, user);

  return res.data;
};

export const editUser = async (user: EditUserReq): Promise<CreateUserResponse> => {
  const res = await axiosInstance.put(`?request=put-user`, user);

  return res.data;
};

export const deactivateUser = async (userId: number): Promise<CreateUserResponse> => {
  const res = await axiosInstance.post(`?request=post-deactivate-user`, {
    user_id: userId,
  });

  return res.data;
};

export const reactivateUser = async (userId: number): Promise<CreateUserResponse> => {
  const res = await axiosInstance.post(`?request=post-reactivate_user`, {
    user_id: userId,
  });

  return res.data;
};
