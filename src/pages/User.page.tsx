import React from 'react';
import { Button, Table, Group, TextInput, Pagination, ActionIcon } from '@mantine/core';
import { IconEdit, IconEye, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';

interface Product {
  id: number;
  name: string;
  price: number;
  is_active?: number; // Thêm trường is_active để quản lý trạng thái ẩn/hiện
}

export default function UserPage() {
  const [page, setPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterValue] = React.useState<string | null>(null);
  const [products, setProducts] = React.useState<Product[]>([
    { id: 1, name: 'Product A', price: 20, is_active: 1 },
    { id: 2, name: 'Product B', price: 35, is_active: 0 },
  ]);
  const itemsPerPage = 5;

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = products
    .filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (filterValue === 'Giá thấp đến cao') {return a.price - b.price;}
      if (filterValue === 'Giá cao đến thấp') {return b.price - a.price;}
      return 0;
    });

  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Hàm xử lý nút "Thêm mới"
  const handleAddNew = () => {
    console.log('Thêm mới sản phẩm');
    // Logic thêm sản phẩm mới, ví dụ: mở modal hoặc chuyển hướng
  };

  // Hàm xử lý nút "Sửa"
  const handleEdit = (product: Product) => {
    console.log('Sửa sản phẩm:', product);
    // Logic mở modal sửa sản phẩm
  };

  // Hàm xử lý nút "Chi tiết"
  const handleDetail = (product: Product) => {
    console.log('Chi tiết sản phẩm:', product);
    // Logic chuyển hướng đến trang chi tiết
  };

  // Hàm xử lý nút "Ẩn/Hiện"
  const handleToggleActive = (product: Product) => {
    const updatedProducts = products.map((p) =>
      p.id === product.id ? { ...p, is_active: p.is_active === 1 ? 0 : 1 } : p
    );
    setProducts(updatedProducts);
    console.log('Thay đổi trạng thái sản phẩm:', product.id, 'is_active:', product.is_active);
  };

  return (
    <DefaultLayout title="Quản lý sản phẩm" action={handleAddNew}>
      <Group  mb="md">
        <TextInput
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.currentTarget.value);
            setPage(1); // Reset về trang 1 khi tìm kiếm
          }}
        />
        <Button onClick={handleAddNew}>Thêm mới</Button>
      </Group>

      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.is_active === 1 ? 'Hiển thị' : 'Ẩn'}</td>
              <td>
                <Group   >
                  <ActionIcon color="blue" onClick={() => handleEdit(product)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon color="green" onClick={() => handleDetail(product)}>
                    <IconEye size={16} />
                  </ActionIcon>
                  <ActionIcon
                    color={product.is_active === 1 ? 'red' : 'green'}
                    onClick={() => handleToggleActive(product)}
                  >
                    {product.is_active === 1 ? (
                      <IconToggleLeft size={16} />
                    ) : (
                      <IconToggleRight size={16} />
                    )}
                  </ActionIcon>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Group  justify="center" mt="md">
        <Pagination value={page} total={totalPages} onChange={setPage} />
      </Group>
    </DefaultLayout>
  );
}