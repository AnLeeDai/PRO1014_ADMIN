import axiosInstance from './axiosInstance';

export interface Category {
  category_id: number;
  category_name: string;
  created_at: string;
  updated_at: string;
}

export interface GetAllCategoryResponse {
  success: boolean;
  message: string;
  filters: {
    sort_by: string;
    search: string;
  };
  pagination: {
    current_page: number;
    limit: number;
    total_pages: number;
    total_pages: number;
  };
  data: Category[];
}

export const getAllCategory = async (): Promise<GetAllCategoryResponse> => {
  const res = await axiosInstance.get('?request=get-category');

  return res.data;
};
