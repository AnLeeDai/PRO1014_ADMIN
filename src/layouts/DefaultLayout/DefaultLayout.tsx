import { Link } from 'react-router-dom';
import { Anchor, Button, Code, Divider, Group, ScrollArea, Stack, Title } from '@mantine/core';
import { NavbarLink } from '@/components/NavbarLink/NavbarLink';
import UserInfo from '@/components/UserInfo/UserInfo';
import { routerConfig } from '@/constants/siteConfig';
import classes from './DefaultLayout.module.css';

interface INavbarLink {
  children: React.ReactNode;
  title: string;
  action?: () => void;
}

export default function DefaultLayout({ children, title, action }: INavbarLink) {
  return (
    <Group align="flex-start" gap={0}>
      <nav className={classes.navbar}>
        <div className={classes.header}>
          <Group justify="center" align="center">
            <Anchor component={Link} to={routerConfig.user}>
              <Title>PRO1014-ADMIN</Title>
            </Anchor>

            <Code fw={700} ta="center" w="100%">
              v0.0.1
            </Code>
          </Group>
        </div>

        <ScrollArea className={classes.links}>
          <div className={classes.linksInner}>
            <NavbarLink />
          </div>
        </ScrollArea>

        <div className={classes.footer}>
          <UserInfo />
        </div>
      </nav>

      <Stack flex={1} mt={55}>
        <Group px="md" justify="space-between">
          <Title order={1}>{title}</Title>
          {action && (
            <Button onClick={action} size="md">
              Thêm mới
            </Button>
          )}
        </Group>

        <Divider />

        <Stack px="md">{children}</Stack>
      </Stack>
    </Group>
  );
}
