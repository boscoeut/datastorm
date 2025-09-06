import { create } from 'zustand';
import type { LayoutState, LayoutActions, NavigationItem } from '@/types/layout';

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'vehicles',
    label: 'Vehicle Database',
    href: '/vehicles',
  },
  {
    id: 'battle',
    label: 'Vehicle Battle',
    href: '/battle',
  },
  {
    id: 'news',
    label: 'Industry News',
    href: '/news',
  },
  {
    id: 'chat',
    label: 'Chat',
    href: '/chat',
  },
  {
    id: 'sql',
    label: 'SQL',
    href: '/sql',
  },
];

export const useLayoutStore = create<LayoutState & LayoutActions>((set) => ({
  // State
  sidebarOpen: false,
  currentRoute: '/',
  navigationItems: defaultNavigationItems,

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  setCurrentRoute: (route: string) => set({ currentRoute: route }),
  
  setNavigationItems: (items: NavigationItem[]) => set({ navigationItems: items }),
}));
