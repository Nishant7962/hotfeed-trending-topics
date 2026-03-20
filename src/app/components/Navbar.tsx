import { useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { LiveDot } from './LiveDot';
import { CategoryBar } from './CategoryBar';
import { SearchBar } from './SearchBar';
import { HamburgerMenu } from './HamburgerMenu';
import { useNavigate } from 'react-router';

interface NavbarProps {
  activeCategory?: string;
}

export function Navbar({ activeCategory }: NavbarProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="sticky top-1 z-40 mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="glass-card px-6 py-4 mb-4">
          <div className="flex items-center justify-between gap-8">
            {/* Left: Logo */}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group"
            >
              {/* Liquid drop icon */}
              <div className="relative w-8 h-8">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path
                    d="M16 2C16 2 8 12 8 18C8 22.4183 11.5817 26 16 26C20.4183 26 24 22.4183 24 18C24 12 16 2 16 2Z"
                    fill="#FF5C35"
                  />
                  <ellipse cx="16" cy="18" rx="4" ry="5" fill="#FF8C42" opacity="0.6" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[20px] md:text-[24px] text-[#E8F4F0] group-hover:text-[#FF5C35] transition-colors">
                  HotFeed
                </span>
                <LiveDot />
              </div>
            </button>

            {/* Center: Category Bar (Desktop only) */}
            <div className="hidden lg:flex flex-1 justify-center">
              <CategoryBar activeCategory={activeCategory} />
            </div>

            {/* Right: Search + Avatar (Desktop) / Icons (Mobile) */}
            <div className="flex items-center gap-4">
              {/* Desktop Search */}
              <div className="hidden lg:block">
                <SearchBar />
              </div>

              {/* Mobile Search Icon */}
              <button
                onClick={() => setShowMobileSearch(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              >
                <Search className="w-5 h-5 text-[#7BADB0]" />
              </button>

              {/* User Avatar */}
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full glass-card overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-[#FF5C35] to-[#FF8C42] flex items-center justify-center">
                  <span className="font-display text-[14px] text-white">U</span>
                </div>
              </div>

              {/* Mobile Menu Icon */}
              <button
                onClick={() => setShowMenu(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              >
                <Menu className="w-5 h-5 text-[#7BADB0]" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Bar (Tablet/Mobile) */}
        <div className="lg:hidden mb-4">
          <CategoryBar activeCategory={activeCategory} />
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <SearchBar isMobile onClose={() => setShowMobileSearch(false)} />
      )}

      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
}
