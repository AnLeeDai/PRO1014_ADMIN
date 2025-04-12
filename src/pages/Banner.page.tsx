import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Card,
  FileInput,
  Grid,
  Group,
  Image,
  Loader,
  Modal,
  Notification,
  Pagination,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';


// Kiểu dữ liệu Banner theo API trả về
// Đây là kiểu dữ liệu mà bạn sẽ nhận được từ API
type Banner = {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
  updated_at: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  filters?: {
    sort_by: string;
    search: string;
  };
  pagination?: {
    current_page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
  data?: Banner[];
};

export default function BannerPageWithApi() {
  // State cho danh sách banner, tìm kiếm và phân trang
  const [banners, setBanners] = useState<Banner[]>([]);//lưu trũ danh sách banner
  const [searchQuery, setSearchQuery] = useState('');//lưu trữ từ khóa tìm kiếm
  const [currentPage, setCurrentPage] = useState(1);  //lưu trữ trang hiện tại khởi tạo giá trị là 11
  const [totalPages, setTotalPages] = useState(1);//lưu trữ tổng số trang ít nhất là 11
  const [notification, setNotification] = useState('');//lưu trữ thông báo xem người dùng có muốn xóa hay không
  const [loading, setLoading] = useState(false);//lưu trữ trạng thái loading chờ dữ liệu từ apiapi

  // State cho modal thao tác (thêm, cập nhật)
  const [opened, { open, close }] = useDisclosure(false);//lưu trữ trạng thái mở modal useDisclosure thư viện hook quản lý trạng thái bolean
  const [modalTitle, setModalTitle] = useState('');//lưu trữ tiêu đề của banner
  const [modalFile, setModalFile] = useState<File | null>(null);//lưu trữ file ảnh của banner
  const [currentAction, setCurrentAction] = useState<'add' | 'update' | null>(null);//lưu trữ hành động hiện tại là thêm hay cập nhật banner
  const [currentBannerId, setCurrentBannerId] = useState<number | null>(null);// lưu banner id đang được cập nhậtnhật

  // API base và  jwttoken dùng để xác thực xem người dùng có phải là admin hay không
  // Đây là URL của API mà bạn sẽ gọi đến

  const API_BASE = 'http://localhost/PRO1014_SERVER/routes/';
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyNCwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDQ0MDIzMCwiZXhwIjoxNzQ0NDQzODMwfQ.BpJyod1t2lTQhUGQipkvrpyZZ7gzxMvhx_iqdjfY92c';
    

  // Tạo axios instance  dùng để gọi API với cấu hình mặc định
  // Tạo một instance của axios với cấu hình mặc định có chưa token
  // Đây là cách để bạn có thể gọi API mà không cần phải truyền lại token mỗi lần gọi
  const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Hàm lấy danh sách banner từ API (GET)
  

  const fetchBanners = async (search: string, page: number) => {//khai báo hàm fetchBanners với tham số search và page
    setLoading(true);//bắt đầu loading
    try {
      const params = { request: 'get-banners', search, page: page.toString() };//khai báo params với các tham số request, search và page dùng để gọi api
      const response = await axiosInstance.get('', { params });//gọi api với phương thức get và truyền params vào
      const data: ApiResponse = response.data;//lấy dữ liệu trả về từ api và gán vào biến data với kiểu ApiResponse
      if (data.success && data.data && data.pagination) {//kiểm tra xem dữ liệu trả về có thành công hay không và có dữ liệu hay không
        setBanners(data.data);//nếu có thì gán dữ liệu vào state banners
        setTotalPages(data.pagination.total_pages);//gán tổng số trang vào state totalPages
      } else {
        setNotification(data.message);//nếu không thành công thì gán thông báo lỗi vào state notification
      }
    } catch (error) {
      setNotification('Có lỗi xảy ra khi tải dữ liệu.');
    }
    setLoading(false);
  };

  // Hàm gọi API thêm banner (POST) dùng FormData
  const addBannerApi = async (title: string, file: File) => {//gửi yêu cầu post đến api với các tham số title và file
    try {
      const formData = new FormData();
      formData.append('title', title);//thêm các tham số vào formData với key là title và value là title
      formData.append('image', file);

      const response = await axiosInstance.post('', formData, {//gửi post resquest đên apiendpoiendpoi
        //'' là đường dẫn đến api mà bạn đã tạo ở trên baseUrlUrl
        params: { request: 'post-banner' },
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data: ApiResponse = response.data;
      if (data.success) {
        setNotification('Đã thêm banner thành công');
        fetchBanners(searchQuery, currentPage);// câp nhật lại danh sách banner sau khi thêm mới
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      setNotification('Có lỗi xảy ra khi thêm banner.');
    }
  };

  // Hàm gọi API cập nhật banner (POST) dùng FormData
  const updateBannerApi = async (id: number, title:string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('banner_id', id.toString());
      formData.append('title', title);
      formData.append('image', file);
  
      const response = await axiosInstance.post('', formData, {
        params: { request: 'post-update-banner' },
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data: ApiResponse = response.data;
      if (data.success) {
        setNotification('Đã cập nhật banner thành công');
        fetchBanners(searchQuery, currentPage);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      setNotification('Có lỗi xảy ra khi cập nhật banner.');
    }
  };
  
  // Hàm gọi API xóa banner (POST)
  const deleteBannerApi = async (id: number) => {
    try {
      const payload = { banner_id: id }; // Đây là dữ liệu của bạn
      const response = await axiosInstance.delete('', {
        params: { request: 'delete-banner' },
        data: payload,
        // Nếu backend của bạn không yêu cầu multipart/form-data, nên loại bỏ header này
        // headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data: ApiResponse = response.data;
      if (data.success) {
        setNotification('Đã xóa banner thành công');
        fetchBanners(searchQuery, currentPage);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      setNotification('Có lỗi xảy ra khi xóa banner.');
    }
  };
  
  
    
  // Hàm xử lý nút submit trên modal (thêm mới hoặc cập nhật) dùng luôn file được chọn
  const handleSubmitBanner = async () => {
    //kiểm tra xem người dùng có chọn file hay không kiểm tra dữ liệu đầu vào
    if (!modalTitle || !modalFile) {
      setNotification('Vui lòng nhập tiêu đề và chọn ảnh.');
      return;
    }
    try {
      // Nếu không có lỗi thì gọi API thêm hoặc cập nhật banner
      // xác định hành động them hay cập nhật banner
      if (currentAction === 'add') {
        await addBannerApi(modalTitle, modalFile);// gọi api them banner
      } else if (currentAction === 'update' && currentBannerId) {
        await updateBannerApi(currentBannerId, modalTitle, modalFile);
      }
      // reset satte và đóng modal xoá  hết các dữ liệu trong from đặt lại 
      setModalTitle('');// đặt lại tiêu đề về rỗng
      setModalFile(null);
      setCurrentAction(null);
      setCurrentBannerId(null);
      close();
    } catch (error) {
      setNotification('Có lỗi xảy ra khi xử lý file.');
    }
  };

  // Hàm mở modal và chuẩn bị dũ liệu  cho hành động thêm hay cập nhật
  const handleAction = (action: 'add' | 'update', id?: number) => {// hành dộng them mới hay cập nhật id cuả banner cânf cập nhâtnhât
    setCurrentAction(action);//thiết lập hành động hiện tại là thêm hay cập nhật banner
    if (action === 'update' && id) {//tìm bannr cần cập nhật
      const bannerToUpdate = banners.find((b) => b.id === id);
      if (bannerToUpdate) {
        setModalTitle(bannerToUpdate.title);//điền vào fromfrom
      }
      setCurrentBannerId(id);//lưu id của banner cần cập nhật
    } else {
      setModalTitle('');//reset tiêu đè 
      setCurrentBannerId(null);//reset id của banner cần cập nhật
    }
    open();
  };

  // Hàm xóa banner
  const handleDelete = (id: number) => {
    deleteBannerApi(id);
  };// gọi api xóa banner

  useEffect(() => {
    fetchBanners(searchQuery, currentPage);// gọi hàm lấy danh sách banner khi trang được tải lần đầu tiên
  }, [searchQuery, currentPage]);//phụ thuộc vào searchQuery và currentPage  

  return (
    <DefaultLayout title="Quản lý Banner" action={() => handleAction('add')}>
      <Modal
        opened={opened}
        onClose={() => {
          close();
          setModalTitle('');
          setModalFile(null);
        }}
        title={currentAction === 'add' ? 'Thêm Banner' : 'Cập nhật Banner'}//hiển thị tùy vào currentActionAction
      >
        <TextInput
          label="Tiêu đề"
          placeholder="Nhập tiêu đề"
          value={modalTitle}
          onChange={(e) => setModalTitle(e.currentTarget.value)}//cập nhật satte khi nhaapjnhaapj
          mb="md"
        />
        <FileInput
          label="Chọn ảnh"
          placeholder="Chọn ảnh"
          accept="image/*"
          value={modalFile}
          onChange={setModalFile}
          mb="md"
        />
        <Group>
          <Button onClick={handleSubmitBanner}>
            {currentAction === 'add' ? 'Thêm mới' : 'Cập nhật'}
          </Button>
        </Group>
      </Modal>

      {notification && (
        <Notification color="green" onClose={() => setNotification('')} mb="md">
          {notification}
        </Notification>//hiển thị thông báo cho người dùng
      )}

      <TextInput
        placeholder="Tìm kiếm banner..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.currentTarget.value);
          setCurrentPage(1);
        }}
        mb="md"
      />

      {loading ? (
        <Loader />
      ) : (
        <Grid>
          {banners.map((banner) => (
            <Grid.Col key={banner.id} span={4}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <Image src={banner.image_url} alt={banner.title} height={150} width="100%" />
                </Card.Section>
                <Text size="lg" mt="md">
                  {banner.title}
                </Text>
                <Group mt="md">
                  <Button variant="light" color="blue" size="xs" onClick={() => handleAction('update', banner.id)}>
                    Cập nhật
                  </Button>
                  <Button variant="light" color="red" size="xs" onClick={() => handleDelete(banner.id)}>
                    Xóa
                  </Button>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
      <Group justify="center" mt="md">
        <Pagination value={currentPage} total={totalPages} onChange={setCurrentPage} />
      </Group>
      
    </DefaultLayout>
  );
}