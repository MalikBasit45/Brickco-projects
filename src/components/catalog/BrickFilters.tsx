import React from 'react';
import { Filter, X } from 'lucide-react';
import Button from '../ui/Button';

interface FiltersProps {
  filters: {
    type: string;
    size: string;
    minPrice: number;
    maxPrice: number;
    inStock: boolean;
  };
  onFilterChange: (name: string, value: string | number | boolean) => void;
  onFilterReset: () => void;
  toggleFilterPanel: () => void;
  isMobileFilterVisible: boolean;
}

const BrickFilters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  onFilterReset,
  toggleFilterPanel,
  isMobileFilterVisible,
}) => {
  const typeOptions = ['', 'Clay', 'Concrete', 'Glass', 'Special'];
  const sizeOptions = ['', 'Small', 'Standard', 'Large'];

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <Button 
          onClick={toggleFilterPanel}
          variant="outline"
          className="w-full"
          icon={<Filter size={18} />}
        >
          Filters
        </Button>
      </div>

      {/* Filter panel - visible on larger screens and conditionally on mobile */}
      <div 
        className={`
          ${isMobileFilterVisible ? 'fixed inset-0 z-40 bg-white p-4 overflow-y-auto' : 'hidden'} 
          lg:block lg:static lg:bg-transparent lg:p-0
        `}
      >
        <div className="flex justify-between items-center mb-4 lg:hidden">
          <h2 className="text-xl font-bold">Filters</h2>
          <button onClick={toggleFilterPanel} className="p-1 rounded-full hover:bg-neutral-100">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Type Filter */}
          <div>
            <h3 className="text-lg font-medium mb-3">Brick Type</h3>
            <div className="space-y-2">
              {typeOptions.map((type) => (
                <label key={type || 'all'} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={filters.type === type}
                    onChange={(e) => onFilterChange('type', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-neutral-700">
                    {type || 'All Types'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="text-lg font-medium mb-3">Size</h3>
            <div className="space-y-2">
              {sizeOptions.map((size) => (
                <label key={size || 'all'} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value={size}
                    checked={filters.size === size}
                    onChange={(e) => onFilterChange('size', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-neutral-700">
                    {size || 'All Sizes'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h3 className="text-lg font-medium mb-3">Price Range</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="min-price" className="block text-sm text-neutral-600 mb-1">
                  Min Price ($)
                </label>
                <input
                  id="min-price"
                  type="number"
                  min="0"
                  step="0.1"
                  value={filters.minPrice}
                  onChange={(e) => onFilterChange('minPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="max-price" className="block text-sm text-neutral-600 mb-1">
                  Max Price ($)
                </label>
                <input
                  id="max-price"
                  type="number"
                  min="0"
                  step="0.1"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onFilterChange('maxPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* In Stock Filter */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => onFilterChange('inStock', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="ml-2 text-neutral-700">In Stock Only</span>
            </label>
          </div>

          {/* Reset Button */}
          <div className="pt-2">
            <Button
              onClick={onFilterReset}
              variant="outline"
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Mobile Apply Button */}
        <div className="mt-6 lg:hidden">
          <Button onClick={toggleFilterPanel} className="w-full">
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
};

export default BrickFilters;