import React, { useState } from 'react';
import cx from 'clsx';
import {
  ActionIcon,
  Group,
  MantineColor,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Tooltip,
} from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import classes from './MyTable.module.css';

interface Column {
  key: string; // Key để truy cập dữ liệu từ mỗi item
  title: string; // Tiêu đề của cột
  render?: (item: any) => React.ReactNode; // Hàm tùy chọn để render nội dung ô
}

interface Action {
  icon: React.FC<any>; // Component icon
  color?: MantineColor; // Màu của ActionIcon
  onClick: (item: any) => void; // Hàm xử lý khi click
  tooltipLabel?: string; // Nhãn tooltip (tùy chọn)
}

interface MyTableProps {
  data: any[]; // Mảng dữ liệu cho bảng
  columns: Column[]; // Cấu hình các cột
  actions?: Action[]; // Các hành động cho mỗi hàng (tùy chọn)
  total?: number; // Tổng số mục (cho phân trang)
  page?: number; // Trang hiện tại (cho phân trang)
  onPageChange?: (page: number) => void; // Hàm xử lý khi đổi trang
}

export default function MyTable({
  data,
  columns,
  actions,
  total,
  page,
  onPageChange,
}: MyTableProps) {
  const [scrolled, setScrolled] = useState(false);

  const { height } = useViewportSize();

  return (
    <Stack>
      <ScrollArea
        h={height < 600 ? height - 200 : height > 800 ? height - 300 : height - 250}
        onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
      >
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={column.key}>{column.title}</Table.Th>
              ))}
              {actions && <Table.Th>Thao tác</Table.Th>}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {data.map((item, index) => (
              <Table.Tr key={index}>
                {columns.map((column) => (
                  <Table.Td key={`${index}-${column.key}`}>
                    {column.render ? column.render(item) : item[column.key]}
                  </Table.Td>
                ))}

                {actions && (
                  <Table.Td>
                    <Group gap="xs" align="center">
                      {actions.map((action, actionIndex) => (
                        <Tooltip
                          key={actionIndex}
                          label={action.tooltipLabel || 'Thao tác'}
                          position="top"
                          withArrow
                        >
                          <ActionIcon
                            key={actionIndex}
                            color={action.color}
                            onClick={() => action.onClick(item)}
                          >
                            <action.icon size={16} />
                          </ActionIcon>
                        </Tooltip>
                      ))}
                    </Group>
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {total !== undefined && onPageChange && (
        <Group justify="center">
          <Pagination
            total={Math.ceil(total / (data.length > 0 ? data.length : 1))}
            value={page}
            onChange={onPageChange}
          />
        </Group>
      )}
    </Stack>
  );
}
