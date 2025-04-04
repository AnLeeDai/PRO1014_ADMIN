import React from 'react';
import { Box, Container, Paper, Stack, Title } from '@mantine/core';
import classes from './AuthLayout.module.css';

interface IAuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AuthLayout({ children, title }: IAuthLayoutProps) {
  return (
    <Box className={classes.wrapper}>
      <Container size="xs" w="100%">
        <Paper withBorder shadow="md" p="xl" radius="md">
          <Stack>
            {title && (
              <Title order={2} ta="center">
                {title}
              </Title>
            )}

            {children}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
