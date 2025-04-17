import { useState } from 'react';
import { Group, Image, List, Modal, Skeleton, Stack, Text, Title } from '@mantine/core';

interface ModalDetailProductProps {
  opened: boolean;
  onClose: () => void;
  product?: {
    gallery: string[];
    full_description: string;
    extra_info: string;
  };
}

export default function ModalDetailProduct({ opened, onClose, product }: ModalDetailProductProps) {
  if (!product) {
    return null;
  }

  const extraInfoList = Array.from(product.extra_info.matchAll(/<li>(.*?)<\/li>/g), (m) => m[1]);

  return (
    <Modal opened={opened} onClose={onClose} title="Chi tiết sản phẩm" size="650" centered>
      <Stack gap="md">
        {/* HÌNH ẢNH */}
        <Stack gap={4}>
          <Title order={5}>Hình ảnh</Title>
          <Group align="start" wrap="wrap" gap="sm">
            {product.gallery.map((src, index) => (
              <ImageWithSkeleton key={index} src={src} />
            ))}
          </Group>
        </Stack>

        {/* MÔ TẢ CHI TIẾT */}
        <Stack gap={4}>
          <Title order={5}>Mô tả chi tiết</Title>
          <Text size="sm">{product.full_description}</Text>
        </Stack>

        {/* THÔNG TIN THÊM */}
        <Stack gap={4}>
          <Title order={5}>Thông tin thêm</Title>
          <List spacing="xs" size="sm" icon="•">
            {extraInfoList.map((item, index) => (
              <List.Item key={index}>{item}</List.Item>
            ))}
          </List>
        </Stack>
      </Stack>
    </Modal>
  );
}

// Component riêng cho ảnh có Skeleton
function ImageWithSkeleton({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ width: 180, height: 180, position: 'relative' }}>
      {!loaded && <Skeleton height={180} width={180} radius="md" />}
      <Image
        src={src}
        alt="gallery"
        width={180}
        height={180}
        radius="md"
        fit="cover"
        style={{
          position: loaded ? 'static' : 'absolute',
          inset: 0,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
