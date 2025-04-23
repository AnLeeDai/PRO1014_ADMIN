import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { hideProduct, Product } from '@/api/product';
import { ResponseErr } from '@/types/api';

export const useHideProduct = (options?: UseMutationOptions<Product, ResponseErr, number>) => {
  return useMutation({
    mutationFn: (product_id: number) => hideProduct(product_id),
    ...options,
  });
};
