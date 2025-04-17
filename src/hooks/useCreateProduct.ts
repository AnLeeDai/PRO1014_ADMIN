import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { createProduct, Product } from '@/api/product';
import { ResponseErr } from '@/types/api';

export const useCreateProduct = (options?: UseMutationOptions<Product, ResponseErr, FormData>) => {
  return useMutation({
    mutationFn: (data: FormData) => createProduct(data),
    ...options,
  });
};
