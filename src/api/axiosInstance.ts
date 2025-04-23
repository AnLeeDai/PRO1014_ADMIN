import axios from 'axios';
import Cookies from 'js-cookie';
import { routerConfig } from '@/constants/siteConfig';

const axiosInstance = axios.create({
  // baseURL: 'https://vision-attacks-house-sys.trycloudflare.com/PRO1014_SERVER/',
  baseURL: 'http://localhost/PRO1014_SERVER/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: any) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || status === 440) {
      Cookies.remove('token');
      Cookies.remove('expires_in');
      Cookies.remove('user_id');

      window.location.href = routerConfig.login;
    }

    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
