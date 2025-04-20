import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import {
  Anchor,
  Button,
  Code,
  Divider,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Title,
} from '@mantine/core';
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Cookies.get('token')) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <Group justify="center" align="center" style={{ width: '100%', height: '100vh' }}>
        <Loader size="xl" />
      </Group>
    );
  }

  return (
    <Group align="flex-start" gap={0}>
      <nav className={classes.navbar}>
        <div className={classes.header}>
          <Group justify="center" align="center">
            <Anchor component={Link} to={routerConfig.user}>
              <Title>ADMIN</Title>
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

      <Stack flex={1} mt="lg">
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
