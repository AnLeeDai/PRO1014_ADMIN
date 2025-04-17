import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { editProduct, Product } from '@/api/product';
import { ResponseErr } from '@/types/api';

export const useEditProduct = (options?: UseMutationOptions<Product, ResponseErr, FormData>) => {
  return useMutation({
    mutationFn: (data: FormData) => editProduct(data),
    ...options,
  });
};
