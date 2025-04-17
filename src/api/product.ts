import axiosInstance from './axiosInstance';

export interface Product {
  id: number;
  product_name: string;
  price: string;
  thumbnail: string;
  short_description: string;
  full_description: string;
  extra_info: string;
  in_stock: number;
  created_at: string;
  updated_at: string;
  brand: string;
  category_id: number;
  is_active: number;
  category_name: string;
  gallery: string[];
}

export interface GetAllProductResponse {
  success: boolean;
  message: string;
  filters: {
    sort_by: string;
    search: string;
    category_id: number | null;
    min_price: number | null;
    max_price: number | null;
    brand: string | null;
  };
  pagination: {
    current_page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
  data: Product[];
}

export const getAllProduct = async (): Promise<GetAllProductResponse> => {
  const res = await axiosInstance.get(
    '?request=get-products'
    // `?request=get-products&page=${page}&limit=${limit}&sort_by=${sort_by}&search=${search}&category_id=${category_id}&min_price=${min_price}&max_price=${max_price}&brand=${brand}`
  );

  return res.data;
};

export const createProduct = async (data: FormData): Promise<Product> => {
  const res = await axiosInstance.post('?request=post-product', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};
