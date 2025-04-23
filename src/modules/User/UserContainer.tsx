import { useState } from 'react';
import { IconEdit, IconSearch } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { Group, Select, Skeleton, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { User } from '@/api/user';
import MyTable from '@/components/MyTable/MyTable';
import { useDeactiveUser } from '@/hooks/useDeactiveUser';
import { useReactivateUser } from '@/hooks/useReactivateUser';
import { useUser } from '@/hooks/useUser';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';
import ModalAddNewUser from './ModalAddNewUser';
import ModalEditUser from './ModalEditUser';

export default function UserContainer() {
  const [openModalAddNewUser, setOpenModalAddNewUser] = useState(false);
  const [openModalEditUser, setOpenModalEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { register, watch, setValue } = useForm({
    defaultValues: {
      search: '',
      status: 'all',
      page: 1,
    },
  });

  const watchedSearch = watch('search');
  const watchedStatus = watch('status');
  const watchedPage = watch('page');
  const [debouncedSearch] = useDebouncedValue(watchedSearch, 500);

  const {
    data: userDataResponse,
    isLoading: isLoadingUser,
    error,
    refetch,
  } = useUser(debouncedSearch, watchedStatus === 'all' ? undefined : watchedStatus, watchedPage);

  const { mutate: deactivateUser } = useDeactiveUser({
    onSuccess: () => {
      notifications.show({
        title: 'Thành công',
        message: 'Tài khoản đã được vô hiệu hóa',
        color: 'green',
      });

      refetch();
    },

    onError: (err) => {
      notifications.show({
        title: 'Lỗi',
        message: err.message,
        color: 'red',
      });
    },
  });

  const { mutate: reactivateUser } = useReactivateUser({
    onSuccess: () => {
      notifications.show({
        title: 'Thành công',
        message: 'Tài khoản đã được mở khóa',
        color: 'green',
      });

      refetch();
    },

    onError: (err) => {
      notifications.show({
        title: 'Lỗi',
        message: err.message,
        color: 'red',
      });
    },
  });

  if (isLoadingUser) {
    return (
      <DefaultLayout title="Quản lý người dùng">
        <Skeleton height={50} mt={10} radius="md" />
        <Skeleton height={50} mt={10} radius="md" />
        <Skeleton height={50} mt={10} radius="md" />
      </DefaultLayout>
    );
  }

  if (error) {
    return <div>Lỗi: {error.message}</div>;
  }

  const userData: User[] = userDataResponse?.data || [];

  const userColumns = [
    { key: 'id', title: 'ID người dùng', render: (item: any) => item.user_id },
    { key: 'username', title: 'Tên đăng nhập', render: (item: any) => item.username },
    { key: 'fullName', title: 'Họ và tên', render: (item: any) => item.full_name },
    { key: 'email', title: 'Email', render: (item: any) => item.email },
    { key: 'phoneNumber', title: 'Số điện thoại', render: (item: any) => item.phone_number },
    { key: 'address', title: 'Địa chỉ', render: (item: any) => item.address },
    {
      key: 'avatarUrl',
      title: 'Ảnh đại diện',
      render: (item: any) => (
        <img
          src={item.avatar_url}
          alt="Ảnh đại diện"
          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
        />
      ),
    },
    { key: 'createdAt', title: 'Ngày tạo', render: (item: any) => item.created_at },
    { key: 'role', title: 'Vai trò' },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (item: any) => (
        <Select
          size="xs"
          value={item.is_active ? 'active' : 'inactive'}
          data={[
            { value: 'active', label: 'Hoạt động' },
            { value: 'inactive', label: 'Không hoạt động' },
          ]}
          onChange={(val) => {
            if (val === 'inactive' && item.is_active) {
              deactivateUser(item.user_id);
            } else if (val === 'active' && !item.is_active) {
              reactivateUser(item.user_id);
            }
          }}
        />
      ),
    },
  ];

  const userActions = [
    {
      icon: IconEdit,
      color: 'blue',
      tooltipLabel: 'Chỉnh sửa',
      onClick: (item: any) => {
        setSelectedUser(item);
        setOpenModalEditUser(true);
      },
    },
  ];

  return (
    <>
      <ModalAddNewUser
        opened={openModalAddNewUser}
        onClose={() => setOpenModalAddNewUser(false)}
        refetch={refetch}
      />

      {selectedUser && (
        <ModalEditUser
          opened={openModalEditUser}
          onClose={() => setOpenModalEditUser(false)}
          user={selectedUser}
          refetch={refetch}
        />
      )}

      <DefaultLayout title="Quản lý người dùng" action={() => setOpenModalAddNewUser(true)}>
        <Group grow>
          <TextInput
            label="Tìm kiếm theo tên đăng nhập"
            placeholder="Tìm kiếm sản phẩm"
            leftSection={<IconSearch size={16} />}
            {...register('search')}
            onBlur={() => setValue('page', 1)}
          />

          <Select
            label="Lọc theo trạng thái"
            data={[
              { value: 'all', label: 'Tất cả' },
              { value: 'active', label: 'Hoạt động' },
              { value: 'inactive', label: 'Không hoạt động' },
            ]}
            value={watch('status')}
            onChange={(val) => {
              setValue('page', 1);
              setValue('status', val || 'all');
            }}
          />
        </Group>

        <MyTable
          data={userData}
          columns={userColumns}
          actions={userActions}
          page={watchedPage}
          total={userDataResponse?.pagination.total_items || 0}
          onPageChange={(p) => setValue('page', p)}
        />
      </DefaultLayout>
    </>
  );
}
