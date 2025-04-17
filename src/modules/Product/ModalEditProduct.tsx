import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { IconX } from '@tabler/icons-react';
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
import { useCategory } from '@/hooks/useCategory';

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

export interface EditProductPayload {
  id: number;
  product_name: string;
  price: number | string;
  thumbnail: string;
  short_description: string;
  full_description: string;
  extra_info: string;
  in_stock: number;
  brand: string;
  category_id?: number | string;
  gallery?: string[];
}

interface ModalEditProductProps {
  opened: boolean;
  onClose: () => void;
  product: EditProductPayload | null;
}

export default function ModalEditProduct({ opened, onClose, product }: ModalEditProductProps) {
  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      product_name: '',
      price: 0,
      short_description: '',
      full_description: '',
      extra_info: '',
      brand: '',
      category_id: '',
      in_stock: 0,
      thumbnail: undefined as File | undefined,
      gallery: [] as File[],
    },
  });

  const { data: categories } = useCategory();

  const [thumbOldUrl, setThumbOldUrl] = useState<string>('');
  const [galleryOldUrls, setGalleryOldUrls] = useState<string[]>([]);
  const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);

  const thumbnailFile = watch('thumbnail');

  useEffect(() => {
    if (!product) {
      return;
    }
    const numericPrice =
      typeof product.price === 'string'
        ? Number(product.price.replace(/[^\d]/g, ''))
        : product.price;
    reset({
      product_name: product.product_name || '',
      price: numericPrice || 0,
      short_description: product.short_description || '',
      full_description: product.full_description || '',
      extra_info: product.extra_info || '',
      brand: product.brand || '',
      category_id: product.category_id ? String(product.category_id) : '',
      in_stock: product.in_stock ?? 0,
      thumbnail: undefined,
      gallery: [],
    });
    setThumbOldUrl(product.thumbnail || '');
    setGalleryOldUrls(product.gallery || []);
    setGalleryNewFiles([]);
  }, [product, reset]);

  const onSubmit = (values: any) => {
    const payload = {
      ...values,
      id: product?.id,
    };
    console.log('DỮ LIỆU SUBMIT:', payload);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Chỉnh sửa sản phẩm" size="600px" centered>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Title order={5}>Thông tin sản phẩm</Title>
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
                label="Giá (VNĐ)"
                error={errors.price?.message}
                value={field.value ? Number(field.value).toLocaleString('vi-VN') : ''}
                onChange={(e) => field.onChange(e.currentTarget.value.replace(/[^0-9]/g, ''))}
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
            render={({ field }) => (
              <Select
                label="Danh mục"
                placeholder="Chọn danh mục"
                searchable
                data={(categories?.data || []).map((c: any) => ({
                  value: String(c.category_id),
                  label: c.category_name,
                }))}
                error={errors.category_id?.message}
                {...field}
                value={field.value ?? ''}
              />
            )}
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
              />
            )}
          />
          <Controller
            control={control}
            name="short_description"
            render={({ field }) => (
              <TextInput label="Mô tả ngắn" error={errors.short_description?.message} {...field} />
            )}
          />
          <Controller
            control={control}
            name="full_description"
            render={({ field }) => (
              <Textarea
                label="Mô tả chi tiết"
                minRows={3}
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
          <Controller
            control={control}
            name="thumbnail"
            render={({ field }) => (
              <Stack>
                <FileInput label="Thumbnail" accept="image/*" {...field} />
                {thumbnailFile ? (
                  <Image
                    src={URL.createObjectURL(thumbnailFile)}
                    w={150}
                    h={150}
                    radius="md"
                    fit="cover"
                  />
                ) : (
                  thumbOldUrl && <Image src={thumbOldUrl} w={150} h={150} radius="md" fit="cover" />
                )}
              </Stack>
            )}
          />
          <Controller
            control={control}
            name="gallery"
            render={({ field }) => (
              <Stack>
                <FileInput
                  label="Gallery (chọn mới để thay)"
                  accept="image/*"
                  multiple
                  onChange={(files) => {
                    setGalleryNewFiles(files ?? []);
                    field.onChange(files ?? []);
                  }}
                />
                {galleryNewFiles.length > 0 && (
                  <Group gap="sm" wrap="wrap">
                    {galleryNewFiles.map((file, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <Image
                          src={URL.createObjectURL(file)}
                          w={100}
                          h={100}
                          radius="sm"
                          fit="cover"
                        />
                        <ActionIcon
                          size="sm"
                          color="red"
                          style={{ position: 'absolute', top: 5, right: 5 }}
                          onClick={() => {
                            const next = [...galleryNewFiles];
                            next.splice(idx, 1);
                            setGalleryNewFiles(next);
                            setValue('gallery', next);
                          }}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </div>
                    ))}
                  </Group>
                )}
                {galleryNewFiles.length === 0 && galleryOldUrls.length > 0 && (
                  <Group gap="sm" wrap="wrap">
                    {galleryOldUrls.map((url, i) => (
                      <Image key={i} src={url} w={100} h={100} radius="sm" fit="cover" />
                    ))}
                  </Group>
                )}
              </Stack>
            )}
          />
          <Group mt="md" grow>
            <Button variant="default" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit">Lưu</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
