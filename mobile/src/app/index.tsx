import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Splash } from '@/components/splash';

export default function Index() {
  const { initializing, user, profile } = useAuth();
  if (initializing) return <Splash />;
  if (!user) return <Redirect href="/login" />;
  if (profile?.status === 'approved') return <Redirect href="/home" />;
  return <Redirect href="/pending" />;
}
