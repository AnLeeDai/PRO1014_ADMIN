import { SetStateAction, useState } from 'react';
import { IconEdit, IconEye, IconEyeOff, IconSearch, IconX } from '@tabler/icons-react';
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
import { useDisclosure } from '@mantine/hooks';
import MyTable from '@/components/MyTable/MyTable';
import { useProduct } from '@/hooks/useProduct';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';
import ModalConfirmProduct from './ModalConfirmProduct';
import ModalCreateProduct from './ModalCreateProduct';
import ModalDetailProduct from './ModalDetailProduct';
import ModalEditProduct from './ModalEditProduct';

const parseToVND = (price: number | string) => {
  return Number(price).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};

export default function ProductContainer() {
  const [opened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; is_active?: number } | null>(
    null
  );
  const [detailOpened, setDetailOpened] = useState(false);
  const [detailProduct, setDetailProduct] = useState<any>(null);
  const [createOpened, setCreateOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  const { data: productDataRes, isPending: isPendingProductDataRes } = useProduct();

  const handleToggleVisibility = (
    product: SetStateAction<{ id: number; is_active?: number } | null>
  ) => {
    setSelectedProduct(product);
    openDelete();
  };

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
          <Tooltip label="Xem chi tiết" color="blue" withArrow>
            <ActionIcon
              variant="filled"
              color="blue"
              aria-label="View"
              onClick={() => {
                setDetailProduct({
                  gallery: row.gallery,
                  full_description: row.full_description,
                  extra_info: row.extra_info,
                });
                setDetailOpened(true);
              }}
            >
              <IconSearch size={24} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Chỉnh sửa" color="indigo" withArrow>
            <ActionIcon
              variant="filled"
              color="indigo"
              aria-label="Edit"
              onClick={() => {
                setEditProduct({
                  id: row.id,
                  product_name: row.product_name,
                  price: row.price,
                  thumbnail: row.thumbnail,
                  short_description: row.short_description,
                  full_description: row.full_description,
                  extra_info: row.extra_info,
                  in_stock: row.in_stock,
                  brand: row.brand,
                  category_id: row.category_id,
                  category_name: row.category_name,
                  gallery: row.gallery,
                });
                setEditOpened(true);
              }}
            >
              <IconEdit size={24} />
            </ActionIcon>
          </Tooltip>

          <Tooltip
            label={row.is_active === 1 ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm'}
            color={row.is_active === 1 ? 'gray' : 'green'}
            withArrow
          >
            <ActionIcon
              variant="filled"
              color={row.is_active === 1 ? 'gray' : 'green'}
              aria-label={row.is_active === 1 ? 'Hide' : 'Show'}
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
    productDataRes?.data?.map((product: any) => ({
      id: product.id,
      product_name: product.product_name,
      category_name: product.category_name,
      category_id: product.category_id,
      price: parseToVND(product.price),
      in_stock: product.in_stock,
      brand: product.brand,
      thumbnail: product.thumbnail,
      gallery: product.gallery,
      created_at: product.created_at,
      is_active: product.is_active,
      full_description: product.full_description,
      extra_info: product.extra_info,
      short_description: product.short_description,
    })) || [];

  const handlerAddProduct = () => {
    setCreateOpened(true);
  };

  return (
    <>
      <ModalEditProduct
        opened={editOpened}
        onClose={() => setEditOpened(false)}
        product={editProduct}
      />

      <ModalCreateProduct opened={createOpened} onClose={() => setCreateOpened(false)} />

      <ModalDetailProduct
        opened={detailOpened}
        onClose={() => setDetailOpened(false)}
        product={detailProduct}
      />

      <ModalConfirmProduct
        opened={opened}
        onClose={closeDelete}
        onHide={() => {
          if (!selectedProduct) {
            return;
          }
          closeDelete();
        }}
        isState={selectedProduct?.is_active === 1 ? 'hide' : 'show'}
      />

      <DefaultLayout title="Quản lý sản phẩm" action={handlerAddProduct}>
        <Stack>
          <Stack>
            <TextInput
              flex={1}
              placeholder="Tìm kiếm sản phẩm"
              leftSection={<IconSearch size={16} />}
              rightSection={<IconX size={16} />}
              rightSectionWidth={30}
            />

            <Group justify="space-between">
              <Select
                flex={1}
                label="Lọc theo khoảng giá"
                defaultValue="0-100000"
                data={[
                  { value: '0-100000', label: '0 - 100.000' },
                  { value: '100000-500000', label: '100.000 - 500.000' },
                  { value: '500000-1000000', label: '500.000 - 1.000.000' },
                  { value: '1000000-2000000', label: '1.000.000 - 2.000.000' },
                ]}
              />

              <Select
                flex={1}
                label="Lọc theo danh mục"
                defaultValue="1"
                data={[
                  { value: '1', label: 'Danh mục 1' },
                  { value: '2', label: 'Danh mục 2' },
                  { value: '3', label: 'Danh mục 3' },
                ]}
              />

              <Select
                flex={1}
                label="Lọc theo thương hiệu"
                defaultValue="1"
                data={[
                  { value: '1', label: 'Thương hiệu 1' },
                  { value: '2', label: 'Thương hiệu 2' },
                  { value: '3', label: 'Thương hiệu 3' },
                ]}
              />
            </Group>
          </Stack>

          {/* Bảng dữ liệu sản phẩm */}
          {isPendingProductDataRes ? (
            <Stack>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </Stack>
          ) : (
            <MyTable
              columns={productColumns}
              data={productData}
              onPageChange={(page) => console.log(page)}
              page={1}
              total={productDataRes?.pagination.total_items || 0}
            />
          )}
        </Stack>
      </DefaultLayout>
    </>
  );
}
