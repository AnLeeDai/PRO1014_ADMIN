import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { Product, unhideProduct } from '@/api/product';
import { ResponseErr } from '@/types/api';

export const useUnProduct = (options?: UseMutationOptions<Product, ResponseErr, number>) => {
  return useMutation({
    mutationFn: (product_id: number) => unhideProduct(product_id),
    ...options,
  });
};
