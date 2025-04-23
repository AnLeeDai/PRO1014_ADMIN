import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { updateOrderStatus, UpdateOrderStatusReq, UpdateOrderStatusResponse } from '@/api/orders';
import { ResponseErr } from '@/types/api';

export const useUpdateOrderStatus = (
  options?: UseMutationOptions<UpdateOrderStatusResponse, ResponseErr, UpdateOrderStatusReq>
) => {
  return useMutation({
    mutationKey: ['updateOrderStatus'],
    mutationFn: (order: UpdateOrderStatusReq) => updateOrderStatus(order.order_id, order.status),
    ...options,
  });
};
