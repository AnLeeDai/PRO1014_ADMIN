import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  Text,
  Loader,
  Pagination,
  TextInput,
  Group,
  Button,
  Modal,
  Image,
  NumberInput,
  Textarea,
  FileInput,
  Notification,
} from '@mantine/core';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';

// Component Textarea tùy chỉnh cho extra_info
interface ExtraInfoTextareaProps {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  [key: string]: any;
}

function ExtraInfoTextarea({
  label,
  name,
  defaultValue = '<li><li/>',
  error,
  required,
  onChange,
  ...props
}: ExtraInfoTextareaProps) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: { target: { value: any } }) => {
    let newValue = e.target.value;
    
    // Xử lý nếu người dùng nhập dấu phẩy
    if (newValue.endsWith(',')) {
      // Xóa dấu phẩy cuối cùng
      newValue = newValue.slice(0, -1);
      // Thêm thẻ <li><li/> vào cuối
      newValue += '<li><li/>';
    }
    
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    // Nếu defaultValue không có giá trị, khởi tạo với giá trị mặc định
    setValue(defaultValue || '<li><li/>');
  }, [defaultValue]);

  return (
    <Textarea
      label={label}
      name={name}
      value={value}
      onChange={handleChange}
      error={error}
      required={required}
      autosize
      minRows={4}
      {...props}
    />
  );
}
// Định nghĩa kiểu dữ liệu cho Product
type Product = {
  id: number;
  product_id: number;
  product_name: string;
  price: string;
  thumbnail: string;
  short_description: string;
  full_description: string;
  extra_info: string;
  in_stock: number;
  created_at: string;
  updated_at: string;
  brand: string;
  category_id: number;
  is_active: number;
  category_name: string | null;
  gallery: string[];
};

