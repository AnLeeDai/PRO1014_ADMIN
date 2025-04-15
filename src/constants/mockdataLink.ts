import {
  IconImageInPicture,
  IconKey,
  IconList,
  IconShoppingCart,
  IconTruckDelivery,
  IconUsers,
} from '@tabler/icons-react';
import { routerConfig } from '@/constants/siteConfig';

export const mockdata = [
  { label: 'Quản lý người dùng', icon: IconUsers, link: routerConfig.user },
  { label: 'Yêu cầu đổi mật khẩu', icon: IconKey, link: routerConfig.changePassword },
  { label: 'Quản lý banner', icon: IconImageInPicture, link: routerConfig.banner },
  { label: 'Quản lý danh mục', icon: IconList, link: routerConfig.category },
  { label: 'Quản lý sản phẩm', icon: IconShoppingCart, link: routerConfig.product },
  { label: 'Quản lý đơn hàng', icon: IconTruckDelivery, link: routerConfig.order },
];
