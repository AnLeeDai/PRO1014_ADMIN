import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Skeleton } from '@mantine/core';
import { User } from '@/api/user';
import MyTable from '@/components/MyTable/MyTable';
import { useUser } from '@/hooks/useUser';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';

export default function UserContainer() {
  const { data: userDataResponse, isLoading: isLoadingUser, error } = useUser();

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
    { key: 'id', title: 'Mã người dùng', render: (item: any) => item.user_id },
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
      render: (item: any) => (item.is_active ? 'Hoạt động' : 'Không hoạt động'),
    },
  ];

  const userActions = [
    {
      icon: IconEdit,
      color: 'blue',
      tooltipLabel: 'Chỉnh sửa',
      onClick: (item: any) => console.log('Chỉnh sửa', item),
    },
    {
      icon: IconTrash,
      color: 'red',
      tooltipLabel: 'Xóa',
      onClick: (item: any) => console.log('Xóa', item),
    },
  ];

  const hanlderAddNewUser = () => {};

  return (
    <DefaultLayout title="Quản lý người dùng" action={hanlderAddNewUser}>
      <MyTable data={userData} columns={userColumns} actions={userActions} />
    </DefaultLayout>
  );
}
