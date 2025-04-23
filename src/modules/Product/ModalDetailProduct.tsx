import { Group, Image, List, Loader, Modal, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useProductByID } from '@/hooks/useProductByID';

interface Props {
  opened: boolean;
  onClose: () => void;
  productId: number | null;
}

export default function ModalDetailProduct({ opened, onClose, productId }: Props) {
  const { data, isFetching } = useProductByID(productId ?? undefined);

  if (!productId) {
    return null;
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Chi tiết sản phẩm" size="650" centered>
      {isFetching || !data ? (
        <Stack gap="md">
          <Loader color="blue" />
          <Skeleton height={180} />
          <Skeleton height={20} />
          <Skeleton height={20} />
        </Stack>
      ) : (
        <Stack gap="md">
          {/* HÌNH ẢNH */}
          <Stack gap={4}>
            <Title order={5}>Hình ảnh</Title>
            <Group align="start" wrap="wrap" gap="sm">
              {data.product.gallery.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt="gallery"
                  width={180}
                  height={180}
                  radius="md"
                  fit="cover"
                  style={{ opacity: 1, transition: 'opacity 0.3s ease' }}
                />
              ))}
            </Group>
          </Stack>

          {/* MÔ TẢ NGẮN */}
          <Stack gap={4}>
            <Title order={5}>Mô tả ngắn</Title>
            <Text size="sm">{data.product.short_description}</Text>
          </Stack>

          {/* MÔ TẢ CHI TIẾT */}
          <Stack gap={4}>
            <Title order={5}>Mô tả chi tiết</Title>
            <Text size="sm">{data.product.full_description}</Text>
          </Stack>

          {/* THÔNG TIN THÊM */}
          <Stack gap={4}>
            <Title order={5}>Thông tin thêm</Title>
            <List spacing="xs" size="sm" icon="•">
              {Array.from(data.product.extra_info.matchAll(/<li>(.*?)<\/li>/g), (m, idx) => (
                <List.Item key={idx}>{m[1]}</List.Item>
              ))}
            </List>
          </Stack>
        </Stack>
      )}
    </Modal>
  );
}
