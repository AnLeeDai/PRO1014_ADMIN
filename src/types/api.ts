interface Pagination {
  current_page: number;
  limit: number;
  total_pages: number;
  total_pages: number;
}

interface Filter {
  search: string;
  sort_by: string;
}

export interface ResponseErr {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface ResponseSuccess<T> {
  success: boolean;
  message: string;
  filters: Filter[];
  pagination: Pagination;
  data: T;
}
