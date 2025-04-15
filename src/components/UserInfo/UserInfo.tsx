import { IconAt, IconLogout, IconPhoneCall } from '@tabler/icons-react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { ActionIcon, Avatar, Group, Text, Tooltip } from '@mantine/core';
import { routerConfig } from '@/constants/siteConfig';
import { useUserInfo } from '@/hooks/useUserInfo';
import classes from './UserInfo.module.css';

export default function UserInfo() {
  const navigate = useNavigate();

  const { data: userInfo, isLoading: isLoadingUserInfo } = useUserInfo();

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user_id');

    navigate(routerConfig.login);
  };

  return (
    <Group p="md" maw={100} wrap="nowrap">
      <Avatar src={userInfo?.user.avatar_url} size="lg" radius="md" />

      <div>
        <Tooltip label={isLoadingUserInfo ? 'Loading...' : userInfo?.user.full_name}>
          <Text fz="lg" fw={500} className={classes.name} lineClamp={1}>
            {isLoadingUserInfo ? 'Loading...' : userInfo?.user.full_name}
          </Text>
        </Tooltip>

        <Group wrap="nowrap" gap={10} mt={3}>
          <IconAt stroke={1.5} size={16} className={classes.icon} />

          <Tooltip label={isLoadingUserInfo ? 'Loading...' : userInfo?.user.email}>
            <Text fz="xs" c="dimmed" lineClamp={1}>
              {isLoadingUserInfo ? 'Loading...' : userInfo?.user.email}
            </Text>
          </Tooltip>
        </Group>

        <Group wrap="nowrap" gap={10} mt={5}>
          <IconPhoneCall stroke={1.5} size={16} className={classes.icon} />
          <Tooltip label={isLoadingUserInfo ? 'Loading...' : userInfo?.user.phone_number}>
            <Text fz="xs" c="dimmed" lineClamp={1}>
              {isLoadingUserInfo ? 'Loading...' : userInfo?.user.phone_number}
            </Text>
          </Tooltip>
        </Group>
      </div>

      <Tooltip label="Đăng xuất" withArrow>
        <ActionIcon color="red" onClick={handleLogout}>
          <IconLogout />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
