import type { HeaderProps } from '@/types/layout';
import { Navigation } from './Navigation';
import { useLayoutStore } from '@/stores/layout-store';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { Menu, X } from 'lucide-react';

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { navigationItems, sidebarOpen } = useLayoutStore();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                DataStorm
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Electric Vehicle Data Hub
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation 
              items={navigationItems} 
              variant="horizontal"
              className="ml-8"
            />
          </div>

          {/* Theme Switcher and Mobile Menu */}
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuToggle}
                className="p-2"
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
