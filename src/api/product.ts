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

export interface GetAllProductByIDResponse {
  product: Product;
}

export const getAllProduct = async (
  category_id?: number,
  search?: string,
  min_price?: number,
  max_price?: number,
  brand?: string,
  page: number = 1
): Promise<GetAllProductResponse> => {
  const res = await axiosInstance.get<GetAllProductResponse>('?request=get-products', {
    params: {
      ...(category_id && { category_id }),
      ...(search && { search }),
      ...(min_price && { min_price }),
      ...(max_price && { max_price }),
      ...(brand && { brand }),
      page,
    },
  });

  return res.data;
};

export const getProductByID = async (id?: number): Promise<GetAllProductByIDResponse> => {
  const res = await axiosInstance.get<GetAllProductByIDResponse>('?request=get-product-by-id', {
    params: {
      id,
    },
  });

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

export const editProduct = async (data: FormData): Promise<Product> => {
  const res = await axiosInstance.post('?request=post-edit-product', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

export const hideProduct = async (product_id: number): Promise<Product> => {
  const res = await axiosInstance.post('?request=post-hide-product', {
    product_id,
  });

  return res.data;
};

export const unhideProduct = async (product_id: number): Promise<Product> => {
  const res = await axiosInstance.post('?request=post-unhide-product', {
    product_id,
  });

  return res.data;
};
