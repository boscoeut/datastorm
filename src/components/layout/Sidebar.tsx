import type { SidebarProps } from '@/types/layout';
import { Navigation } from './Navigation';
import { useLayoutStore } from '@/stores/layout-store';
import { Button } from '@/components/ui/button';
import { X, BarChart3, Newspaper } from 'lucide-react';

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { navigationItems } = useLayoutStore();

  const sidebarItems = [
    ...navigationItems,
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-700 shadow-lg
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="complementary"
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Navigation
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden p-1"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="p-4">
          <Navigation 
            items={sidebarItems} 
            variant="vertical"
            className="mb-6"
          />

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {/* TODO: Implement quick actions */}}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare Vehicles
            </Button>
            

            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {/* TODO: Implement quick actions */}}
            >
              <Newspaper className="w-4 h-4 mr-2" />
              Latest News
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
