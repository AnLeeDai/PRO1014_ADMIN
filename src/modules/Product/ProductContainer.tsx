import { SetStateAction, useState } from 'react';
import { IconEdit, IconEye, IconEyeOff, IconSearch } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import {
  ActionIcon,
  Group,
  Image,
  Select,
  Skeleton,
  Stack,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import MyTable from '@/components/MyTable/MyTable';
import { useProduct } from '@/hooks/useProduct';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';
import ModalConfirmProduct from './ModalConfirmProduct';
import ModalCreateProduct from './ModalCreateProduct';
import ModalDetailProduct from './ModalDetailProduct';
import ModalEditProduct from './ModalEditProduct';

/* ---------- helper ---------- */
const parseToVND = (p: number | string) =>
  Number(p).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export default function ProductContainer() {
  /* ---------- modal controls ---------- */
  const [opened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    is_active?: number;
  } | null>(null);

  const [detailOpened, setDetailOpened] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const [createOpened, setCreateOpened] = useState(false);

  const [editOpened, setEditOpened] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  /* ---------- filters ---------- */
  const { register, watch, setValue } = useForm({
    defaultValues: {
      search: '',
      brand: 'all',
      price: 'all',
      category_id: 'all',
      page: 1,
    },
  });

  const watchedSearch = watch('search');
  const watchedBrand = watch('brand');
  const watchedPrice = watch('price');
  const watchedCategoryId = watch('category_id');
  const watchedPage = watch('page');

  const [debouncedSearch] = useDebouncedValue(watchedSearch, 500);

  let min_price: number | undefined;
  let max_price: number | undefined;
  if (watchedPrice === '10000000') {
    max_price = 10000000;
  } else if (watchedPrice === '20000000') {
    min_price = 10000000;
    max_price = 20000000;
  } else if (watchedPrice === '30000000') {
    min_price = 20000000;
  }

  const categoryId = watchedCategoryId !== 'all' ? Number(watchedCategoryId) : undefined;
  const brand = watchedBrand !== 'all' ? watchedBrand : undefined;

  const {
    data: productDataRes,
    isPending,
    refetch,
  } = useProduct(categoryId, debouncedSearch, min_price, max_price, brand, watchedPage);

  /* ---------- actions ---------- */
  const handleToggleVisibility = (
    product: SetStateAction<{ id: number; is_active?: number } | null>
  ) => {
    setSelectedProduct(product);
    openDelete();
  };

  /* ---------- table columns ---------- */
  const productColumns = [
    { key: 'id', title: 'ID' },
    { key: 'product_name', title: 'Tên sản phẩm' },
    { key: 'category_name', title: 'Danh mục' },
    { key: 'price', title: 'Giá' },
    { key: 'in_stock', title: 'Số lượng' },
    { key: 'brand', title: 'Thương hiệu' },
    {
      key: 'thumbnail',
      title: 'Thumbnail',
      render: (row: any) => (
        <Image src={row.thumbnail} alt="thumb" h={200} w="auto" fit="contain" />
      ),
    },
    { key: 'created_at', title: 'Ngày tạo' },
    {
      key: 'action',
      title: 'Hành động',
      render: (row: any) => (
        <Group>
          {/* xem chi tiết */}
          <Tooltip label="Xem chi tiết" color="blue" withArrow>
            <ActionIcon
              variant="filled"
              color="blue"
              onClick={() => {
                setDetailId(row.id);
                setDetailOpened(true);
              }}
            >
              <IconSearch size={24} />
            </ActionIcon>
          </Tooltip>

          {/* chỉnh sửa */}
          <Tooltip label="Chỉnh sửa" color="indigo" withArrow>
            <ActionIcon
              variant="filled"
              color="indigo"
              onClick={() => {
                setEditProduct(row);
                setEditOpened(true);
              }}
            >
              <IconEdit size={24} />
            </ActionIcon>
          </Tooltip>

          {/* ẩn / hiện */}
          <Tooltip
            label={row.is_active === 1 ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm'}
            color={row.is_active === 1 ? 'gray' : 'green'}
            withArrow
          >
            <ActionIcon
              variant="filled"
              color={row.is_active === 1 ? 'gray' : 'green'}
              onClick={() => handleToggleVisibility(row)}
            >
              {row.is_active === 1 ? <IconEyeOff size={24} /> : <IconEye size={24} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  const productData =
    productDataRes?.data?.map((p: any) => ({ ...p, price: parseToVND(p.price) })) || [];

  /* ---------- render ---------- */
  return (
    <>
      {/* modals */}
      <ModalEditProduct
        opened={editOpened}
        onClose={() => setEditOpened(false)}
        product={editProduct}
        refetch={refetch}
      />
      <ModalCreateProduct
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        refetch={refetch}
      />
      <ModalDetailProduct
        opened={detailOpened}
        onClose={() => {
          setDetailOpened(false);
          setDetailId(null);
        }}
        productId={detailId}
      />
      <ModalConfirmProduct
        opened={opened}
        onClose={closeDelete}
        onHide={closeDelete}
        isState={selectedProduct?.is_active === 1 ? 'hide' : 'show'}
        productId={selectedProduct?.id}
        refetch={refetch}
      />

      {/* page content */}
      <DefaultLayout title="Quản lý sản phẩm" action={() => setCreateOpened(true)}>
        <Stack>
          {/* filters */}
          <Stack>
            <TextInput
              placeholder="Tìm kiếm sản phẩm"
              leftSection={<IconSearch size={16} />}
              {...register('search')}
              onBlur={() => setValue('page', 1)}
            />
            <Group grow>
              <Select
                label="Lọc theo khoảng giá"
                data={[
                  { value: 'all', label: 'Tất cả giá' },
                  { value: '10000000', label: 'Dưới 10 triệu' },
                  { value: '20000000', label: '10–20 triệu' },
                  { value: '30000000', label: 'Trên 20 triệu' },
                ]}
                value={watchedPrice}
                onChange={(v) => {
                  setValue('price', v || 'all');
                  setValue('page', 1);
                }}
              />
              <Select
                label="Lọc theo danh mục"
                data={[
                  { value: 'all', label: 'Tất cả danh mục' },
                  { value: '1', label: 'Điện thoại' },
                  { value: '2', label: 'Máy tính bảng' },
                  { value: '3', label: 'Laptop' },
                  { value: '4', label: 'Phụ kiện' },
                ]}
                value={watchedCategoryId}
                onChange={(v) => {
                  setValue('category_id', v || 'all');
                  setValue('page', 1);
                }}
              />
              <Select
                label="Lọc theo thương hiệu"
                data={[
                  { value: 'all', label: 'Tất cả hãng' },
                  { value: 'Samsung', label: 'Samsung' },
                  { value: 'Apple', label: 'Apple' },
                  { value: 'Opple', label: 'Opple' },
                ]}
                value={watchedBrand}
                onChange={(v) => {
                  setValue('brand', v || 'all');
                  setValue('page', 1);
                }}
              />
            </Group>
          </Stack>

          {/* table */}
          {isPending ? (
            <Stack>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </Stack>
          ) : (
            <MyTable
              columns={productColumns}
              data={productData}
              page={watchedPage}
              total={productDataRes?.pagination.total_items || 0}
              onPageChange={(p) => setValue('page', p)}
            />
          )}
        </Stack>
      </DefaultLayout>
    </>
  );
}
