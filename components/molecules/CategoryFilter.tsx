import FilterButton from '../atoms/FilterButton';

const FILTERS = ['AI', 'Development', 'Creative', 'Marketing', 'Writing'];

interface CategoryFilterProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export default function CategoryFilter({ activeFilter, onFilterChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {FILTERS.map((filter) => (
        <FilterButton
          key={filter}
          label={filter}
          isActive={activeFilter === filter}
          onClick={() => onFilterChange?.(filter)}
        />
      ))}
    </div>
  );
}
