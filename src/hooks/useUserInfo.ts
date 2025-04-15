import { useQuery, UseQueryResult } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { getUserInfo, GetUserInfoResponse } from '@/api/user';

export const useUserInfo = (): UseQueryResult<GetUserInfoResponse, Error> => {
  const userId = Cookies.get('user_id');

  if (!userId) {
    throw new Error('No user ID found in cookies');
  }

  return useQuery<GetUserInfoResponse, Error>({
    queryKey: ['user-info', userId],
    queryFn: () => getUserInfo(Number(userId)),
  });
};
