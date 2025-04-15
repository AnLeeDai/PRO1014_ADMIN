import React from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Skeleton } from '@mantine/core';
import { User } from '@/api/user';
import MyTable from '@/components/MyTable/MyTable';
import { useUser } from '@/hooks/useUser';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';

export default function UserPage() {
  const [page, setPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterValue, setFilterValue] = React.useState<string | null>(null);
  const filterOptions = ['Tên người dùng', 'Email', 'Tình trạng'];

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
    return <div>Error: {error.message}</div>;
  }

  const userData: User[] = userDataResponse?.data || [];

  const userColumns = [
    { key: 'id', title: 'User ID', render: (item: any) => item.user_id },
    { key: 'username', title: 'Username', render: (item: any) => item.username },
    { key: 'fullName', title: 'Full Name', render: (item: any) => item.full_name },
    { key: 'email', title: 'Email', render: (item: any) => item.email },
    { key: 'phoneNumber', title: 'Phone Number', render: (item: any) => item.phone_number },
    { key: 'address', title: 'Address', render: (item: any) => item.address },
    {
      key: 'avatarUrl',
      title: 'Avatar',
      render: (item: any) => (
        <img
          src={item.avatar_url}
          alt="Avatar"
          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
        />
      ),
    },
    { key: 'createdAt', title: 'Created At', render: (item: any) => item.created_at },
    { key: 'role', title: 'Role' },
    { key: 'isActive', title: 'Active', render: (item: any) => (item.isActive ? 'Yes' : 'No') },
  ];

  const userActions = [
    {
      icon: IconEdit,
      color: 'blue',
      tooltipLabel: 'Chỉnh sửa',
      onClick: (item: any) => console.log('Edit', item),
    },
    {
      icon: IconTrash,
      color: 'red',
      tooltipLabel: 'Xóa',
      onClick: (item: any) => console.log('Delete', item),
    },
  ];

  const filteredUsers = userData.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DefaultLayout title="Quản lý người dùng" action={() => console.log('Add new user')}>
      <MyTable
        data={filteredUsers.slice((page - 1) * 5, page * 5)}
        columns={userColumns}
        actions={userActions}
        total={filteredUsers.length}
        page={page}
        onPageChange={setPage}
        onSearch={setSearchQuery}
        filterOptions={filterOptions}
        onFilterChange={setFilterValue}
        filterValue={filterValue}
      />
    </DefaultLayout>
  );
}
