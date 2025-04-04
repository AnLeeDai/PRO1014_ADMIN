import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routerConfig } from './constants/siteConfig';
import BannerPage from './pages/Banner.page';
import CategoryPage from './pages/Category.page';
import ChangePasswordPage from './pages/ChangePassword.page';
import DiscountCodePage from './pages/DiscountCode.page';
import LoginPage from './pages/Login.page';
import OrderPage from './pages/Order.page';
import ProductPage from './pages/Product.page';
import UserPage from './pages/User.page';

const router = createBrowserRouter([
  {
    path: routerConfig.login,
    element: <LoginPage />,
  },
  {
    path: routerConfig.user,
    element: <UserPage />,
  },
  {
    path: routerConfig.changePassword,
    element: <ChangePasswordPage />,
  },
  {
    path: routerConfig.banner,
    element: <BannerPage />,
  },
  {
    path: routerConfig.category,
    element: <CategoryPage />,
  },
  {
    path: routerConfig.product,
    element: <ProductPage />,
  },
  {
    path: routerConfig.discountCode,
    element: <DiscountCodePage />,
  },
  {
    path: routerConfig.order,
    element: <OrderPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
