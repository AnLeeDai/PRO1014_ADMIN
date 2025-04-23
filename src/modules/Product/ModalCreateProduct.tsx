import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
  ActionIcon,
  Button,
  FileInput,
  Group,
  Image,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCategory } from '@/hooks/useCategory';
import { useCreateProduct } from '@/hooks/useCreateProduct';

const schema = yup.object().shape({
  product_name: yup
    .string()
    .required('Tên sản phẩm là bắt buộc')
    .min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự'),
  price: yup
    .number()
    .typeError('Giá sản phẩm phải là số')
    .required('Giá sản phẩm là bắt buộc')
    .positive('Giá phải lớn hơn 0'),
  short_description: yup
    .string()
    .required('Mô tả ngắn là bắt buộc')
    .min(10, 'Mô tả ngắn phải từ 10 ký tự'),
  full_description: yup
    .string()
    .required('Mô tả chi tiết là bắt buộc')
    .min(20, 'Mô tả chi tiết phải từ 20 ký tự'),
  extra_info: yup.string().required('Thông tin thêm là bắt buộc'),
  brand: yup.string().required('Thương hiệu là bắt buộc'),
  category_id: yup.string().required('Danh mục là bắt buộc'),
  in_stock: yup
    .number()
    .typeError('Tồn kho phải là số')
    .required('Tồn kho là bắt buộc')
    .min(0, 'Tồn kho không thể âm'),
  thumbnail: yup
    .mixed<File>()
    .required('Thumbnail là bắt buộc')
    .test('fileType', 'Chỉ chấp nhận ảnh JPG/PNG/WEBP', (file) =>
      file ? ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) : false
    ),
  gallery: yup
    .array()
    .of(
      yup
        .mixed<File>()
        .required('Ảnh không hợp lệ')
        .test('fileType', 'Chỉ chấp nhận ảnh JPG/PNG/WEBP', (file) =>
          file ? ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) : false
        )
    )
    .min(1, 'Phải chọn ít nhất 1 ảnh gallery'),
});

interface ProductFormValues {
  product_name: string;
  price: number;
  short_description: string;
  full_description: string;
  extra_info: string;
  brand: string;
  category_id: string;
  in_stock: number;
  thumbnail: File;
  gallery?: File[];
}

interface ModalCreateProductProps {
  opened: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export default function ModalCreateProduct({ opened, onClose, refetch }: ModalCreateProductProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      product_name: '',
      price: 0,
      thumbnail: undefined,
      short_description: '',
      full_description: '',
      extra_info: '',
      brand: '',
      category_id: '',
      in_stock: 0,
      gallery: [],
    },
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useCategory();

  if (isErrorCategories) {
    notifications.show({
      title: 'Lỗi tải danh mục',
      message: 'Không thể tải danh mục sản phẩm',
      color: 'red',
    });
  }

  const { mutate: mutateCreateProduct, isPending: isLoadingCreateProduct } = useCreateProduct({
    onSuccess: () => {
      notifications.show({
        title: 'Tạo sản phẩm thành công',
        message: 'Sản phẩm đã được tạo thành công!',
        color: 'green',
      });

      onClose();
      reset();
      refetch?.();
    },

    onError: (error) => {
      notifications.show({
        title: 'Tạo sản phẩm thất bại',
        message: error.message,
        color: 'red',
      });
    },
  });

