import { Button, Group, Modal, Text } from '@mantine/core';

interface ModalConfirmProductProps {
  opened: boolean;
  onClose: () => void;
  onHide: () => void;
  onShow?: () => void;
  isState: 'hide' | 'show';
}

export default function ModalConfirmProduct({
  opened,
  onClose,
  onHide,
  onShow,
  isState,
}: ModalConfirmProductProps) {
  const isHiding = isState === 'hide';
  const actionLabel = isHiding ? 'Ẩn' : 'Hiện';

  const handleConfirm = () => {
    isHiding ? onHide() : onShow?.();
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
        <Button fullWidth onClick={handleConfirm} color={isHiding ? 'red' : 'green'}>
          {actionLabel}
        </Button>
      </Group>
    </Modal>
  );
}
