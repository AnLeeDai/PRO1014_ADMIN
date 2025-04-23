import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Button, Group, Modal, PasswordInput, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCreateUser } from '@/hooks/useCreateUser';

const regexUsername = /^[a-zA-Z0-9]{6,}$/;
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/;
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexPhone = /^0[0-9]{9,10}$/;

const schema = yup.object({
  username: yup
    .string()
    .required('Tên đăng nhập là bắt buộc')
    .matches(regexUsername, 'Phải ít nhất 6 ký tự và chỉ gồm chữ cái, số'),
  fullName: yup.string().required('Họ và tên là bắt buộc'),
  email: yup.string().required('Email là bắt buộc').matches(regexEmail, 'Email không hợp lệ'),
  phone: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(regexPhone, 'Số điện thoại không hợp lệ'),
  address: yup.string().required('Địa chỉ là bắt buộc'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .matches(regexPassword, 'Ít nhất 6 ký tự, 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'),
  password_confirm: yup
    .string()
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
});

interface IModalAddNewUserProps {
  opened: boolean;
  onClose: () => void;
  refetch?: () => void;
}

interface FormValues {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  password_confirm: string;
}

export default function ModalAddNewUser(props: IModalAddNewUserProps) {
  const { opened, onClose, refetch } = props;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const { mutate } = useCreateUser({
    onSuccess: () => {
      notifications.show({
        title: 'Thành công',
        message: 'Người dùng đã được tạo thành công',
        color: 'green',
      });
      reset();
      refetch?.();
      onClose();
    },
    onError: (error) => {
      notifications.show({
        title: 'Lỗi',
        message: error.message,
        color: 'red',
      });
    },
  });

  const handleFormSubmit = (data: FormValues) => {
    mutate({
      username: data.username,
      full_name: data.fullName,
      email: data.email,
      phone_number: data.phone,
      address: data.address,
      password: data.password,
      password_confirm: data.password_confirm,
      role: 'user',
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Thêm người dùng mới"
      centered
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Stack>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Tên đăng nhập"
                required
                {...field}
                error={errors.username?.message}
              />
            )}
          />
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextInput label="Họ và tên" required {...field} error={errors.fullName?.message} />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextInput label="Email" required {...field} error={errors.email?.message} />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextInput label="Số điện thoại" required {...field} error={errors.phone?.message} />
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextInput label="Địa chỉ" required {...field} error={errors.address?.message} />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                label="Mật khẩu"
                required
                {...field}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            name="password_confirm"
            control={control}
            render={({ field }) => (
              <PasswordInput
                label="Xác nhận mật khẩu"
                required
                {...field}
                error={errors.password_confirm?.message}
              />
            )}
          />

          <Group justify="space-between" mt="md" wrap="nowrap">
            <Button
              variant="default"
              onClick={() => {
                onClose();
                reset();
              }}
              fullWidth
            >
              Huỷ
            </Button>
            <Button type="submit" fullWidth>
              Thêm người dùng
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
