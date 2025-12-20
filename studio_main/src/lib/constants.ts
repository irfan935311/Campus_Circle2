import {
  LayoutDashboard,
  Megaphone,
  Users,
  User,
  Search,
} from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/discover', label: 'Search', icon: Search },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];
