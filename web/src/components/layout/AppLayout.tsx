import type { AppLayoutProps } from '@/types/layout';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { Footer } from './Footer';
import { useLayoutStore } from '@/stores/layout-store';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useLayoutStore();

  const handleMenuToggle = () => {
    toggleSidebar();
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header onMenuToggle={handleMenuToggle} />
      
      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <MainContent>
            {children}
          </MainContent>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
