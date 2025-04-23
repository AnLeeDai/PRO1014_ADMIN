import axiosInstance from './axiosInstance';

interface Order {
  id: number;
  user_id: number;
  total_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  payment_method: string;
  shipping_address: string;
  full_name: string;
  email: string;
  items: {
    id: number;
    price: number;
    order_id: number;
    quantity: number;
    thumbnail: string;
    product_id: number;
    product_name: string;
  }[];
}

export interface GetOrdersResponse {
  success: boolean;
  message: string;
  filters: {
    search: string;
    status: null;
  };

  pagination: {
    current_page: number;
    limit: number;
    total_pages: number;
  };

  data: Order[];
}

export const getOrders = async (
  search?: string,
  status?: string,
  page: number = 1
): Promise<GetOrdersResponse> => {
  const res = await axiosInstance.get('?request=get-admin-orders', {
    params: {
      search,
      status,
      page,
    },
  });

  return res.data;
};

export interface UpdateOrderStatusReq {
  order_id: number;
  status: string;
}
export interface UpdateOrderStatusResponse {
  success: boolean;
  message: string;
}

export const updateOrderStatus = async (
  order_id: number,
  status: string
): Promise<UpdateOrderStatusResponse> => {
  const res = await axiosInstance.post('?request=post-admin-update-order-status', {
    order_id,
    status,
  });

  return res.data;
};
