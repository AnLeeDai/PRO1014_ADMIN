import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { IconPlus, IconX } from '@tabler/icons-react';
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
import { useEditProduct } from '@/hooks/useEditProduct';
import { useProduct } from '@/hooks/useProduct';

/* ---------- schema ---------- */
const schema = yup.object().shape({
  product_name: yup.string().required().min(3),
  price: yup.number().typeError('Phải là số').positive().required(),
  short_description: yup.string().required().min(10),
  full_description: yup.string().required().min(20),
  extra_info: yup.string().required(),
  brand: yup.string().required(),
  category_id: yup.string().required(),
  in_stock: yup.number().typeError('Phải là số').min(0).required(),
  thumbnail: yup
    .mixed<File>()
    .test('fileType', 'Ảnh JPG/PNG/WEBP', (f) =>
      f ? ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) : true
    ),
  gallery: yup
    .array()
    .of(
      yup
        .mixed<File>()
        .test('fileType', 'Ảnh JPG/PNG/WEBP', (f) =>
          f ? ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) : true
        )
    )
    .optional(),
});

/* ---------- types ---------- */
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

interface Props {
  opened: boolean;
  onClose: () => void;
  product: EditProductPayload | null;
}

/* ---------- component ---------- */
export default function ModalEditProduct({ opened, onClose, product }: Props) {
  const {
    control,
    reset,
    handleSubmit,
    watch,
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
  const { refetch } = useProduct();

  /* ---------- mutation ---------- */
  const { mutate, isPending } = useEditProduct({
    onSuccess: () => {
      notifications.show({ title: 'Thành công', message: 'Đã lưu sản phẩm!', color: 'green' });
      reset();
      refetch();
      onClose();
      window.location.reload();
    },
    onError: (err) => notifications.show({ title: 'Thất bại', message: err.message, color: 'red' }),
  });

  /* ---------- state ---------- */
  const [thumbOldUrl, setThumbOldUrl] = useState('');
  const [galleryOldUrls, setGalleryOldUrls] = useState<string[]>([]);
  const [removedOldUrls, setRemovedOldUrls] = useState<string[]>([]);
  const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);
  const thumbnailFile = watch('thumbnail');

  /* ---------- init ---------- */
  useEffect(() => {
    if (!product) {
      return;
    }

    const priceNum =
      typeof product.price === 'string'
        ? Number(product.price.replace(/[^\d]/g, ''))
        : product.price;

    reset({
      product_name: product.product_name,
      price: priceNum,
      short_description: product.short_description,
      full_description: product.full_description,
      extra_info: product.extra_info,
      brand: product.brand,
      category_id: product.category_id ? String(product.category_id) : '',
      in_stock: product.in_stock,
      thumbnail: undefined,
      gallery: [],
    });

    setThumbOldUrl(product.thumbnail || '');
    setGalleryOldUrls(product.gallery || []);
    setRemovedOldUrls([]);
    setGalleryNewFiles([]);
  }, [product, reset]);

  /* ---------- submit ---------- */
  const onSubmit = (v: any) => {
    if (!product) {
      return;
    }

    const fd = new FormData();

    fd.append('product_id', String(product.id));
    fd.append('product_name', v.product_name);
    fd.append('brand', v.brand);
    fd.append('price', String(v.price));
    fd.append('short_description', v.short_description);
    fd.append('full_description', v.full_description);
    fd.append('extra_info', v.extra_info);
    fd.append('category_id', v.category_id);
    fd.append('in_stock', String(v.in_stock));

    /* thumbnail (nếu có file mới) */
    if (thumbnailFile) {
      fd.append('thumbnail', thumbnailFile);
    }

    /* ---------- gallery ---------- */
    const hasRemoved = removedOldUrls.length > 0;
    const hasNewFile = galleryNewFiles.length > 0;

    /* append file mới */
    galleryNewFiles.forEach((f) => fd.append('gallery[]', f));

    /* nếu xoá bớt ảnh cũ --> REPLACE */
    if (hasRemoved) {
      fd.append('gallery_mode', 'replace');
      galleryOldUrls.forEach((url) => fd.append('gallery_urls[]', url));
    } else if (hasNewFile) {
      fd.append('gallery_mode', 'append');
    }

    mutate(fd);
  };

  /* ---------- JSX ---------- */
  return (
    <Modal opened={opened} onClose={onClose} title="Chỉnh sửa sản phẩm" size="600px" centered>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          {/* ---------- Thông tin ---------- */}
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
                placeholder="Mỗi mục cách nhau bằng dấu phẩy"
                error={errors.extra_info?.message}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={(e) => {
                  const items = e.currentTarget.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s) => `<li>${s}</li>`)
                    .join('');
                  field.onChange(items);
                }}
              />
            )}
          />

          {/* ---------- Hình ảnh ---------- */}
          <Title order={5}>Hình ảnh</Title>

          {/* --- thumbnail --- */}
          <Controller
            control={control}
            name="thumbnail"
            render={({ field }) => (
              <Stack>
                {!thumbnailFile && thumbOldUrl ? (
                  <div style={{ position: 'relative', width: 150 }}>
                    <Image src={thumbOldUrl} w={150} h={150} radius="md" fit="cover" />
                    <ActionIcon
                      size="sm"
                      color="red"
                      style={{ position: 'absolute', top: 5, right: 5 }}
                      onClick={() => {
                        setThumbOldUrl('');
                        field.onChange(undefined);
                      }}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </div>
                ) : (
                  <>
                    <FileInput
                      label="Thumbnail"
                      accept="image/*"
                      placeholder="Chọn ảnh mới…"
                      {...field}
                    />
                    {thumbnailFile && (
                      <div style={{ position: 'relative', width: 150 }}>
                        <Image
                          src={URL.createObjectURL(thumbnailFile)}
                          w={150}
                          h={150}
                          radius="md"
                          fit="cover"
                        />
                        <ActionIcon
                          size="sm"
                          color="red"
                          style={{ position: 'absolute', top: 5, right: 5 }}
                          onClick={() => field.onChange(undefined)}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </div>
                    )}
                  </>
                )}
              </Stack>
            )}
          />

          {/* --- gallery --- */}
          <Controller
            control={control}
            name="gallery"
            render={({ field }) => (
              <Stack>
                {/* input ẩn để chọn nhiều file */}
                <FileInput
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(files) => {
                    const next = [...galleryNewFiles, ...(files ?? [])];
                    setGalleryNewFiles(next);
                    field.onChange(next);
                  }}
                  id="gallery-file-input"
                />

                <ActionIcon
                  variant="light"
                  size={42}
                  radius="xl"
                  onClick={() =>
                    (document.getElementById('gallery-file-input') as HTMLInputElement)?.click()
                  }
                  title="Thêm ảnh"
                >
                  <IconPlus size={24} />
                </ActionIcon>

                {/* ảnh cũ */}
                {galleryOldUrls.length > 0 && (
                  <Group gap="sm" wrap="wrap" mt="xs">
                    {galleryOldUrls.map((url) => (
                      <div key={url} style={{ position: 'relative' }}>
                        <Image
                          src={url}
                          w={100}
                          h={100}
                          radius="sm"
                          style={{ border: '1px solid #e2e8f0' }}
                          fit="cover"
                        />
                        <ActionIcon
                          size="sm"
                          color="red"
                          style={{ position: 'absolute', top: 4, right: 4 }}
                          onClick={() => {
                            setGalleryOldUrls((prev) => prev.filter((u) => u !== url));
                            setRemovedOldUrls((prev) => [...prev, url]);
                          }}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </div>
                    ))}
                  </Group>
                )}

                {/* ảnh mới */}
                {galleryNewFiles.length > 0 && (
                  <Group gap="sm" wrap="wrap" mt="xs">
                    {galleryNewFiles.map((file, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <Image
                          src={URL.createObjectURL(file)}
                          w={100}
                          h={100}
                          radius="sm"
                          style={{ border: '2px solid #38bdf8' }}
                          fit="cover"
                        />
                        <ActionIcon
                          size="sm"
                          color="red"
                          style={{ position: 'absolute', top: 4, right: 4 }}
                          onClick={() => {
                            const next = galleryNewFiles.filter((_, i) => i !== idx);
                            setGalleryNewFiles(next);
                            field.onChange(next);
                          }}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </div>
                    ))}
                  </Group>
                )}
              </Stack>
            )}
          />

          {/* ---------- actions ---------- */}
          <Group mt="md" grow>
            <Button variant="default" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" loading={isPending}>
              Lưu
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
