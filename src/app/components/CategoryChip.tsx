interface CategoryChipProps {
  category: string;
}

export function CategoryChip({ category }: CategoryChipProps) {
  return (
    <div className="glass-chip inline-flex items-center px-2.5 py-1">
      <span className="font-display text-[11px] uppercase tracking-wide text-[#7BADB0]">
        {category}
      </span>
    </div>
  );
}
