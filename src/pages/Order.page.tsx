import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import {
  Card,
  Divider,
  Group,
  Image,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue, useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useOrders } from '@/hooks/useOrder';
import { useUpdateOrderStatus } from '@/hooks/useOrderStatus';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Đang chờ xử lý',
  delivered: 'Đã giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ',
};

const formatVND = (v: number | string) => `${Number(v).toLocaleString('vi-VN')} ₫`;

export default function OrderPage() {
  /* ------- local filter state ------- */
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const { height } = useViewportSize();

  /* ------- query data ------- */
  const { data, isLoading, refetch } = useOrders(
    debouncedSearch || undefined,
    status !== 'all' ? status : undefined,
    page
  );

  /* ------- mutation update status ------- */
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { mutate: updateStatus } = useUpdateOrderStatus({
    onSuccess: () => {
      notifications.show({
        title: 'Thành công',
        message: 'Cập nhật trạng thái đơn hàng thành công',
        color: 'green',
      });
      refetch();
      setUpdatingId(null);
    },
    onError: (err) => {
      notifications.show({
        title: 'Lỗi',
        message: err.message || 'Không thể cập nhật trạng thái',
        color: 'red',
      });
      setUpdatingId(null);
    },
  });

  if (isLoading) {
    return (
      <DefaultLayout title="Quản lý đơn hàng">
        <Text>Đang tải đơn hàng…</Text>
      </DefaultLayout>
    );
  }

  const orders = data?.data || [];
  const totalPage = data?.pagination?.total_pages || 1;

  return (
    <DefaultLayout title="Quản lý đơn hàng">
      <Stack>
        {/* ------- filters ------- */}
        <Group grow>
          <TextInput
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.currentTarget.value);
            }}
            label="Tìm kiếm theo tên đăng nhập"
            placeholder="Nhập từ khoá…"
            leftSection={<IconSearch size={16} />}
          />

          <Select
            label="Lọc trạng thái"
            value={status}
            onChange={(v) => {
              setStatus(v || 'all');
              setPage(1);
            }}
            data={[
              { value: 'all', label: 'Tất cả' },
              { value: 'pending', label: STATUS_LABEL.pending },
              { value: 'delivered', label: STATUS_LABEL.delivered },
              { value: 'completed', label: STATUS_LABEL.completed },
              { value: 'cancelled', label: STATUS_LABEL.cancelled },
            ]}
          />
        </Group>

        <ScrollArea h={height < 600 ? height - 200 : height > 800 ? height - 300 : height - 250}>
          <Stack>
            {/* ------- orders list ------- */}
            {orders.map((o: any) => (
              <Card key={o.id} withBorder radius="md" p="lg">
                {/* Header */}
                <Group justify="space-between" mb="sm">
                  <Stack gap={2}>
                    <Text fw={600}>Mã đơn hàng: {o.id}</Text>
                    <Text size="xs" c="dimmed">
                      Ngày mua: {o.created_at}
                    </Text>
                  </Stack>

                  <Select
                    size="xs"
                    w={180}
                    value={o.status}
                    data={[
                      { value: 'pending', label: STATUS_LABEL.pending },
                      { value: 'delivered', label: STATUS_LABEL.delivered },
                      { value: 'completed', label: STATUS_LABEL.completed },
                      { value: 'cancelled', label: STATUS_LABEL.cancelled },
                    ]}
                    disabled={updatingId === o.id}
                    onChange={(v) => {
                      if (v && v !== o.status) {
                        setUpdatingId(o.id);
                        updateStatus({ order_id: o.id, status: v });
                      }
                    }}
                  />
                </Group>

                {/* Address & payment */}
                <Stack gap={4} mb="sm">
                  <Text size="sm">
                    <strong>Địa chỉ:</strong> {o.shipping_address}
                  </Text>
                  <Text size="sm">
                    <strong>Tên người nhận:</strong> {o.full_name}
                  </Text>
                  <Text size="sm">
                    <strong>Tên đăng nhập:</strong> {o.username}
                  </Text>
                  <Text size="sm">
                    <strong>Thanh toán:</strong>{' '}
                    {o.payment_method === 'bank_transfer' ? 'Chuyển khoản' : o.payment_method}
                  </Text>
                </Stack>

                {/* product list */}
                {o.items.map((it: any) => (
                  <Group key={it.id} align="flex-start" mb="xs">
                    <Image src={it.thumbnail} alt={it.product_name} h={60} w={60} fit="contain" />
                    <Stack gap={0}>
                      <Text>{it.product_name}</Text>
                      <Text size="xs" c="dimmed">
                        Số lượng: x{it.quantity}
                      </Text>
                    </Stack>
                    <Text fw={500} ml="auto">
                      {formatVND(it.price * it.quantity)}
                    </Text>
                  </Group>
                ))}

                <Divider my="sm" />

                {/* total */}
                <Group justify="space-between">
                  <Text fw={600}>Tổng cộng</Text>
                  <Text fw={600}>{formatVND(o.total_price)}</Text>
                </Group>
              </Card>
            ))}
          </Stack>
        </ScrollArea>

        {/* ------- pagination ------- */}
        <Group justify="center" mt="md">
          <Pagination total={totalPage} value={page} onChange={(p) => setPage(p)} />
        </Group>
      </Stack>
    </DefaultLayout>
  );
}
