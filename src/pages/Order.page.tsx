import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';
import axios from 'axios'; // Import axios

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  discount_code: string;
  product_name: string;
  thumbnail: string;
}

interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  discount_code?: string | null; // Thêm trường mã giảm giá
  product_id?: number | null;   // Thêm trường product ID
  items?: OrderItem[]; // Thêm thuộc tính items
}

const OrderPage: React.FC<{
  searchTerm: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filterValue: string;
  handleFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  orders: Order[];
  openAddModal: () => void;
  isAdding: boolean;
  newOrder: { type: 'buy_now' | 'from_cart'; product_id?: number; quantity?: number; discount_code?: string };
  handleNewOrderChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddOrder: () => Promise<void>;
  closeAddModal: () => void;
  isEditing: boolean;
  editingOrder: Order | null;
  openEditModal: (order: Order) => void;
  closeEditModal: () => void;
  handleEditOrderChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSaveEditOrder: () => Promise<void>;
  handleDeleteOrder: (id: number) => Promise<void>;
  currentPage: number;
  totalPages: number;
  currentOrders: Order[];
  paginate: (pageNumber: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}> = ({
  searchTerm,
  handleSearch,
  filterValue,
  handleFilterChange,
  orders,
  openAddModal,
  isAdding,
  newOrder,
  handleNewOrderChange,
  handleAddOrder,
  closeAddModal,
  isEditing,
  editingOrder,
  openEditModal,
  closeEditModal,
  handleEditOrderChange,
  handleSaveEditOrder,
  handleDeleteOrder,
  currentPage,
  totalPages,
  currentOrders,
  paginate,
  goToPreviousPage,
  goToNextPage,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="search" style={{ marginRight: '10px', fontWeight: 'bold' }}>Tìm kiếm:</label>
          <input
            type="text"
            id="search"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '20px', minWidth: '300px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="filter" style={{ marginRight: '10px', fontWeight: 'bold' }}>Lọc theo trạng thái:</label>
          <select
            id="filter"
            value={filterValue}
            onChange={handleFilterChange}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '20px' }}
          >
            <option value="">Tất cả</option>
            <option value="pending">Đang chờ</option>
            <option value="delivered">Đã giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          {/* Nút Thêm mới đã được chuyển lên DefaultLayout */}
        </div>
      </div>

      {/* Modal sửa đơn hàng */}
      {isEditing && editingOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '400px' }}>
            <h2 style={{ marginBottom: '15px' }}>Sửa đơn hàng</h2>
            <label htmlFor="user_id" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>User ID:</label>
            <input type="number" id="user_id" name="user_id" value={editingOrder.user_id} onChange={handleEditOrderChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }} />
            <label htmlFor="total_price" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tổng giá:</label>
            <input type="number" id="total_price" name="total_price" value={editingOrder.total_price} onChange={handleEditOrderChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }} />
            <label htmlFor="status" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Trạng thái:</label>
            <select name="status" id="status" value={editingOrder.status} onChange={handleEditOrderChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }}>
              <option value="pending">Đang chờ</option>
              <option value="delivered">Đã giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={closeEditModal} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                Hủy
              </button>
              <button onClick={handleSaveEditOrder} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>User ID</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Product ID</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Số lượng</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Mã giảm giá</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Tổng giá (Đã áp voucher)</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Trạng thái đơn hàng</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Ngày tạo</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Ngày cập nhật</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order) => (
            <tr key={order.id}>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{order.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{order.user_id}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                {order.items && order.items.length > 0 ? order.items[0].product_id : 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                {order.items && order.items.length > 0 ? order.items[0].quantity : 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                {order.items && order.items.length > 0 ? order.items[0].discount_code : 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{order.total_price}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{order.status}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{order.created_at}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{order.updated_at}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                <button onClick={() => openEditModal(order)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}>
                  Sửa
                </button>
              </td>
            </tr>
          ))}
          {currentOrders.length === 0 && (
            <tr>
              <td colSpan={10} style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                Không có đơn hàng nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button onClick={goToPreviousPage} disabled={currentPage === 1} style={{ padding: '8px 12px', margin: '0 5px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}>
            {'<'}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              style={{
                padding: '8px 12px',
                margin: '0 5px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                cursor: 'pointer',
                backgroundColor: currentPage === number ? '#007bff' : 'white',
                color: currentPage === number ? 'white' : 'black',
              }}
            >
              {number}
            </button>
          ))}
          <button onClick={goToNextPage} disabled={currentPage === totalPages} style={{ padding: '8px 12px', margin: '0 5px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}>
            {'>'}
          </button>
        </div>
      )}
    </div>
  );
};

const WrappedOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newOrder, setNewOrder] = useState<{ type: 'buy_now' | 'from_cart'; product_id?: number; quantity?: number; discount_code?: string }>({
    type: 'buy_now', // Default to 'buy_now'
    product_id: undefined,
    quantity: undefined,
    discount_code: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sử dụng token bạn vừa cung cấp
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ1NDMxNTc2LCJleHAiOjE3NDU0MzUxNzZ9.W0DR3B60PamZNUSF8C-43RcQ-4rEN3oT4cg65NOxBnk';
  const endpoint = 'http://localhost/source_code/code/PRO1014_SERVER/routes/'; // Định nghĩa endpoint

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${endpoint}?request=get-order-history`, {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token qua header
        },
      });
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
      } else {
        console.error('Dữ liệu đơn hàng không hợp lệ:', response.data);
        setOrders([]); // Hoặc một giá trị mặc định khác
      }
    } catch (error: any) {
      console.error('Lỗi khi fetch đơn hàng:', error);
      setOrders([]); // Đặt orders thành một mảng rỗng khi có lỗi
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterValue(event.target.value);
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter((order) => {
    const searchMatch =
      order.id.toString().includes(searchTerm.toLowerCase()) ||
      order.user_id.toString().includes(searchTerm.toLowerCase()) ||
      order.total_price.toString().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.created_at.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.updated_at.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.items && order.items.length > 0 && order.items[0].discount_code?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.items && order.items.length > 0 && order.items[0].product_id?.toString().includes(searchTerm.toLowerCase()));

    if (filterValue === '') {
      return searchMatch;
    } else {
      return searchMatch && order.status.toLowerCase() === filterValue.toLowerCase();
    }
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const openAddModal = () => {
    setIsAdding(true);
    setNewOrder({
      type: 'buy_now', // Default to 'buy_now'
      product_id: undefined,
      quantity: undefined,
      discount_code: '',
    });
  };

  const closeAddModal = () => {
    setIsAdding(false);
  };

  const handleNewOrderChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setNewOrder((prevOrder) => {
      if (name === 'type') {
        return { ...prevOrder, type: value as 'buy_now' | 'from_cart', product_id: undefined, quantity: undefined, discount_code: '' };
      }
      return { ...prevOrder, [name]: value };
    });
  };

  const handleAddOrder = async () => {
    try {
      let requestBody;
      if (newOrder.type === 'buy_now') {
        requestBody = {
          type: newOrder.type,
          product_id: newOrder.product_id,
          quantity: newOrder.quantity,
          discount_code: newOrder.discount_code,
        };
      } else if (newOrder.type === 'from_cart') {
        requestBody = {
          type: newOrder.type,
        };
      }

      const response = await axios.post(`${endpoint}?request=post-checkout`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      closeAddModal();
      fetchOrders(); // Gọi lại hàm fetch để refresh trang
    } catch (error: any) {
      console.error('Lỗi khi thêm đơn hàng:', error);
      alert('Có lỗi xảy ra khi thêm đơn hàng.');
    }
  };

  const openEditModal = (order: Order) => {
    setIsEditing(true);
    setEditingOrder(order);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditingOrder(null);
  };

  const handleEditOrderChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingOrder) {
      const { name, value } = event.target;
      setEditingOrder((prevOrder) => ({
        ...prevOrder,
        [name]: value,
      }));
    }
  };

  const handleSaveEditOrder = async () => {
    if (editingOrder) {
      try {
        const response = await axios.post(
          `${endpoint}?request=post-admin-update-order-status`,
          {
            order_id: editingOrder.id, // Sử dụng order_id thay vì id
            status: editingOrder.status,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        closeEditModal();
        fetchOrders(); // Gọi lại hàm fetch để refresh trang
      } catch (error: any) {
        console.error('Lỗi khi sửa đơn hàng:', error);
        alert('Có lỗi xảy ra khi sửa đơn hàng.');
      }
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng với ID ${id}?`)) {
      try {
        await axios.delete(`${endpoint}?request=delete-order/${id}`, { // Giữ nguyên endpoint xóa nếu nó vẫn đúng
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchOrders(); // Gọi lại hàm fetch để refresh trang
      } catch (error: any) {
        console.error('Lỗi khi xóa đơn hàng:', error);
        alert('Có lỗi xảy ra khi xóa đơn hàng.');
      }
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <DefaultLayout
      title="Quản lý đơn hàng"
      action={() => openAddModal()}
    >
      <OrderPage
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        filterValue={filterValue}
        handleFilterChange={handleFilterChange}
        orders={filteredOrders}
        openAddModal={openAddModal}
        isAdding={isAdding}
        newOrder={newOrder}
        handleNewOrderChange={handleNewOrderChange}
        handleAddOrder={handleAddOrder}
        closeAddModal={closeAddModal}
        isEditing={isEditing}
        editingOrder={editingOrder}
        openEditModal={openEditModal}
        closeEditModal={closeEditModal}
        handleEditOrderChange={handleEditOrderChange}
        handleSaveEditOrder={handleSaveEditOrder}
        handleDeleteOrder={handleDeleteOrder}
        currentPage={currentPage}
        totalPages={totalPages}
        currentOrders={currentOrders}
        paginate={paginate}
        goToPreviousPage={goToPreviousPage}
        goToNextPage={goToNextPage}
      />
      {/* Modal thêm mới đơn hàng */}
      {isAdding && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '400px' }}>
            <h2 style={{ marginBottom: '15px' }}>Thêm mới đơn hàng</h2>
            <label htmlFor="type" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Loại đơn hàng:</label>
            <select name="type" id="type" value={newOrder.type} onChange={handleNewOrderChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }}>
              <option value="buy_now">Mua ngay</option>
              <option value="from_cart">Từ giỏ hàng</option>
            </select>

            {newOrder.type === 'buy_now' && (
              <>
                <label htmlFor="product_id" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Product ID:</label>
                <input type="number" id="product_id" name="product_id" value={newOrder.product_id || ''} onChange={handleNewOrderChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }} />

                <label htmlFor="quantity" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Số lượng:</label>
                <input type="number" id="quantity" name="quantity" value={newOrder.quantity || ''} onChange={handleNewOrderChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }} />

                <label htmlFor="discount_code" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mã giảm giá:</label>
                <input type="text" id="discount_code" name="discount_code" value={newOrder.discount_code || ''} onChange={handleNewOrderChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }} />
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={closeAddModal} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                Hủy
              </button>
              <button onClick={handleAddOrder} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default WrappedOrderPage;