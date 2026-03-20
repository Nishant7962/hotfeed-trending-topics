import { categories, Category } from '../data/mockPosts';
import { useNavigate, useLocation } from 'react-router';

interface CategoryBarProps {
  activeCategory?: string;
}

export function CategoryBar({ activeCategory }: CategoryBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (category: Category) => {
    if (category === 'Tech' && location.pathname === '/') {
      // Already on home, do nothing
      return;
    }
    navigate(`/category/${category.toLowerCase()}`);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <>
      {/* Desktop: Centered pill tabs */}
      <div className="hidden lg:flex items-center justify-center gap-2">
        {categories.map((category) => {
          const isActive = activeCategory?.toLowerCase() === category.toLowerCase();
          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`
                glass-pill px-4 py-2 text-[13px] font-body font-medium transition-all duration-300
                ${
                  isActive
                    ? 'bg-[rgba(0,220,190,0.18)] text-[#00C8B4] border-[rgba(0,220,190,0.3)]'
                    : 'text-[#7BADB0] hover:text-[#E8F4F0] hover:border-[rgba(0,200,180,0.2)]'
                }
              `}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Tablet/Mobile: Horizontal scroll */}
      <div className="lg:hidden w-full overflow-x-auto scrollbar-hide relative">
        <div
          className="flex items-center gap-2 px-4 py-3 min-w-max"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)',
          }}
        >
          {categories.map((category) => {
            const isActive = activeCategory?.toLowerCase() === category.toLowerCase();
            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`
                  glass-pill px-4 py-2 text-[13px] font-body font-medium transition-all duration-300 whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-[rgba(0,220,190,0.18)] text-[#00C8B4] border-[rgba(0,220,190,0.3)]'
                      : 'text-[#7BADB0]'
                  }
                `}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
