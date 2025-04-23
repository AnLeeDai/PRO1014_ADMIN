import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Avatar, Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEditUser } from '@/hooks/useEditUser';

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexPhone = /^0[0-9]{9,10}$/;

const schema = yup.object({
  fullName: yup.string().required('Họ và tên là bắt buộc'),
  email: yup.string().required('Email là bắt buộc').matches(regexEmail, 'Email không hợp lệ'),
  phone: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(regexPhone, 'Số điện thoại không hợp lệ'),
  address: yup.string().required('Địa chỉ là bắt buộc'),
});

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

interface ModalEditUserProps {
  opened: boolean;
  onClose: () => void;
  user: {
    user_id: number;
    full_name: string;
    email: string;
    phone_number: string;
    address: string;
    avatar_url?: string;
  };
  refetch: () => void;
}

export default function ModalEditUser({ opened, onClose, user, refetch }: ModalEditUserProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: user.full_name,
      email: user.email,
      phone: user.phone_number,
      address: user.address,
    },
  });

  const { mutate, isPending } = useEditUser({
    onSuccess: () => {
      notifications.show({
        title: 'Thành công',
        message: 'Cập nhật người dùng thành công',
        color: 'green',
      });
      refetch();
      onClose();
    },
    onError: (error) => {
      notifications.show({
        title: 'Lỗi',
        message: error.message || 'Có lỗi xảy ra khi cập nhật',
        color: 'red',
      });
    },
  });

  const handleUpdate = (values: FormValues) => {
    const payload = {
      user_id: user.user_id,
      full_name: values.fullName,
      email: values.email,
      phone_number: values.phone,
      address: values.address,
    };

    mutate(payload);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Chỉnh sửa người dùng" centered size="lg">
      {user.avatar_url && (
        <Avatar src={user.avatar_url} size={160} radius="xl" alt="Avatar Preview" mx="auto" />
      )}

      <form onSubmit={handleSubmit(handleUpdate)}>
        <Stack>
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

          <Group mt="md" grow>
            <Button variant="default" onClick={onClose} disabled={isPending}>
              Hủy
            </Button>
            <Button type="submit" loading={isPending}>
              Cập nhật
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
