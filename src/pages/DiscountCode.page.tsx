import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';

interface DiscountCode {
  id: number;
  discount_code: string;
  percent_value: string;
  product_id: number;
  quantity: number;
  total_quantity: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

const DiscountCodePage: React.FC<{
  searchTerm: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  discountCodes: DiscountCode[];
  openAddModal: () => void;
  isAdding: boolean;
  newDiscountCode: Omit<DiscountCode, 'id'>;
  handleNewDiscountCodeChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleAddDiscountCode: () => Promise<void>;
  closeAddModal: () => void;
  handleDeleteDiscountCode: (id: number) => Promise<void>;
  currentPage: number;
  totalPages: number;
  currentDiscountCodes: DiscountCode[] | undefined;
  paginate: (pageNumber: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  filterValue: string; // New prop for filter value
  handleFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; // New prop for filter change handler
}> = ({
  searchTerm,
  handleSearch,
  discountCodes,
  openAddModal,
  isAdding,
  newDiscountCode,
  handleNewDiscountCodeChange,
  handleAddDiscountCode,
  closeAddModal,
  handleDeleteDiscountCode,
  currentPage,
  totalPages,
  currentDiscountCodes,
  paginate,
  goToPreviousPage,
  goToNextPage,
  filterValue, // Receive filter value
  handleFilterChange, // Receive filter change handler
}) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="search" style={{ marginRight: '10px', fontWeight: 'bold' }}>
            Tìm kiếm:
          </label>
          <input
            type="text"
            id="search"
            placeholder="Tìm kiếm theo mã giảm giá..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              marginRight: '20px',
              minWidth: '300px',
            }}
          />
        </div>
        <div>
          <label htmlFor="filter" style={{ marginRight: '10px', fontWeight: 'bold' }}>Lọc theo giá trị:</label>
          <select id="filter" value={filterValue} onChange={handleFilterChange} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <option value="">Tất cả</option>
            <option value="0-25">0% - 25%</option>
            <option value="26-50">26% - 50%</option>
            <option value="51-75">51% - 75%</option>
            <option value="76-100">76% - 100%</option>
          </select>
        </div>
      </div>

      {/* Modal thêm mới mã giảm giá */}
      {isAdding && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              width: '400px',
            }}
          >
            <h2 style={{ marginBottom: '15px' }}>Thêm mới mã giảm giá</h2>
            <label
              htmlFor="discount_code"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Mã giảm giá:
            </label>
            <input
              type="text"
              id="discount_code"
              name="discount_code"
              value={newDiscountCode.discount_code}
              onChange={handleNewDiscountCodeChange}
              style={{
                width: '100%',
                padding: '8px',
                margin: '10px 0',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
            <label
              htmlFor="percent_value"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Giá trị phần trăm:
            </label>
            <input
              type="number"
              id="percent_value"
              name="percent_value"
              value={newDiscountCode.percent_value}
              onChange={handleNewDiscountCodeChange}
              style={{
                width: '100%',
                padding: '8px',
                margin: '10px 0',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
            <label
              htmlFor="product_id"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              ID sản phẩm:
            </label>
            <input
              type="number"
              id="product_id"
              name="product_id"
              value={newDiscountCode.product_id}
              onChange={handleNewDiscountCodeChange}
              style={{
                width: '100%',
                padding: '8px',
                margin: '10px 0',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
            <label
              htmlFor="quantity"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Số lượng:
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={newDiscountCode.quantity}
              onChange={handleNewDiscountCodeChange}
              style={{
                width: '100%',
                padding: '8px',
                margin: '10px 0',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
            <label
              htmlFor="total_quantity"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Tổng số lượng:
            </label>
            <input
              type="number"
              id="total_quantity"
              name="total_quantity"
              value={newDiscountCode.total_quantity}
              onChange={handleNewDiscountCodeChange}
              style={{
                width: '100%',
                padding: '8px',
                margin: '10px 0',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
            <label
              htmlFor="start_date"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Ngày bắt đầu:
            </label>
            <input
              type="datetime-local"
              id="start_date"
              name="start_date"
              value={
                newDiscountCode.start_date
                  ? new Date(newDiscountCode.start_date)
                      .toISOString()
                      .slice(0, 19)
                      .replace('T', ' ')
                  : ''
              }
              onChange={handleNewDiscountCodeChange}
              style={{
                width: '100%',
                padding: '8px',
                margin: '10px 0',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
            <label
              htmlFor="end_date"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Ngày kết thúc:
            </label>
            <input
              type="datetime-local"
              id="end_date"
              name="end_date"
              value={
                newDiscountCode.end_date
                  ? new Date(newDiscountCode.end_date).toISOString().slice(0, 19).replace('T', ' ')
                  : ''
              }
              onChange={handleNewDiscountCodeChange}
              style={{
                width: '100%',
                padding: '8px',
                margin: '10px 0',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={closeAddModal}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleAddDiscountCode}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              ID
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              Mã giảm giá
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              Giá trị (%)
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              ID sản phẩm
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              Số lượng
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              Tổng số lượng
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              Ngày bắt đầu
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              Ngày kết thúc
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              Ngày tạo
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              Ngày cập nhật
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {currentDiscountCodes && currentDiscountCodes.length > 0 ? (
            currentDiscountCodes.map((discountCode) => {
              // console.log(discountCode.id);
              return (
                <tr key={discountCode.id}>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>{discountCode.id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    {discountCode.discount_code}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    {discountCode.percent_value}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    {discountCode.product_id}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    {discountCode.quantity}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    {discountCode.total_quantity}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    {discountCode.start_date}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    {discountCode.end_date}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    {discountCode.created_at}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    {discountCode.updated_at}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteDiscountCode(discountCode.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={11}
                style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}
              >
                {currentDiscountCodes === undefined
                  ? 'Đang tải mã giảm giá...'
                  : 'Không có mã giảm giá nào.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              margin: '0 5px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              cursor: 'pointer',
            }}
          >
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
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              margin: '0 5px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              cursor: 'pointer',
            }}
          >
            {'>'}
          </button>
        </div>
      )}
    </div>
  );
};

const WrappedDiscountCodePage: React.FC = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState<Omit<DiscountCode, 'id'>>({
    discount_code: '',
    percent_value: '',
    product_id: 0,
    quantity: 0,
    total_quantity: 0,
    start_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    end_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ0NzEzNzY4LCJleHAiOjE3NDQ3MTczNjh9.L6o5OUHp_F4Q3WMIyEFFQGbEoRn4ytS4Z9jUjIeD5GE';
  const [filterValue, setFilterValue] = useState(''); // New state for filter value

  const fetchDiscountCodes = async () => {
    try {
      const response = await axios.get(
        'http://localhost/source_code/code/PRO1014_SERVER/routes/?request=get-discounts',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDiscountCodes(response.data.data);
    } catch (error: any) {
      console.error('Lỗi khi fetch mã giảm giá:', error);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterValue(event.target.value);
    setCurrentPage(1); // Reset page when filter changes
  };

  const filteredDiscountCodes = discountCodes.filter((discountCode) => {
    const searchMatch = discountCode.discount_code.toLowerCase().includes(searchTerm.toLowerCase());
    let filterMatch = true;

    if (filterValue) {
      const [minStr, maxStr] = filterValue.split('-');
      const min = parseInt(minStr, 10);
      const max = parseInt(maxStr, 10);
      const percent = parseInt(discountCode.percent_value, 10);
      filterMatch = percent >= min && percent <= max;
    }

    return searchMatch && filterMatch;
  });

  const totalFilteredPages = Math.ceil(filteredDiscountCodes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDiscountCodes = filteredDiscountCodes.slice(indexOfFirstItem, indexOfLastItem);

  const openAddModal = () => setIsAdding(true);
  const closeAddModal = () => setIsAdding(false);

  const handleNewDiscountCodeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setNewDiscountCode((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddDiscountCode = async () => {
    try {
      await axios.post(
        'http://localhost/source_code/code/PRO1014_SERVER/routes/?request=post-discount',
        newDiscountCode,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      closeAddModal();
      fetchDiscountCodes();
    } catch (error: any) {
      console.error('Lỗi khi thêm mã giảm giá:', error);
      alert('Có lỗi xảy ra khi thêm mã giảm giá.');
    }
  };

  const handleDeleteDiscountCode = async (id: number) => {
    console.log(id);

    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        await axios.delete(
          `http://localhost/source_code/code/PRO1014_SERVER/routes/?request=delete-discount`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: { // Send data in the request body
              discount_id: id,
            },
          }
        );
        fetchDiscountCodes();
      } catch (error: any) {
        console.error('Lỗi khi xóa mã giảm giá:', error);
        alert('Có lỗi xảy ra khi xóa mã giảm giá.');
      }
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalFilteredPages));

  return (
    <DefaultLayout title="Quản lý mã giảm giá" action={() => openAddModal()}>
      <DiscountCodePage
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        discountCodes={discountCodes}
        openAddModal={openAddModal}
        isAdding={isAdding}
        newDiscountCode={newDiscountCode}
        handleNewDiscountCodeChange={handleNewDiscountCodeChange}
        handleAddDiscountCode={handleAddDiscountCode}
        closeAddModal={closeAddModal}
        handleDeleteDiscountCode={handleDeleteDiscountCode}
        currentPage={currentPage}
        totalPages={totalFilteredPages}
        currentDiscountCodes={currentDiscountCodes}
        paginate={paginate}
        goToPreviousPage={goToPreviousPage}
        goToNextPage={goToNextPage}
        filterValue={filterValue} // Pass filter value to DiscountCodePage
        handleFilterChange={handleFilterChange} // Pass filter change handler
      />
    </DefaultLayout>
  );
};

export default WrappedDiscountCodePage;