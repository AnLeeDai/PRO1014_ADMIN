import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';
import axios from 'axios'; // Import axios

interface Category {
  category_id: number;
  category_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_active: number;
}

const CategoryPage: React.FC<{
  searchTerm: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filterActive: string;
  handleFilterActiveChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  categories: Category[];
  openAddModal: () => void;
  isAdding: boolean;
  newCategory: Omit<Category, 'category_id'>;
  handleNewCategoryChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddCategory: () => Promise<void>;
  closeAddModal: () => void;
  isEditing: boolean;
  editingCategory: Category | null;
  openEditModal: (category: Category) => void;
  closeEditModal: () => void;
  handleEditCategoryChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSaveEditCategory: () => Promise<void>;
  handleToggleActiveCategory: (id: number) => void; // Loại bỏ isActive từ props
  currentPage: number;
  totalPages: number;
  currentCategories: Category[];
  paginate: (pageNumber: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}> = ({
  searchTerm,
  handleSearch,
  filterActive,
  handleFilterActiveChange,
  categories,
  openAddModal,
  isAdding,
  newCategory,
  handleNewCategoryChange,
  handleAddCategory,
  closeAddModal,
  isEditing,
  editingCategory,
  openEditModal,
  closeEditModal,
  handleEditCategoryChange,
  handleSaveEditCategory,
  handleToggleActiveCategory,
  currentPage,
  totalPages,
  currentCategories,
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
            placeholder="Tìm kiếm theo tên, mô tả hoặc trạng thái..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '20px', minWidth: '300px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="filterActive" style={{ marginRight: '10px', fontWeight: 'bold' }}>Lọc theo trạng thái:</label>
          <select
            id="filterActive"
            value={filterActive}
            onChange={handleFilterActiveChange}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '20px' }}
          >
            <option value="">Tất cả</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Modal thêm mới danh mục */}

      {/* Modal sửa danh mục */}
      {isEditing && editingCategory && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '400px' }}>
            <h2 style={{ marginBottom: '15px' }}>Sửa danh mục</h2>
            <label htmlFor="category_name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tên danh mục:</label>
            <input type="text" id="category_name" name="category_name" value={editingCategory.category_name} onChange={handleEditCategoryChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }} />
            <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mô tả:</label>
            <textarea id="description" name="description" value={editingCategory.description} onChange={handleEditCategoryChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }} />
            <label htmlFor="is_active" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Trạng thái hoạt động:</label>
            <select name="is_active" id="is_active" value={editingCategory.is_active} onChange={handleEditCategoryChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }}>
              <option value={1}>Đang hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </select>
            {/* Bạn có thể thêm input cho created_at và updated_at nếu cần */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={closeEditModal} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                Hủy
              </button>
              <button onClick={handleSaveEditCategory} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>
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
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Tên danh mục</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Mô tả</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Ngày tạo</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Ngày cập nhật</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Trạng thái</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentCategories.map((category) => (
            <tr
              key={category.category_id}
              style={{ backgroundColor: category.is_active === 0 ? '#f0f0f0' : 'white' }} // Đổi màu nền cho danh mục không hoạt động
            >
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{category.category_id}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{category.category_name}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px', wordBreak: 'break-word', maxWidth: '200px' }}>{category.description}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{category.created_at}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{category.updated_at}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>{category.is_active === 1 ? 'Đang hoạt động' : 'Không hoạt động'}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                <button onClick={() => openEditModal(category)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}>
                  Sửa
                </button>
                <button
                  onClick={() => handleToggleActiveCategory(category.category_id)}
                  style={{
                    backgroundColor: category.is_active === 1 ? '#dc3545' : '#28a745', // Đổi màu nền nút dựa trên trạng thái
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '5px',
                  }}
                >
                  {category.is_active === 1 ? 'Ẩn' : 'Hiển thị'} {/* Đổi text nút */}
                </button>
              </td>
            </tr>
          ))}
          {currentCategories.length === 0 && (
            <tr>
              <td colSpan={7} style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                Không có danh mục nào.
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

const WrappedCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState<Omit<Category, 'category_id'>>({
    category_name: '',
    description: '',
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    is_active: 1,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Giả sử bạn có token được lưu ở đâu đó, ví dụ: localStorage
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ0NzEzNzY4LCJleHAiOjE3NDQ3MTczNjh9.L6o5OUHp_F4Q3WMIyEFFQGbEoRn4ytS4Z9jUjIeD5GE'; // Token mới

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost/source_code/code/PRO1014_SERVER/routes/?request=get-category', {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token qua header
        },
      });
      setCategories(response.data.data);
    } catch (error: any) {
      console.error('Lỗi khi fetch danh mục:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterActiveChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterActive(event.target.value);
    setCurrentPage(1);
  };

  // Sắp xếp categories theo ID
  const sortedCategories = [...categories].sort((a, b) => a.category_id - b.category_id);

  const filteredCategories = sortedCategories.filter((category) => {
    const searchMatch =
      category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (searchTerm.toLowerCase() === 'đang hoạt động' && category.is_active === 1) ||
      (searchTerm.toLowerCase() === 'không hoạt động' && category.is_active === 0);

    if (filterActive === '') {
      return searchMatch;
    } else {
      return searchMatch && category.is_active.toString() === filterActive;
    }
  });

  const totalFilteredPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedFilteredCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const openAddModal = () => {
    setIsAdding(true);
    setNewCategory({
      category_name: '',
      description: '',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      is_active: 1,
    });
  };

  const closeAddModal = () => {
    setIsAdding(false);
  };

  const handleNewCategoryChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setNewCategory((prevCategory) => ({
      ...prevCategory,
      [name]: value,
    }));
  };

  const handleAddCategory = async () => {
    try {
      const response = await axios.post('http://localhost/source_code/code/PRO1014_SERVER/routes/?request=post-category', newCategory, { // Đã sửa URL
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });
      closeAddModal();
      fetchCategories(); // Gọi lại hàm fetch để refresh trang
    } catch (error: any) {
      console.error('Lỗi khi thêm danh mục:', error);
      alert('Có lỗi xảy ra khi thêm danh mục.');
    }
  };

  const openEditModal = (category: Category) => {
    setIsEditing(true);
    setEditingCategory(category);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditingCategory(null);
  };

  const handleEditCategoryChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingCategory) {
      const { name, value } = event.target;
      setEditingCategory((prevCategory) => ({
        ...prevCategory,
        [name]: value,
      }));
    }
  };

  const handleSaveEditCategory = async () => {
    if (editingCategory) {
      try {
        const response = await axios.put(
          'http://localhost/source_code/code/PRO1014_SERVER/routes/?request=put-category',
          { // Dữ liệu gửi qua body
            category_id: editingCategory.category_id,
            category_name: editingCategory.category_name,
            description: editingCategory.description,
            is_active: parseInt(editingCategory.is_active.toString(), 10), // Đảm bảo is_active là number
            // Bạn có thể cần gửi thêm các trường khác tùy thuộc vào API của bạn
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // Gửi token
            },
          }
        );
        closeEditModal();
        fetchCategories(); // Gọi lại hàm fetch để refresh trang
      } catch (error: any) {
        console.error('Lỗi khi sửa danh mục:', error);
        alert('Có lỗi xảy ra khi sửa danh mục.');
      }
    }
  };

  const handleToggleActiveCategory = (id: number) => {
    const updatedCategories = categories.map(cat => {
      if (cat.category_id === id) {
        return { ...cat, is_active: cat.is_active === 1 ? 0 : 1 };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const goToNextPage = () => {
    if (currentPage < totalFilteredPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <DefaultLayout
      title="Quản lý danh mục"
      action={() => openAddModal()}
    >
      <CategoryPage
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        filterActive={filterActive}
        handleFilterActiveChange={handleFilterActiveChange}
        // Truyền sortedCategories thay vì categories
        categories={sortedCategories}
        openAddModal={openAddModal}
        isAdding={isAdding}
        newCategory={newCategory}
        handleNewCategoryChange={handleNewCategoryChange}
        handleAddCategory={handleAddCategory}
        closeAddModal={closeAddModal}
        isEditing={isEditing}
        editingCategory={editingCategory}
        openEditModal={openEditModal}
        closeEditModal={closeEditModal}
        handleEditCategoryChange={handleEditCategoryChange}
        handleSaveEditCategory={handleSaveEditCategory}
        handleToggleActiveCategory={handleToggleActiveCategory}
        currentPage={currentPage}
        totalPages={totalFilteredPages}
        currentCategories={paginatedFilteredCategories}
        paginate={paginate}
        goToPreviousPage={goToPreviousPage}
        goToNextPage={goToNextPage}
      />
      {/* Modal thêm mới danh mục */}
      {isAdding && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '400px' }}>
            <h2 style={{ marginBottom: '15px' }}>Thêm mới danh mục</h2>
            <label htmlFor="category_name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tên danh mục:</label>
            <input type="text" id="category_name" name="category_name" value={newCategory.category_name} onChange={handleNewCategoryChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }} />
            <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mô tả:</label>
            <textarea id="description" name="description" value={newCategory.description} onChange={handleNewCategoryChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }} />
            <label htmlFor="is_active" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Trạng thái hoạt động:</label>
            <select name="is_active" id="is_active" value={newCategory.is_active} onChange={handleNewCategoryChange} style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }}>
              <option value={1}>Đang hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={closeAddModal} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                Hủy
              </button>
              <button onClick={handleAddCategory} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default WrappedCategoryPage;