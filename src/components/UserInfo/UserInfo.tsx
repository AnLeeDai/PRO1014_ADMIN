import { IconAt, IconLogout, IconPhoneCall } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { ActionIcon, Avatar, Group, Text, Tooltip } from '@mantine/core';
import { routerConfig } from '@/constants/siteConfig';
import classes from './UserInfo.module.css';

export default function UserInfo() {
  return (
    <Group p="md" maw={100} wrap="nowrap">
      <Avatar
        src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
        size="lg"
        radius="md"
      />

      <div>
        <Tooltip label="Robert Glassbreaker">
          <Text fz="lg" fw={500} className={classes.name} lineClamp={1}>
            Robert Glassbreaker
          </Text>
        </Tooltip>

        <Group wrap="nowrap" gap={10} mt={3}>
          <IconAt stroke={1.5} size={16} className={classes.icon} />

          <Tooltip label="robert@glassbreaker.io">
            <Text fz="xs" c="dimmed" lineClamp={1}>
              robert@glassbreaker.io
            </Text>
          </Tooltip>
        </Group>

        <Group wrap="nowrap" gap={10} mt={5}>
          <IconPhoneCall stroke={1.5} size={16} className={classes.icon} />
          <Tooltip label="+11 (876) 890 56 23">
            <Text fz="xs" c="dimmed" lineClamp={1}>
              +11 (876) 890 56 23
            </Text>
          </Tooltip>
        </Group>
      </div>

      <Tooltip label="Đăng xuất" withArrow>
        <ActionIcon color="red" component={Link} to={routerConfig.login}>
          <IconLogout />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
