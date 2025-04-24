import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Button, FileInput, Group, LoadingOverlay, Stack, Table, Text, Input, Notification, Modal, TextInput, Select, PasswordInput } from '@mantine/core';

import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';

interface User {
  user_id: number;
  username: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  avatar_url: string | null;
  password_changed_at: string | null;
  created_at: string;
  role: string;
  is_active: number;
}


const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Record<number, Partial<User>>>({});

  // State cho việc upload avatar riêng
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatarUserId, setUploadingAvatarUserId] = useState<number | null>(null);

  const [deactivatingUserId, setDeactivatingUserId] = useState<number | null>(null);
  const [reactivatingUserId, setReactivatingUserId] = useState<number | null>(null);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [addUserFormData, setAddUserFormData] = useState({
    username: '',
    password: '',
    password_confirm: '',
    full_name: '',
    email: '',
    phone_number: '',
    role: 'user',
    address: '',
  });
  const [addingUser, setAddingUser] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);


  // Cập nhật giá trị token mới
  // TODO: Token này không nên để hardcode ở đây.
  // Cần có cơ chế quản lý xác thực và token an toàn hơn (ví dụ: context API, http-only cookies).
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ1NDY1MzEwLCJleHAiOjE3NDU0Njg5MTB9.FuqOYh1hKQJuoJwVpHSKOt0rr0myuSZOYpyHJNAdaXw';

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost/source_code/code/PRO1014_SERVER/routes/?request=get-users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedUsers: User[] = response.data.data;
      setUsers(fetchedUsers);
      const initialFormData: Record<number, Partial<User>> = {};
      fetchedUsers.forEach((user: User) => {
        initialFormData[user.user_id] = { ...user };
      });
      setEditFormData(initialFormData);
    } catch (err: any) {
      setError('Không thể tải thông tin người dùng.');
      console.error('Lỗi khi tải thông tin người dùng:', err);
       if (err.response?.data) {
           console.error('Response Error Data:', err.response.data);
       }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleInputChange = (userId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [userId]: {
        ...prevData[userId],
        [name]: value,
      },
    }));
  };

  const handleEditClick = (user: User) => {
    setEditingUserId(user.user_id);
     // Reset avatar file và uploading user khi bắt đầu chỉnh sửa user mới
    setAvatarFile(null);
    setUploadingAvatarUserId(null);
  };

  const handleCancelEdit = () => {
    const userIdToCancel = editingUserId; // Lưu lại ID trước khi set null
    setEditingUserId(null);
    setAvatarFile(null);
    setUploadingAvatarUserId(null);

    // Tùy chọn: Hoàn nguyên editFormData về trạng thái gốc từ users state khi Hủy
    if (userIdToCancel !== null) {
        const originalUser = users?.find(u => u && typeof u.user_id === 'number' && u.user_id === userIdToCancel); // Thêm kiểm tra an toàn
        if (originalUser) {
            setEditFormData(prevData => ({
                ...prevData,
                [userIdToCancel]: { ...originalUser } // Đặt lại dữ liệu gốc
            }));
        }
    }
  };

  const validateEditFormData = (formData: Partial<User>): string | null => {
    if (!formData.full_name) {
        return 'Họ và tên không được để trống.';
    }
     if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
         return 'Email không hợp lệ.';
     }
    return null;
  };

  const handleAvatarChange = (file: File | null, userId: number) => {
    setAvatarFile(file);
    setUploadingAvatarUserId(userId);
    // console.log('Avatar file selected:', file, 'for user:', userId); // Debug log
  };


   const uploadUserAvatar = async (userId: number) => {
     if (!avatarFile || uploadingAvatarUserId !== userId) {
       setError('Vui lòng chọn một ảnh đại diện trước khi tải lên.');
       setTimeout(() => setError(null), 5000);
       return;
     }

     setLoading(true);
     setError(null);

     // Tạo URL tạm thời để optimistic update (hiển thị ảnh mới ngay lập tức)
     const userToUpdate = users?.find(u => u && typeof u.user_id === 'number' && u.user_id === userId);
     const oldAvatarUrl = userToUpdate?.avatar_url;
     let newAvatarUrl: string | null = null; // Biến để lưu URL tạm thời

     if(avatarFile) {
        newAvatarUrl = URL.createObjectURL(avatarFile);
        // Optimistic update: Cập nhật avatar_url trong state với URL tạm thời
        setUsers((prevUsers) =>
          prevUsers?.map((u) =>
            u && typeof u.user_id === 'number' && u.user_id === userId ? { ...u, avatar_url: newAvatarUrl } : u
          ) || []
        );
     }


     try {
       const formData = new FormData();
       formData.append('avatar', avatarFile);
       formData.append('user_id', userId.toString()); // Backend có thể yêu cầu user_id

       const response = await axios.post(
         'http://localhost/source_code/code/PRO1014_SERVER/routes/?request=post-avatar',
         formData,
         {
           headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
         }
       );

        const responseData = response.data;
        // === FIX: Lấy toàn bộ object user đã cập nhật từ response.data.user ===
        const updatedUserFromServer: User | null | undefined = responseData?.user;


        // === Kiểm tra nếu request thành công VÀ response chứa object user hợp lệ ===
        if (responseData?.success === true && typeof updatedUserFromServer === 'object' && updatedUserFromServer !== null && typeof updatedUserFromServer.user_id === 'number') {
             // Cập nhật state users bằng cách thay thế user cũ bằng object user MỚI từ server
            setUsers(prevUsers =>
                prevUsers?.map(u =>
                   u && typeof u.user_id === 'number' && u.user_id === userId ? updatedUserFromServer : u // Thay thế object cũ bằng object mới từ server
                ) || []
            );

            // Giải phóng bộ nhớ cho URL tạm thời sau khi đã cập nhật state bằng dữ liệu server
            if (newAvatarUrl && newAvatarUrl.startsWith('blob:')) {
                URL.revokeObjectURL(newAvatarUrl);
            }

             setError('Ảnh đại diện đã được tải lên thành công.'); // Thông báo thành công
             setTimeout(() => setError(null), 5000);

        } else {
             // === Xử lý trường hợp API báo thành công nhưng cấu trúc phản hồi không đúng mong muốn ===
             // Hoàn nguyên optimistic update nếu có URL tạm thời
             if (newAvatarUrl && newAvatarUrl.startsWith('blob:')) {
                 setUsers(prevUsers =>
                     prevUsers?.map(u =>
                        u && typeof u.user_id === 'number' && u.user_id === userId ? { ...u, avatar_url: oldAvatarUrl } : u // Hoàn nguyên về URL cũ
                     ) || []
                 );
                 URL.revokeObjectURL(newAvatarUrl); // Giải phóng URL tạm thời
             }

             const errorMessage = responseData?.message || 'Tải ảnh đại diện thành công nhưng không nhận được thông tin user cập nhật từ server.';
             setError(errorMessage); // Hiển thị lỗi
             console.error('Response data structure incorrect after avatar upload:', responseData); // Log response data
        }


       setAvatarFile(null); // Reset state file đã chọn
       setUploadingAvatarUserId(null); // Reset state user đang upload


     } catch (err: any) {
       // === Xử lý lỗi khi gọi API (network error, 400, 500 etc.) ===
       const errorMessage = err.response?.data?.message || 'Không thể tải lên ảnh đại diện.';
       setError(errorMessage); // Hiển thị thông báo lỗi
       console.error('Lỗi khi tải lên ảnh đại diện:', err);
       if (err.response?.data) {
           console.error('Response Error Data:', err.response.data);
       }

       // Hoàn nguyên optimistic update nếu có URL tạm thời và lỗi API
        if (newAvatarUrl && newAvatarUrl.startsWith('blob:')) {
            setUsers(prevUsers =>
                prevUsers?.map(u =>
                   u && typeof u.user_id === 'number' && u.user_id === userId ? { ...u, avatar_url: oldAvatarUrl } : u // Hoàn nguyên về URL cũ
                ) || []
            );
            URL.revokeObjectURL(newAvatarUrl); // Giải phóng URL tạm thời
        }

     } finally {
       setLoading(false); // Tắt loading
     }
   };


  const handleSaveClick = async (userId: number) => {
    const dataToSave = editFormData[userId];

    const validationError = validateEditFormData(dataToSave);
    if (validationError) {
        setError(validationError);
        setTimeout(() => setError(null), 5000);
        return;
    }

    setLoading(true);
    setError(null);

    const originalUser = users?.find(u => u && typeof u.user_id === 'number' && u.user_id === userId); // Thêm kiểm tra an toàn

    if (!originalUser) {
         setError('Lỗi: Không tìm thấy thông tin người dùng gốc để lưu.');
         setLoading(false);
         return;
    }

    const jsonDataToSend: any = {
         user_id: userId,
         username: originalUser.username,
         role: originalUser.role,
    };

     Object.keys(editFormData[userId]).forEach(key => {
         if (key !== 'user_id' && key !== 'username' && key !== 'role') {
              const value = editFormData[userId][key as keyof Partial<User>];
              jsonDataToSend[key] = value === null || value === undefined ? '' : value;
         }
     });

    try {
      const response = await axios.put(
        'http://localhost/source_code/code/PRO1014_SERVER/routes/?request=put-user',
        jsonDataToSend,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );

       const responseData = response.data;
       const updatedUserFromServer: User | null | undefined = responseData?.data;


       if (responseData?.success === true && typeof updatedUserFromServer === 'object' && updatedUserFromServer !== null && typeof updatedUserFromServer.user_id === 'number') {
            setUsers(prevUsers =>
              prevUsers?.map(user =>
                user && typeof user.user_id === 'number' && user.user_id === userId ? updatedUserFromServer : user // Thêm kiểm tra an toàn
              ) || []
            );

            setEditFormData(prevData => ({
                ...prevData,
                [userId]: { ...updatedUserFromServer }
            }));

             setError('Cập nhật thông tin người dùng thành công.');
             setTimeout(() => setError(null), 5000);
             setEditingUserId(null);
       } else {
            const errorMessage = responseData?.message || 'Cập nhật thông tin thành công nhưng không nhận được dữ liệu user_id từ server.';
            setError(errorMessage);
             console.error('Response data structure incorrect after saving user info:', responseData);
       }


    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật thông tin người dùng.';
      setError(errorMessage);
      console.error('Lỗi khi cập nhật thông tin người dùng:', err);
       if (err.response?.data) {
           console.error('Response Error Data:', err.response.data);
       }
    } finally {
      setLoading(false);
    }
  };


  const deactivateUserAccount = async (userId: number) => {
     const user = users?.find((u) => u && typeof u.user_id === 'number' && u.user_id === userId); // Thêm kiểm tra an toàn
     if (!user || user.is_active === 0) { // Kiểm tra user tồn tại trước
       setError('Tài khoản này đã bị vô hiệu hóa hoặc không tồn tại.');
       setTimeout(() => setError(null), 5000);
       return;
     }

     setDeactivatingUserId(userId);
     setError(null);
     try {
       await axios.post(
         'http://localhost/source_code/code/PRO1014_SERVER/routes/?request=post-deactivate-user',
         { user_id: userId },
         { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
       );
       setUsers((prevUsers) =>
         prevUsers?.map((u) =>
           u && typeof u.user_id === 'number' && u.user_id === userId ? { ...u, is_active: 0 } : u // Thêm kiểm tra an toàn
         ) || []
       );
       setError('Tài khoản đã được vô hiệu hóa thành công.');
       setTimeout(() => setError(null), 5000);
     } catch (err: any) {
       const errorMessage = err.response?.data?.message || 'Không thể vô hiệu hóa người dùng.';
       setError(errorMessage);
       console.error('Lỗi khi vô hiệu hóa người dùng:', err);
        if (err.response?.data) {
            console.error('Response Error Data:', err.response.data);
        }
        // Hoàn nguyên nếu lỗi
        setUsers(prevUsers =>
            prevUsers?.map(u =>
                 u && typeof u.user_id === 'number' && u.user_id === userId ? { ...u, is_active: 1 } : u // Thêm kiểm tra an toàn
            ) || []
        );
     } finally {
       setDeactivatingUserId(null);
     }
  };

  const reactivateUserAccount = async (userId: number) => {
     const user = users?.find((u) => u && typeof u.user_id === 'number' && u.user_id === userId); // Thêm kiểm tra an toàn
     if (!user || user.is_active === 1) { // Kiểm tra user tồn tại trước
       setError('Tài khoản này đang hoạt động hoặc không tồn tại.');
       setTimeout(() => setError(null), 5000);
       return;
     }

     setReactivatingUserId(userId);
     setError(null);
     try {
       await axios.post(
         'http://localhost/source_code/code/PRO1014_SERVER/routes/?request=post-reactivate_user',
         { user_id: userId },
         { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
       );
       setUsers((prevUsers) =>
         prevUsers?.map((u) =>
           u && typeof u.user_id === 'number' && u.user_id === userId ? { ...u, is_active: 1 } : u // Thêm kiểm tra an toàn
         ) || []
       );
       setError('Tài khoản đã được kích hoạt lại thành công.');
       setTimeout(() => setError(null), 5000);
     } catch (err: any) {
       const errorMessage = err.response?.data?.message || 'Không thể kích hoạt lại người dùng.';
       setError(errorMessage);
       console.error('Lỗi khi kích hoạt lại người dùng:', err);
        if (err.response?.data) {
            console.error('Response Error Data:', err.response.data);
        }
        // Hoàn nguyên nếu lỗi
        setUsers(prevUsers =>
            prevUsers?.map(u =>
                 u && typeof u.user_id === 'number' && u.user_id === userId ? { ...u, is_active: 0 } : u // Thêm kiểm tra an toàn
            ) || []
        );
     } finally {
       setReactivatingUserId(null);
     }
  };

  const openAddModal = () => {
     setIsAddUserModalOpen(true);
     setAddFormError(null);
  };

  const closeAddUserModal = () => {
     setIsAddUserModalOpen(false);
     setAddUserFormData({ username: '', password: '', password_confirm: '', full_name: '', email: '', phone_number: '', role: 'user', address: '' });
     setAddFormError(null);
  };

  const handleAddUserInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     const { name, value } = event.target;
     setAddUserFormData((prevData) => ({
       ...prevData,
       [name]: value,
     }));
  };

   const validateAddFormData = (formData: typeof addUserFormData): string | null => {
        if (!formData.username) { return 'Tên đăng nhập không được để trống.'; }
         if (!formData.password) { return 'Mật khẩu không được để trống.'; }
         if (formData.password !== formData.password_confirm) { return 'Mật khẩu và mật khẩu xác nhận không khớp.'; }
        if (!formData.full_name) { return 'Họ và tên không được để trống.'; }
         if (!formData.email) { return 'Email không được để trống.'; }
        return null;
   }


  const handleCreateUser = async () => {
     const validationError = validateAddFormData(addUserFormData);
     if (validationError) {
         setAddFormError(validationError);
         setTimeout(() => setAddFormError(null), 5000);
         return;
     }

     setAddingUser(true);
     setAddFormError(null);
     try {
       const response = await axios.post(
         'http://localhost/source_code/code/PRO1014_SERVER/routes/?request=post-register',
         {
           username: addUserFormData.username,
           password: addUserFormData.password,
           password_confirm: addUserFormData.password_confirm,
           full_name: addUserFormData.full_name,
           email: addUserFormData.email,
           phone_number: addUserFormData.phone_number,
           role: addUserFormData.role,
           address: addUserFormData.address,
         },
         { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
       );

       const responseData = response.data;
       const newUserRawData: any = responseData?.data;

       if (responseData?.success === true && typeof newUserRawData === 'object' && newUserRawData !== null && typeof newUserRawData.user_id === 'number') {
            const newUser: User = newUserRawData;

            setUsers(prevUsers => {
                if (!prevUsers) return [newUser];
                // Kiểm tra an toàn hơn khi tìm kiếm user_id trùng lặp
                if (prevUsers.some(u => u && typeof u.user_id === 'number' && u.user_id === newUser.user_id)) {
                    console.warn('Attempted to add duplicate user ID:', newUser.user_id);
                    return prevUsers;
                }
                return [...prevUsers, newUser];
            });

            setError('Người dùng đã được thêm thành công.');
            setTimeout(() => setError(null), 5000);

            closeAddUserModal();

       } else {
            const errorMessage = responseData?.message || 'Thêm người dùng thành công nhưng không nhận được thông tin chi tiết user_id từ server.';
            setAddFormError(errorMessage);
            console.error('Response data structure incorrect after adding user:', responseData);
       }


     } catch (err: any) {
       const errorMessage = err.response?.data?.message || 'Không thể thêm người dùng.';
       setAddFormError(`Không thể thêm người dùng. Lỗi: ${errorMessage}`);
       console.error('Lỗi khi gọi API thêm người dùng:', err);
        if (err.response?.data) {
            console.error('Response Error Data:', err.response.data);
        }
     } finally {
       setAddingUser(false);
     }
  };


  return (
    <DefaultLayout title="Thông tin người dùng" action={openAddModal}>
      <style>
        {`
           /* CSS chung cho trang */
           .user-page-container { padding: 20px; font-family: sans-serif; }
           /* CSS cho tiêu đề trang */
           .user-page-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
           /* CSS cho bảng thông tin người dùng */
           .user-info-table { width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #e0e0e0; }
           .user-info-table thead th { background-color: #f5f5f5; color: #333; font-weight: bold; padding: 10px; text-align: left; border-bottom: 2px solid #e0e0e0; }
           .user-info-table tbody td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
           .user-info-table tbody tr.deactivated-user td { background-color: #D3D3D3; color: #333; }
           .user-info-table tbody tr:last-child td { border-bottom: none; }

           /* Style cho div bọc ảnh đại diện */
           .avatar-image-wrapper {
               width: 50px; /* Kích thước cố định */
               height: 50px; /* Kích thước cố định */
               border-radius: 50%; /* Bo tròn */
               overflow: hidden; /* Cắt ảnh thừa */
               flex-shrink: 0; /* Ngăn co lại */
               display: flex; /* Dùng flexbox để căn giữa nội dung bên trong */
               align-items: center;
               justify-content: center;
               /* Thêm margin-right nếu cần khoảng cách với các phần tử khác trong cùng cell */
           }
           .avatar-image-wrapper img {
               width: 100%; /* Ảnh lấp đầy wrapper */
               height: 100%; /* Ảnh lấp đầy wrapper */
               object-fit: cover; /* Đảm bảo ảnh không bị méo */
           }


           /* CSS cho các nút vô hiệu hóa/kích hoạt */
           .account-actions-group { /* margin-top: 30px; */ }
           .account-actions-group .mantine-Button-root { margin-right: 10px; }

           /* Điều chỉnh cho layout trong ô bảng khi chỉnh sửa */
           .table-edit-cell-content {
               display: flex;
               flex-direction: column; /* Xếp các input/group theo cột */
               gap: 10px; /* Khoảng cách giữa các phần tử con (ảnh, input, button) */
               align-items: flex-start; /* Căn các phần tử con về bên trái */
           }
           .table-edit-cell-content .mantine-Input-wrapper,
           .table-edit-cell-content .mantine-Group,
           .table-edit-cell-content .mantine-FileInput-root, /* Thêm FileInput vào đây */
           .table-edit-cell-content .mantine-Button /* Thêm Button vào đây */
           {
                width: 100%; /* Chiếm toàn bộ chiều rộng của cột flex */
           }
            /* Riêng cho avatar-image-wrapper trong cột flex, không chiếm hết width */
           .table-edit-cell-content .avatar-image-wrapper {
               width: 50px;
               height: 50px;
           }


        `}
      </style>
      {/* LoadingOverlay hiển thị khi đang có một quá trình xử lý thực sự diễn ra */}
      <LoadingOverlay
        visible={
          loading || deactivatingUserId !== null || reactivatingUserId !== null || addingUser
        }
        overlayBlur={2}
      />
      {/* Hiển thị lỗi chính (cho các thao tác khác ngoài thêm mới) */}
      {error && (
        <Notification
          color={error.startsWith('Tài khoản này') ? 'red' : (error.startsWith('Không thể') || error.includes('không được để trống') || error.includes('không khớp') || error.includes('không hợp lệ') || error.includes('Thiếu thông tin bắt buộc') ? 'red' : 'green')}
          title={error.startsWith('Tài khoản này') ? 'Thông báo' : (error.startsWith('Không thể') || error.includes('lỗi') || error.includes('Thiếu thông tin bắt buộc') ? 'Lỗi' : 'Thành công')}
          onClose={() => setError(null)}
        >
          {error}
        </Notification>
      )}

      <Stack gap="md" className="user-page-container">
         {/* LOG USERS STATE TRƯỚC KHI MAP (DEBUG LỖI user_id) */}
         {console.log('Rendering users table. Current users state:', users)}

        <Table striped className="user-info-table">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Tên đăng nhập</Table.Th>
              <Table.Th>Họ và tên</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Số điện thoại</Table.Th>
              <Table.Th>Địa chỉ</Table.Th>
              <Table.Th>Ảnh đại diện</Table.Th>
              <Table.Th>Ngày tạo</Table.Th>
              <Table.Th>Vai trò</Table.Th>
              <Table.Th>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users?.map((user, index) => { // Thêm index để debug vị trí lỗi
                // === KIỂM TRA AN TOÀN TẠM THỜI TRONG MAP (DEBUG LỖI user_id) ===
                if (!user || typeof user.user_id !== 'number') {
                    console.error('Invalid user object found in users state at index:', index, 'Object:', user);
                    // Nếu tìm thấy đối tượng không hợp lệ, không render hàng này hoặc hiển thị thông báo lỗi trong bảng
                    return (
                       <Table.Tr key={`invalid-${index}`}>
                           <Table.Td colSpan={10} style={{ color: 'red', textAlign: 'center' }}>
                               Dữ liệu người dùng tại vị trí {index} không hợp lệ. Vui lòng tải lại trang.
                           </Table.Td>
                       </Table.Tr>
                    ); // Bỏ qua render hàng này để tránh crash
                }
                // === KẾT THÚC KIỂM TRA AN TOÀN ===

                const isEditingThisUser = editingUserId === user.user_id;
                const isSelectedFileForThisUser = avatarFile && uploadingAvatarUserId === user.user_id;


                return (
                    <Table.Tr
                      key={user.user_id} // Sử dụng user.user_id (đã kiểm tra an toàn ở trên)
                      className={user.is_active === 0 ? 'deactivated-user' : ''}
                    >
                      <Table.Td>{user.user_id}</Table.Td> {/* Sử dụng user.user_id */}
                      <Table.Td>
                           <Text>{user.username}</Text>
                      </Table.Td>
                       {/* === Cột Họ và tên, Email, SĐT, Địa chỉ === */}
                       {/* Các cột này giờ đây sử dụng wrapper div để input chiếm toàn bộ chiều rộng */}
                      <Table.Td>
                        {isEditingThisUser ? (
                           <div className="table-edit-cell-content">
                              <Input
                                name="full_name"
                                value={editFormData[user.user_id]?.full_name || ''}
                                onChange={(event) => handleInputChange(user.user_id, event)}
                                placeholder="Họ và tên"
                              />
                           </div>
                        ) : (
                          <Text>{user.full_name || 'Chưa cập nhật'}</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {isEditingThisUser ? (
                           <div className="table-edit-cell-content">
                              <Input
                                name="email"
                                type="email"
                                value={editFormData[user.user_id]?.email || ''}
                                onChange={(event) => handleInputChange(user.user_id, event)}
                                placeholder="Email"
                              />
                           </div>
                        ) : (
                          <Text>{user.email || 'Chưa cập nhật'}</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {isEditingThisUser ? (
                           <div className="table-edit-cell-content">
                              <Input
                                name="phone_number"
                                type="tel"
                                value={editFormData[user.user_id]?.phone_number || ''}
                                onChange={(event) => handleInputChange(user.user_id, event)}
                                placeholder="Số điện thoại"
                              />
                           </div>
                        ) : (
                          <Text>{user.phone_number || 'Chưa cập nhật'}</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {isEditingThisUser ? (
                           <div className="table-edit-cell-content">
                              <Input
                                name="address"
                                value={editFormData[user.user_id]?.address || ''}
                                onChange={(event) => handleInputChange(user.user_id, event)}
                                placeholder="Địa chỉ"
                              />
                           </div>
                        ) : (
                          <Text>{user.address || 'Chưa cập nhật'}</Text>
                        )}
                      </Table.Td>

                       {/* === Cột Ảnh đại diện === */}
                       <Table.Td>
                         {/* Khi chỉnh sửa, đặt tất cả nội dung vào cột flexbox */}
                         {isEditingThisUser ? (
                            <div className="table-edit-cell-content">
                                 {/* Wrapper div với kích thước cố định cho ảnh */}
                                 <div className="avatar-image-wrapper">
                                     {/* Hiển thị ảnh tạm thời (nếu đang chỉnh sửa user này và có file chọn) hoặc ảnh đã lưu */}
                                     {isSelectedFileForThisUser ? (
                                         <img
                                             src={URL.createObjectURL(avatarFile)}
                                             alt={user.username}
                                             width="50" // Thêm thuộc tính width
                                             height="50" // Thêm thuộc tính height
                                           />
                                     ) : user.avatar_url ? (
                                       <img
                                         src={user.avatar_url}
                                         alt={user.username}
                                         width="50" // Thêm thuộc tính width
                                         height="50" // Thêm thuộc tính height
                                       />
                                     ) : (
                                       <Text size="sm" style={{ textAlign: 'center' }}>No Image</Text>
                                     )}
                                 </div>

                                {/* FileInput (trong cột flex) */}
                                <FileInput
                                    label="Ảnh mới"
                                    placeholder={isSelectedFileForThisUser ? avatarFile.name : "Chọn file"}
                                    accept="image/png,image/jpeg"
                                    onChange={(file) => handleAvatarChange(file, user.user_id)}
                                    clearable
                                    value={isSelectedFileForThisUser ? avatarFile : null}
                                />

                                {/* Nút Tải lên Ảnh (trong cột flex) - chỉ hiện khi có file được chọn */}
                               {isSelectedFileForThisUser && (
                                   <Button
                                       size="xs"
                                       onClick={() => uploadUserAvatar(user.user_id)}
                                       loading={loading && uploadingAvatarUserId === user.user_id}
                                       disabled={loading}
                                   >
                                       Tải lên Ảnh
                                   </Button>
                               )}
                           </div>
                         ) : (
                            // Chế độ xem: Chỉ hiển thị ảnh hoặc placeholder
                            <div className="avatar-image-wrapper">
                                {user.avatar_url ? (
                                  <img
                                    // === SỬA LỖI: Thêm timestamp vào URL để chống cache ===
                                    src={`${user.avatar_url}?v=${new Date().getTime()}`}
                                    alt={user.username}
                                    width="50" // Thêm thuộc tính width
                                    height="50" // Thêm thuộc tính height
                                   />
                                 ) : (
                                   <Text size="sm" style={{ textAlign: 'center' }}>No Image</Text>
                                 )}
                            </div>
                         )}
                       </Table.Td>

                      <Table.Td>{new Date(user.created_at).toLocaleDateString()}</Table.Td>
                      <Table.Td>{user.role}</Table.Td>

                       {/* === Cột Hành động === */}
                       {/* Cột này cũng sử dụng wrapper div để các nút xếp chồng lên nhau */}
                      <Table.Td>
                        {isEditingThisUser ? (
                           <div className="table-edit-cell-content">
                               {/* Nút Lưu CHỈ thông tin văn bản */}
                              <Button
                                  size="xs"
                                  onClick={() => handleSaveClick(user.user_id)}
                                  loading={loading && editingUserId === user.user_id && !avatarFile}
                                  disabled={loading}
                              >
                                Lưu Thông tin
                              </Button>
                              <Button size="xs" color="gray" onClick={handleCancelEdit} disabled={loading}>
                                Hủy
                              </Button>
                           </div>
                        ) : (
                          <Group spacing="xs">
                            <Button size="xs" onClick={() => handleEditClick(user)}>
                              Chỉnh sửa
                            </Button>
                            {user.role === 'user' && (
                              <Button
                                size="xs"
                                color={user.is_active === 1 ? 'orange' : 'teal'}
                                onClick={() => {
                                  if (user.is_active === 1) {
                                    deactivateUserAccount(user.user_id);
                                  } else {
                                    reactivateUserAccount(user.user_id);
                                  }
                                }}
                                loading={deactivatingUserId === user.user_id || reactivatingUserId === user.user_id}
                                disabled={loading || deactivatingUserId !== null || reactivatingUserId !== null}
                              >
                                {user.is_active === 1 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              </Button>
                            )}
                          </Group>
                        )}
                      </Table.Td>
                    </Table.Tr>
                );
            })}
          </Table.Tbody>
        </Table>

        {/* ... (Modal Thêm người dùng mới) */}
        <Modal opened={isAddUserModalOpen} onClose={closeAddUserModal} title="Thêm người dùng mới">
          <Stack>
             {addFormError && (
                 <Notification
                    color={addFormError.includes('không khớp') || addFormError.includes('không được để trống') || addFormError.includes('Lỗi') ? 'red' : 'green'}
                    title={addFormError.includes('Lỗi') ? 'Lỗi' : 'Thông báo'}
                    onClose={() => setAddFormError(null)}
                    >
                    {addFormError}
                 </Notification>
             )}
             <TextInput label="Tên đăng nhập" name="username" value={addUserFormData.username} onChange={handleAddUserInputChange} required placeholder="Nhập tên đăng nhập" disabled={addingUser}/>
             <PasswordInput label="Mật khẩu" name="password" value={addUserFormData.password} onChange={handleAddUserInputChange} required placeholder="Nhập mật khẩu" disabled={addingUser}/>
             <PasswordInput label="Xác nhận mật khẩu" name="password_confirm" value={addUserFormData.password_confirm} onChange={handleAddUserInputChange} required placeholder="Nhập lại mật khẩu" disabled={addingUser}/>
             <TextInput label="Họ và tên" name="full_name" value={addUserFormData.full_name} onChange={handleAddUserInputChange} required placeholder="Nhập họ và tên" disabled={addingUser}/>
             <TextInput label="Email" name="email" type="email" value={addUserFormData.email} onChange={handleAddUserInputChange} required placeholder="Nhập email" disabled={addingUser}/>
             <TextInput label="Số điện thoại" name="phone_number" type="tel" value={addUserFormData.phone_number} onChange={handleAddUserInputChange} placeholder="Nhập số điện thoại (tùy chọn)" disabled={addingUser}/>
             <Select label="Vai trò" name="role" value={addUserFormData.role} onChange={(value) => setAddUserFormData({ ...addUserFormData, role: value || 'user' })} data={[{ value: 'user', label: 'Người dùng' }]} placeholder="Chọn vai trò" disabled={true}/>
             <TextInput label="Địa chỉ" name="address" value={addUserFormData.address} onChange={handleAddUserInputChange} placeholder="Nhập địa chỉ (tùy chọn)" disabled={addingUser}/>
          </Stack>
          <Group justify="flex-end" mt="md">
            <Button onClick={closeAddUserModal} color="gray" disabled={addingUser}>
              Hủy
            </Button>
            <Button onClick={handleCreateUser} loading={addingUser} disabled={addingUser}>
              Thêm
            </Button>
          </Group>
        </Modal>
      </Stack>
    </DefaultLayout>
  );
};

export default UserPage;