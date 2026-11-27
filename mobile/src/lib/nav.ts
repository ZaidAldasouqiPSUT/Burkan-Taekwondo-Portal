import type { Href } from 'expo-router';
import type { IconName } from '@/components/ui';
import type { Role } from './types';

export interface NavItem {
  href: Href;
  label: string;
  icon: IconName;
  roles: Role[];
  description: string;
}

const everyone: Role[] = ['student', 'parent', 'coach', 'admin'];

/** Screens reachable from the "More" tab — same role matrix as the web portal. */
export const MORE_ITEMS: NavItem[] = [
  { href: '/students', label: 'Students', icon: 'users', roles: ['parent', 'coach', 'admin'], description: 'Roster & profiles' },
  { href: '/belt-tests', label: 'Belt Tests', icon: 'award', roles: everyone, description: 'Promotion tests & registration' },
  { href: '/finances', label: 'Finances', icon: 'credit-card', roles: ['student', 'parent', 'admin'], description: 'Dues, fees & payments' },
  { href: '/news', label: 'News', icon: 'file-text', roles: everyone, description: 'Announcements & achievements' },
  { href: '/locations', label: 'Locations', icon: 'map-pin', roles: everyone, description: 'Tabarbour & North Marka' },
  { href: '/about', label: 'About Us', icon: 'info', roles: everyone, description: 'Legacy of champions' },
  { href: '/accounts', label: 'Accounts & Approvals', icon: 'user-check', roles: ['admin'], description: 'Approve members, codes, requests' },
  { href: '/settings', label: 'Settings', icon: 'settings', roles: everyone, description: 'Profile, notifications, password' },
];
