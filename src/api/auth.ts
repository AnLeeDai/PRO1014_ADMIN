import axiosInstance from './axiosInstance';

export const loginUser = async (username: string, password: string) => {
  const res = await axiosInstance.post('?request=post-login', {
    username,
    password,
  });

  return res.data;
};
