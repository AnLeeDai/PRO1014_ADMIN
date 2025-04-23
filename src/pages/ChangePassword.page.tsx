import { IconSearch } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Group, Select, Skeleton, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { processPasswordRequest } from '@/api/user';
import MyTable from '@/components/MyTable/MyTable';
import { usePasswordRequests } from '@/hooks/usePasswordRequests';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';

export default function ChangePasswordPage() {
  const { register, watch, setValue } = useForm({
    defaultValues: {
      search: '',
      status: 'pending',
      page: 1,
    },
  });

  const watchedSearch = watch('search');
  const watchedStatus = watch('status');
  const watchedPage = watch('page');
  const [debouncedSearch] = useDebouncedValue(watchedSearch, 500);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = usePasswordRequests(debouncedSearch, watchedStatus, watchedPage);

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      processPasswordRequest(id, status),
    onSuccess: () => {
      notifications.show({
        title: 'Thành công',
        message: 'Cập nhật trạng thái yêu cầu thành công.',
        color: 'green',
      });
      refetch();
    },
    onError: (err: any) => {
      notifications.show({
        title: 'Lỗi',
        message: err.message,
        color: 'red',
      });
    },
  });

  if (isLoading) {
    return (
      <DefaultLayout title="Quản lý đổi mật khẩu">
        <Skeleton height={50} mt={10} radius="md" />
        <Skeleton height={50} mt={10} radius="md" />
        <Skeleton height={50} mt={10} radius="md" />
      </DefaultLayout>
    );
  }

  if (error) {
    return <div>Lỗi: {error.message}</div>;
  }

  const requests = response?.data || [];

  const columns = [
    { key: 'id', title: 'ID', render: (item: any) => item.id },
    { key: 'username', title: 'Tên đăng nhập' },
    { key: 'email', title: 'Email' },
    { key: 'created_at', title: 'Ngày tạo' },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (item: any) => (
        <Select
          size="xs"
          value={item.status}
          data={[
            { value: 'pending', label: 'Đang chờ' },
            { value: 'done', label: 'Đã xử lý' },
            { value: 'rejected', label: 'Từ chối' },
          ]}
          onChange={(val) => {
            if (val && val !== item.status) {
              mutation.mutate({ id: item.id, status: val });
            }
          }}
        />
      ),
    },
  ];

  return (
    <DefaultLayout title="Quản lý đổi mật khẩu">
      <Group grow>
        <TextInput
          label="Tìm kiếm theo username/email"
          placeholder="Nhập từ khóa"
          leftSection={<IconSearch size={16} />}
          {...register('search')}
          onBlur={() => setValue('page', 1)}
        />

        <Select
          label="Lọc theo trạng thái"
          data={[
            { value: 'pending', label: 'Đang chờ' },
            { value: 'done', label: 'Đã xử lý' },
            { value: 'rejected', label: 'Từ chối' },
          ]}
          value={watchedStatus}
          onChange={(val) => {
            setValue('status', val || 'pending');
            setValue('page', 1);
          }}
        />
      </Group>

      <MyTable
        data={requests}
        columns={columns}
        page={watchedPage}
        total={response?.pagination?.total_pages || 0}
        onPageChange={(p) => setValue('page', p)}
      />
    </DefaultLayout>
  );
}
