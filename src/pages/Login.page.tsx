import { yupResolver } from '@hookform/resolvers/yup';
import Cookies from 'js-cookie';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { routerConfig } from '@/constants/siteConfig';
import { useLoginUser } from '@/hooks/useLoginUser';
import AuthLayout from '@/layouts/AuthLayout/AuthLayout';

interface LoginFormValues {
  username: string;
  password: string;
}

const schema = Yup.object().shape({
  username: Yup.string().required('Tên đăng nhập là bắt buộc'),
  password: Yup.string().required('Mật khẩu là bắt buộc'),
});

export default function LoginPage() {
  const navigate = useNavigate();

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { mutate: mutateLoginUser, isPending: isLoadingLoginUser } = useLoginUser({
    onSuccess: (data) => {
      if (data.user.role !== 'admin') {
        notifications.show({
          title: 'Đăng nhập thất bại',
          message: 'Bạn không có quyền truy cập vào trang này!',
          color: 'red',
        });

        return;
      }

      notifications.show({
        title: 'Đăng nhập thành công',
        message: 'Chào mừng bạn trở lại!',
        color: 'green',
      });

      Cookies.set('token', data.token, {
        path: '/',
        secure: true,
        sameSite: 'None',
      });

      Cookies.set('user_id', JSON.stringify(data.user.user_id), {
        path: '/',
        secure: true,
        sameSite: 'None',
      });

      navigate(routerConfig.user);
    },

    onError: (error) => {
      notifications.show({
        title: 'Đăng nhập thất bại',
        message: error.message,
        color: 'red',
      });
    },
  });

  const handlerSubmitForm = async (data: LoginFormValues) => {
    mutateLoginUser(data);
  };

  return (
    <AuthLayout title="Chào mừng trở lại!">
      <form onSubmit={form.handleSubmit(handlerSubmitForm)} noValidate>
        <Stack>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                size="md"
                label="Tên đăng nhập"
                placeholder="Tên đăng nhập của bạn"
                required
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <PasswordInput
                {...field}
                size="md"
                label="Mật khẩu"
                placeholder="Mật khẩu của bạn"
                required
                error={fieldState.error?.message}
              />
            )}
          />
        </Stack>

        <Button fullWidth mt="xl" size="md" type="submit" loading={isLoadingLoginUser}>
          Đăng nhập
        </Button>
      </form>
    </AuthLayout>
  );
}
