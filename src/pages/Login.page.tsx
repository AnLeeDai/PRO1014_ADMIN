import { useNavigate } from 'react-router-dom';
import { Button, PasswordInput, TextInput } from '@mantine/core';
import { routerConfig } from '@/constants/siteConfig';
import AuthLayout from '@/layouts/AuthLayout/AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate(routerConfig.user);
  };

  return (
    <AuthLayout title="Chào mừng trở lại!">
      <TextInput size="md" label="Email" placeholder="you@mantine.dev" required />

      <PasswordInput
        size="md"
        label="Mật khẩu"
        placeholder="Mật khẩu của bạn"
        type="password"
        required
        mt="md"
      />

      <Button fullWidth mt="xl" size="md" onClick={handleLogin}>
        Đăng nhập
      </Button>
    </AuthLayout>
  );
}
