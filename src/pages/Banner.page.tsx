import { Center, Stack, Text } from '@mantine/core';
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout';

function Cube3D() {
  return (
    <svg
      width={260}
      height={260}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="cubeTitle cubeDesc"
    >
      <title id="cubeTitle">3D Cube Illustration</title>
      <desc id="cubeDesc">Simple isometric cube used as a coming-soon placeholder</desc>

      <defs>
        <linearGradient id="gradTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        <linearGradient id="gradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id="gradRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>

      <polygon
        points="100,20 180,60 100,100 20,60"
        fill="url(#gradTop)"
        stroke="#0c4a6e"
        strokeWidth="1"
      />
      <polygon
        points="20,60 100,100 100,180 20,140"
        fill="url(#gradLeft)"
        stroke="#0c4a6e"
        strokeWidth="1"
      />
      <polygon
        points="180,60 100,100 100,180 180,140"
        fill="url(#gradRight)"
        stroke="#0c4a6e"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function BannerPage() {
  return (
    <DefaultLayout title="Quản lý banner">
      <Center h="calc(100vh - 64px)">
        <Stack align="center" gap="md">
          <Cube3D />

          <Text size="xl" fw={600}>
            Chức năng sẽ sớm có mặt!
          </Text>

          <Text c="dimmed" ta="center" maw={420}>
            Tính năng Quản&nbsp;lý&nbsp;banner đang được phát triển
          </Text>
        </Stack>
      </Center>
    </DefaultLayout>
  );
}
