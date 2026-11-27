import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function AuthLayout() {
  const { user, profile } = useAuth();
  if (user && profile) return <Redirect href={profile.status === 'approved' ? '/home' : '/pending'} />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }} />;
}
