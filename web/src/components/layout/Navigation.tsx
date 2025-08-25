import type { NavigationItem } from '@/types/layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  items: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  items, 
  onItemClick, 
  variant = 'horizontal',
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleItemClick = (item: NavigationItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      navigate(item.href);
    }
  };

  const baseClasses = variant === 'horizontal' 
    ? 'flex space-x-4' 
    : 'flex flex-col space-y-2';

  return (
    <nav className={`${baseClasses} ${className}`} role="navigation" aria-label="Main navigation">
      {items.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          onClick={() => handleItemClick(item)}
          className={`
            ${variant === 'horizontal' ? 'px-3 py-2' : 'px-4 py-2 justify-start'}
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors duration-200
            font-medium text-gray-700 dark:text-gray-300
            hover:text-gray-900 dark:hover:text-white
          `}
        >
          {item.icon && <item.icon className="w-4 h-4 mr-2" />}
          {item.label}
        </Button>
      ))}
    </nav>
  );
};
