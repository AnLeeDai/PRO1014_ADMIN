import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Router } from './Router';
import { theme } from './theme';

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 0,
      },
    },
  });

  return (
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Notifications position="top-center" />
        <Router />
      </QueryClientProvider>
    </MantineProvider>
  );
}
