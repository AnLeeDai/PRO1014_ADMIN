import React from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import MyTable from '@/components/MyTable/MyTable';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function UserPage() {
  const [page, setPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterValue, setFilterValue] = React.useState<string | null>(null);
  const filterOptions = ['Giá thấp đến cao', 'Giá cao đến thấp'];

  const productData: Product[] = [
    { id: 1, name: 'Product A', price: 20 },
    { id: 2, name: 'Product B', price: 35 },
  ];

  const productColumns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Tên sản phẩm' },
    { key: 'price', title: 'Giá', render: (item: any) => `$${item.price}` },
  ];

  const productActions = [
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

  const filteredProducts = productData.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DefaultLayout title="Quản lý người dùng" action={() => console.log('Add new user')}>
      <MyTable
        data={filteredProducts.slice((page - 1) * 5, page * 5)}
        columns={productColumns}
        actions={productActions}
        total={filteredProducts.length}
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