type ApiResponse = {
  success: boolean;
  message: string;
  filters?: {
    sort_by: string;
    search: string;
    category_id: number | null;
    min_price: number | null;
    max_price: number | null;
    brand: string | null;
  };
  pagination?: {
    current_page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
  data?: Product[];
};

function TableProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [filterType, setFilterType] = useState<'max' | 'min' | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const API_BASE = 'http://localhost/PRO1014_SERVER/routes/';
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyNCwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDQ0MDIzMCwiZXhwIjoxNzQ0NDQzODMwfQ.BpJyod1t2lTQhUGQipkvrpyZZ7gzxMvhx_iqdjfY92c';

  const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  

  // Hàm list sản phẩm và hiển thị giá trị min, max
  const fetchProducts = async (search: string, page: number, filter: 'max' | 'min' | null) => {
    setLoading(true); // Bật trạng thái loading khi bắt đầu lấy dữ liệu
    try {
      // Tạo object params để gửi yêu cầu lên server
      const params: any = { 
        request: 'get-products', 
        search, 
        page: page.toString(),
        show_hidden: '1' // Thêm tham số này để hiển thị cả sản phẩm đã ẩn
      };
      
      // Nếu filter là 'max', sắp xếp theo giá giảm dần để lấy sản phẩm có giá cao nhất
      if (filter === 'max') {
        params.sort_by = 'price_desc';
        // Không đặt limit để lấy toàn bộ sản phẩm
      } 
      // Nếu filter là 'min', sắp xếp theo giá tăng dần để lấy sản phẩm có giá thấp nhất
      else if (filter === 'min') {
        params.sort_by = 'price_asc';
        // Không đặt limit để lấy toàn bộ sản phẩm
      }

      // Gửi yêu cầu GET lên server với các tham số đã thiết lập
      const response = await axiosInstance.get('', { params });
      const data: ApiResponse = response.data;

      // Kiểm tra xem dữ liệu trả về có hợp lệ không
      if (data.success && data.data && data.pagination) {
        // Chuẩn hóa dữ liệu sản phẩm từ server
        let updatedProducts = data.data.map(product => ({
          ...product,
          id: product.id,
        }));

        // Xử lý lọc sản phẩm theo giá cao nhất hoặc thấp nhất
        if (filter === 'max' || filter === 'min') {
          // Tìm giá cực đại (max) hoặc cực tiểu (min) trong danh sách sản phẩm
          const extremePrice = filter === 'max'
            ? Math.max(...updatedProducts.map(p => parseFloat(p.price))) // Giá cao nhất
            : Math.min(...updatedProducts.map(p => parseFloat(p.price))); // Giá thấp nhất

          // Lọc ra tất cả sản phẩm có giá bằng với giá cực đại hoặc cực tiểu
          updatedProducts = updatedProducts.filter(p => parseFloat(p.price) === extremePrice);
        }

        // Cập nhật state với danh sách sản phẩm đã lọc
        setProducts(updatedProducts);
        setTotalPages(data.pagination.total_pages); // Cập nhật tổng số trang
      } else {
        console.error(data.message); // In lỗi nếu server trả về không thành công
      }
    } catch (error) {
      console.error('Có lỗi xảy ra khi tải dữ liệu:', error); // Xử lý lỗi khi gửi yêu cầu
    }
    setLoading(false); // Tắt trạng thái loading sau khi hoàn tất
  };

  useEffect(() => {
    fetchProducts(searchQuery, currentPage, filterType);
  }, [searchQuery, currentPage, filterType]);

  const openDetailModal = (product: Product) => {
    setSelectedProduct(product);
    setModalOpened(true);
  };

  // Hàm thêm sản phẩm
  const addProduct = async (newProduct: any, thumbnailFile: File | null) => {
    try {
      setFormErrors({});
      const formData = new FormData();
      formData.append('product_name', newProduct.product_name);
      formData.append('price', newProduct.price);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      formData.append('short_description', newProduct.short_description);
      formData.append('full_description', newProduct.full_description);
      formData.append('extra_info', newProduct.extra_info);
      formData.append('in_stock', newProduct.in_stock);
      formData.append('brand', newProduct.brand);
      formData.append('category_id', newProduct.category_id);

      console.log('Dữ liệu gửi đi khi thêm:', Object.fromEntries(formData));

      const response = await axiosInstance.post('', formData, {
        params: { request: 'post-product' },
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setAddModalOpened(false);
        fetchProducts(searchQuery, currentPage, filterType);
        setNotification('Thêm sản phẩm thành công');
      } else {
        console.error('Lỗi khi thêm sản phẩm:', response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
      console.error('Có lỗi xảy ra khi thêm sản phẩm:', error);
    }
  };

  // Hàm cập nhật sản phẩm
  const updateProduct = async (updatedProduct: any, thumbnailFile: File | null) => {
    try {
      setFormErrors({});

      // Lấy product_id từ selectedProduct (đảm bảo không bị thiếu)
      const productId = selectedProduct?.product_id || selectedProduct?.id;
      if (!productId) {
        console.error('Product ID is missing');
        setNotification('Lỗi: Thiếu ID sản phẩm');
        return;
      }

      const formData = new FormData();
      // Sử dụng productId đã lấy được
      formData.append('product_id', productId.toString());
      formData.append('product_name', updatedProduct.product_name);
      formData.append('price', updatedProduct.price);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      formData.append('short_description', updatedProduct.short_description);
      formData.append('full_description', updatedProduct.full_description);
      formData.append('extra_info', updatedProduct.extra_info);
      formData.append('in_stock', updatedProduct.in_stock);
      formData.append('brand', updatedProduct.brand);
      formData.append('category_id', updatedProduct.category_id);

      console.log('Dữ liệu gửi đi khi cập nhật:', Object.fromEntries(formData));

      const response = await axiosInstance.post('', formData, {
        params: { request: 'post-edit-product' },
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setEditModalOpened(false);
        fetchProducts(searchQuery, currentPage, filterType);
        setNotification('Cập nhật sản phẩm thành công');
      } else {
        console.error('Lỗi khi cập nhật sản phẩm:', response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        console.error('Có lỗi xảy ra khi cập nhật sản phẩm:', error);
      }
    }
  };

  // Hàm ẩn/hiện sản phẩm
  const toggleActive = async (id: number, isActive: number) => {
    console.log('ID được gửi:', id, 'Trạng thái hiện tại:', isActive);
    
    if (!id) {
      console.error('ID sản phẩm không hợp lệ');
      setNotification('Lỗi: ID sản phẩm không hợp lệ');
      return;
    }
    
    try {
      const newStatus = isActive ? 0 : 1;
      const requestType = newStatus === 1 ? 'post-unhide-product' : 'post-hide-product';
      
      await axiosInstance.post(
        '',
        { product_id: id, is_active: newStatus },
        { params: { request: requestType } }
      );
      
      // Cập nhật state trực tiếp thay vì tải lại dữ liệu từ server
      setProducts(prevProducts => 
        prevProducts.map(product => 
          (product.id === id || product.product_id === id) 
            ? { ...product, is_active: newStatus } 
            : product
        )
      );
      
      setNotification(newStatus === 1 ? 'Đã mở khóa sản phẩm thành công.' : 'Đã ẩn sản phẩm thành công.');
    } catch (error) {
      console.error('Có lỗi xảy ra khi cập nhật trạng thái:', error);
      setNotification('Có lỗi xảy ra khi cập nhật trạng thái sản phẩm.');
    }
  };
  
  return (
    <div>
      {/* Hiển thị thông báo nếu có */}
      {notification && (
        <Notification title="Thông báo" color="green" onClose={() => setNotification(null)}>
          {notification}
        </Notification>
      )}

      <TextInput
        placeholder="Tìm kiếm sản phẩm..."
        value={searchQuery}
        onChange={e => {
          setSearchQuery(e.currentTarget.value);
          setCurrentPage(1);
        }}
        mb="md"
      />

      <Group mb="md">
        <Button onClick={() => setFilterType('max')}>Giá cao nhất</Button>
        <Button onClick={() => setFilterType('min')}>Giá thấp nhất</Button>
        <Button onClick={() => setFilterType(null)}>Hiển thị tất cả</Button>
        <Button onClick={() => setAddModalOpened(true)}>Thêm sản phẩm</Button>
      </Group>

      {loading ? (
        <Loader />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Ảnh</th>
              <th>Giá</th>
              <th>Tiêu đề</th>
              <th>Phân khúc</th>
              <th>Mô tả</th>
              <th>Thông tin thêm</th>
              <th>Trong kho</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.product_name}</td>
                <td>
                  <Image src={product.thumbnail} alt={product.product_name} height={50} width={50} />
                </td>
                <td>{parseFloat(product.price).toLocaleString('vi-VN')} VND</td>
                <td>{product.short_description}</td>
                <td>{product.brand}</td>
                <td>{product.full_description.substring(0, 50)}...</td>
                <td>{product.extra_info.substring(0, 50)}...</td>
                <td>{product.in_stock}</td>
                <td>{product.is_active ? 'Hiển thị' : 'Ẩn'}</td>
                <td>
                  <Group>
                    <Button color="blue" onClick={() => openDetailModal(product)}>
                      Chi tiết
                    </Button>
                    <Button
                      color="yellow"
                      onClick={() => {
                        setSelectedProduct(product);
                        setEditModalOpened(true);
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      color={product.is_active ? 'red' : 'green'}
                      onClick={() => toggleActive(product.product_id || product.id, product.is_active)}
                    >
                      {product.is_active ? 'Ẩn' : 'Hiển thị'}
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Phân trang */}
      <Group justify="center" mt="md">
        <Pagination value={currentPage} total={totalPages} onChange={setCurrentPage} />
      </Group>

      {/* Modal chi tiết sản phẩm */}
      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="Chi tiết sản phẩm" size="lg">
        {selectedProduct && (
          <div>
            <Image
              src={selectedProduct.thumbnail}
              alt={selectedProduct.product_name}
              height={150}
              width="100%"
            />
            <Text>ID: {selectedProduct.product_id}</Text>
            <Text>Tên sản phẩm: {selectedProduct.product_name}</Text>
            <Text>
              Giá: {parseFloat(selectedProduct.price).toLocaleString('vi-VN')} VND
            </Text>
            <Text>Tiêu đề: {selectedProduct.short_description}</Text>
            <Text>Phân khúc: {selectedProduct.brand}</Text>
            <Text>Mô tả: {selectedProduct.full_description}</Text>
            <Text>Thông tin thêm: {selectedProduct.extra_info}</Text>
            <Text>Trong kho: {selectedProduct.in_stock}</Text>
            <Text>Ngày tạo: {selectedProduct.created_at}</Text>
            <Text>Ngày cập nhật: {selectedProduct.updated_at}</Text>
            <Text>Trạng thái: {selectedProduct.is_active ? 'Hiển thị' : 'Ẩn'}</Text>
          </div>
        )}
      </Modal>

      {/* Modal thêm sản phẩm */}
      <Modal opened={addModalOpened} onClose={() => setAddModalOpened(false)} title="Thêm sản phẩm" size="lg">
        <form
          onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newProduct = {
              product_name: formData.get('product_name') as string,
              price: formData.get('price') as string,
              short_description: formData.get('short_description') as string,
              full_description: formData.get('full_description') as string,
              extra_info: formData.get('extra_info') as string,
              in_stock: formData.get('in_stock') as string,
              brand: formData.get('brand') as string,
              category_id: formData.get('category_id') as string,
            };
            const thumbnailFile = formData.get('thumbnail') as File;
            addProduct(newProduct, thumbnailFile);
          }}
        >
          <TextInput label="Tên sản phẩm" name="product_name" required />
          <NumberInput label="Giá" name="price" required />
          <FileInput label="Ảnh thumbnail" name="thumbnail" onChange={setThumbnailFile} required />
          <TextInput label="Tiêu đề" name="short_description" required />
          <TextInput label="Phân khúc" name="brand" required />
          <Textarea label="Mô tả" name="full_description" required />
          {/* Sử dụng ExtraInfoTextarea với giá trị mặc định là `<li><li/>` */}
          <ExtraInfoTextarea
            label="Thông tin thêm"
            name="extra_info"
            defaultValue="<li><li/>"
            required
          />
          <NumberInput label="Số lượng" name="in_stock" required />
          <NumberInput label="Danh mục" name="category_id" required />
          <Button type="submit" mt="md">
            Thêm
          </Button>
        </form>
      </Modal>

      {/* Modal cập nhật sản phẩm */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Cập nhật sản phẩm"
        size="lg"
      >
        {selectedProduct && (
          <form
            onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updatedProduct = {
                product_id: formData.get('id') as string,
                product_name: formData.get('product_name') as string,
                price: formData.get('price') as string,
                short_description: formData.get('short_description') as string,
                full_description: formData.get('full_description') as string,
                extra_info: formData.get('extra_info') as string,
                in_stock: formData.get('in_stock') as string,
                brand: formData.get('brand') as string,
                category_id: formData.get('category_id') as string,
              };
              const thumbnailFile = formData.get('thumbnail') as File;
              updateProduct(updatedProduct, thumbnailFile);
            }}
          >
            <Text>ID: {selectedProduct.id || selectedProduct.product_id}</Text>
            <input type="hidden" name="id" value={selectedProduct.id || selectedProduct.product_id} />
            <TextInput
              label="Tên sản phẩm"
              name="product_name"
              defaultValue={selectedProduct.product_name}
              error={formErrors.product_name}
              required
            />
            <NumberInput
              label="Giá"
              name="price"
              defaultValue={parseFloat(selectedProduct.price)}
              error={formErrors.price}
              required
            />
            <FileInput label="Ảnh thumbnail" name="thumbnail" onChange={setThumbnailFile} />
            <TextInput
              label="Tiêu đề"
              name="short_description"
              defaultValue={selectedProduct.short_description}
              error={formErrors.short_description}
              required
            />
            <TextInput
              label="Phân khúc"
              name="brand"
              defaultValue={selectedProduct.brand}
              error={formErrors.brand}
              required
            />
            <Textarea
              label="Mô tả"
              name="full_description"
              defaultValue={selectedProduct.full_description}
              error={formErrors.full_description}
              required
            />
            {/* Sử dụng ExtraInfoTextarea cho extra_info, nếu dữ liệu từ sản phẩm rỗng thì dùng giá trị mặc định */}
            <ExtraInfoTextarea
              label="Thông tin thêm"
              name="extra_info"
              defaultValue={selectedProduct.extra_info || "<li><li/>"}
              error={formErrors.extra_info}
              required
            />
            <NumberInput
              label="Số lượng"
              name="in_stock"
              defaultValue={selectedProduct.in_stock}
              error={formErrors.in_stock}
              required
            />
            <NumberInput
              label="Danh mục"
              name="category_id"
              defaultValue={selectedProduct.category_id}
              error={formErrors.category_id}
              required
            />
            <Button type="submit" mt="md">
              Cập nhật
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default function ProductPage() {
  return (
    <DefaultLayout title="Quản lý Sản phẩm">
      <TableProduct />
    </DefaultLayout>
  );
}