  const thumbnail = watch('thumbnail');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const onFormSubmit = (values: ProductFormValues) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, val]) => {
      if (key === 'thumbnail') {
        formData.append('thumbnail', val as File);
      } else if (key === 'gallery') {
        (val as File[]).forEach((file) => {
          formData.append('gallery[]', file);
        });
      } else {
        formData.append(key, val as string);
      }
    });

    mutateCreateProduct(formData);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Tạo sản phẩm mới" size="600px" centered>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Stack>
          <Controller
            control={control}
            name="product_name"
            render={({ field }) => (
              <TextInput label="Tên sản phẩm" error={errors.product_name?.message} {...field} />
            )}
          />

          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <TextInput
                label="Giá sản phẩm (VNĐ)"
                type="text"
                error={errors.price?.message}
                value={field.value ? Number(field.value).toLocaleString('vi-VN') : ''}
                onChange={(e) => {
                  const rawValue = e.currentTarget.value.replace(/[^0-9]/g, '');
                  field.onChange(rawValue);
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="brand"
            render={({ field }) => (
              <TextInput label="Thương hiệu" error={errors.brand?.message} {...field} />
            )}
          />

          <Controller
            control={control}
            name="category_id"
            render={({ field }) => {
              const options = (categories?.data || [])
                .filter((cat) => cat?.category_id != null && typeof cat.category_name === 'string')
                .map((cat) => ({
                  value: String(cat.category_id),
                  label: cat.category_name,
                }));

              return (
                <Select
                  disabled={isLoadingCategories}
                  label="Danh mục"
                  placeholder="Chọn danh mục"
                  data={options}
                  error={errors.category_id?.message}
                  searchable
                  {...field}
                  value={field.value ?? ''}
                  onChange={(value) => field.onChange(value)}
                />
              );
            }}
          />

          <Controller
            control={control}
            name="in_stock"
            render={({ field }) => (
              <TextInput
                label="Tồn kho"
                type="number"
                error={errors.in_stock?.message}
                {...field}
                value={field.value ?? ''}
              />
            )}
          />

          <Controller
            control={control}
            name="short_description"
            render={({ field }) => (
              <Textarea
                label="Mô tả ngắn"
                autosize
                error={errors.short_description?.message}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="full_description"
            render={({ field }) => (
              <Textarea
                label="Mô tả chi tiết"
                autosize
                error={errors.full_description?.message}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="extra_info"
            render={({ field }) => (
              <Textarea
                label="Thông tin thêm"
                placeholder="Nhập các dòng, cách nhau bằng dấu phẩy: Bảo hành, Trả góp, ..."
                error={errors.extra_info?.message}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={(e) => {
                  const raw = e.currentTarget.value;
                  const formatted = raw
                    .split(',')
                    .map((item) => item.trim())
                    .filter((item) => item !== '')
                    .map((item) => `<li>${item}</li>`)
                    .join('');
                  field.onChange(formatted);
                }}
              />
            )}
          />

          <Title order={5}>Hình ảnh</Title>

          {/* Thumbnail */}
          <Controller
            control={control}
            name="thumbnail"
            render={({ field }) => (
              <Stack>
                <FileInput
                  label="Thumbnail"
                  placeholder="Chọn 1 ảnh"
                  accept="image/*"
                  error={errors.thumbnail?.message}
                  {...field}
                />
                {thumbnail && (
                  <Image
                    src={URL.createObjectURL(thumbnail)}
                    alt="Preview thumbnail"
                    width={150}
                    height={150}
                    fit="cover"
                    radius="md"
                  />
                )}
              </Stack>
            )}
          />

          {/* Gallery */}
          <Controller
            control={control}
            name="gallery"
            render={({ field }) => (
              <Stack>
                <FileInput
                  label="Gallery ảnh"
                  placeholder="Chọn nhiều ảnh"
                  multiple
                  accept="image/*"
                  error={errors.gallery?.message}
                  onChange={(files) => {
                    setGalleryFiles(files || []);
                    field.onChange(files || []);
                  }}
                  value={galleryFiles}
                />
                {galleryFiles.length > 0 && (
                  <Group gap="sm" wrap="wrap">
                    {galleryFiles.map((file, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Gallery-${index}`}
                          width={100}
                          height={100}
                          fit="cover"
                          radius="sm"
                        />
                        <ActionIcon
                          color="red"
                          size="sm"
                          style={{ position: 'absolute', top: 5, right: 5 }}
                          onClick={() => {
                            const newFiles = [...galleryFiles];
                            newFiles.splice(index, 1);
                            setGalleryFiles(newFiles);
                            setValue('gallery', newFiles);
                          }}
                        >
                          ✕
                        </ActionIcon>
                      </div>
                    ))}
                  </Group>
                )}
              </Stack>
            )}
          />

          <Group justify="space-between" mt="md" wrap="nowrap">
            <Button variant="default" onClick={onClose} fullWidth>
              Huỷ
            </Button>
            <Button type="submit" loading={isLoadingCreateProduct} fullWidth>
              Tạo sản phẩm
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
