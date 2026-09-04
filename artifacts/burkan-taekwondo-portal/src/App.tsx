import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

import { RoleProvider } from '@/lib/role-store';
import { AppShell } from '@/components/app-shell';

import Dashboard from '@/pages/dashboard';
import Students from '@/pages/students';
import Attendance from '@/pages/attendance';
import BeltTests from '@/pages/belt-tests';
import Feedback from '@/pages/feedback';
import Finances from '@/pages/finances';
import Schedule from '@/pages/schedule';
import News from '@/pages/news';
import Locations from '@/pages/locations';
import About from '@/pages/about';
import Settings from '@/pages/settings';
import Login from '@/pages/login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppShell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/students" component={Students} />
          <Route path="/attendance" component={Attendance} />
          <Route path="/belt-tests" component={BeltTests} />
          <Route path="/feedback" component={Feedback} />
          <Route path="/finances" component={Finances} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/news" component={News} />
          <Route path="/locations" component={Locations} />
          <Route path="/about" component={About} />
          <Route path="/settings" component={Settings} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </AppShell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoleProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </RoleProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
