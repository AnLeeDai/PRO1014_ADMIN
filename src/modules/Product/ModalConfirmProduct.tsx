import { Button, Group, Modal, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useHideProduct } from '@/hooks/useHideProduct';
import { useUnProduct } from '@/hooks/useUnProduct';

interface ModalConfirmProductProps {
  opened: boolean;
  onClose: () => void;
  onHide: () => void;
  onShow?: () => void;
  isState: 'hide' | 'show';
  productId?: number | undefined;
  refetch?: () => void;
}

export default function ModalConfirmProduct({
  opened,
  onClose,
  onHide,
  onShow,
  isState,
  productId,
  refetch,
}: ModalConfirmProductProps) {
  const { mutate: mutateHideProduct, isPending: isPendingHideProduct } = useHideProduct({
    onSuccess: () => {
      notifications.show({
        title: 'Thành công',
        message: `Sản phẩm đã được ${isState === 'hide' ? 'ẩn' : 'hiện'} thành công`,
        color: 'green',
      });

      refetch?.();
      onHide();
    },

    onError: () => {
      notifications.show({
        title: 'Thất bại',
        message: `Sản phẩm không thể ${isState === 'hide' ? 'ẩn' : 'hiện'}!`,
        color: 'red',
      });
    },

    onSettled: () => {
      onClose();
    },
  });

  const { mutate: mutateUnProduct, isPending: isPendingUnProduct } = useUnProduct({
    onSuccess: () => {
      notifications.show({
        title: 'Thành công',
        message: `Sản phẩm đã được ${isState === 'hide' ? 'ẩn' : 'hiện'} thành công`,
        color: 'green',
      });

      refetch?.();
      onShow?.();
    },

    onError: () => {
      notifications.show({
        title: 'Thất bại',
        message: `Sản phẩm không thể ${isState === 'hide' ? 'ẩn' : 'hiện'}!`,
        color: 'red',
      });
    },

    onSettled: () => {
      onClose();
    },
  });

  const isHiding = isState === 'hide';
  const actionLabel = isHiding ? 'Ẩn' : 'Hiện';

  const handleConfirm = () => {
    if (!productId) {
      return;
    }

    if (isHiding) {
      mutateHideProduct(productId);
    } else {
      mutateUnProduct(productId);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Xác nhận ${actionLabel.toLowerCase()} sản phẩm`}
      centered
      withCloseButton
    >
      <Text>Bạn có chắc chắn muốn {actionLabel.toLowerCase()} sản phẩm này không?</Text>

      <Group mt="md" justify="center" wrap="nowrap">
        <Button fullWidth variant="default" onClick={onClose}>
          Huỷ
        </Button>

        <Button
          fullWidth
          onClick={handleConfirm}
          color={isHiding ? 'red' : 'green'}
          loading={isHiding ? isPendingHideProduct : isPendingUnProduct}
        >
          {actionLabel}
        </Button>
      </Group>
    </Modal>
  );
}
