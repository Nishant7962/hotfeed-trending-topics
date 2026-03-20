import { X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: 'Settings', path: '/settings' },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[280px] glass-card z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgba(0,200,180,0.10)]">
          <h2 className="font-display text-[18px] text-[#E8F4F0]">Menu</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          >
            <X className="w-6 h-6 text-[#7BADB0]" />
          </button>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleItemClick(item.path)}
                className={`w-full text-left px-4 py-4 rounded-lg font-body text-[16px] transition-colors relative ${
                  isActive
                    ? 'text-[#E8F4F0] bg-[rgba(255,92,53,0.06)]'
                    : 'text-[#7BADB0] hover:text-[#E8F4F0] hover:bg-[rgba(255,255,255,0.03)]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#FF5C35] rounded-r" />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}