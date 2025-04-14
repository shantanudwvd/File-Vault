import React, { useState, useEffect } from 'react';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FileFilters, SizeOption } from '../types/filterTypes';
import { fileService } from '../services/fileService';
import { useQuery } from '@tanstack/react-query';

interface FilterPanelProps {
  onFilterChange: (filters: FileFilters) => void;
  currentFilters: FileFilters;
}

// Predefined size options
const sizeOptions: SizeOption[] = [
  { label: 'Any Size', min: 0, max: null },
  { label: 'Small (<1MB)', min: 0, max: 1024 * 1024 },
  { label: 'Medium (1-10MB)', min: 1024 * 1024, max: 10 * 1024 * 1024 },
  { label: 'Large (>10MB)', min: 10 * 1024 * 1024, max: null },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange, currentFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FileFilters>(currentFilters);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);

  // Fetch file types for filter dropdown
  const { data: fileTypes = [] } = useQuery({
    queryKey: ['file-types'],
    queryFn: fileService.getFileTypes,
  });

  // Update local filters state when currentFilters change
  useEffect(() => {
    setFilters(currentFilters);
    // Update applied filters list
    const newAppliedFilters: string[] = [];
    if (currentFilters.file_type) newAppliedFilters.push(`Type: ${currentFilters.file_type}`);
    if (currentFilters.min_size !== undefined || currentFilters.max_size !== undefined) {
      const selectedSize = sizeOptions.find(
        option => option.min === currentFilters.min_size && option.max === currentFilters.max_size
      );
      if (selectedSize) {
        newAppliedFilters.push(`Size: ${selectedSize.label}`);
      }
    }
    if (currentFilters.date_from || currentFilters.date_to) {
      const dateStr = currentFilters.date_from && currentFilters.date_to
        ? `${currentFilters.date_from} to ${currentFilters.date_to}`
        : currentFilters.date_from
          ? `From ${currentFilters.date_from}`
          : `To ${currentFilters.date_to}`;
      newAppliedFilters.push(`Date: ${dateStr}`);
    }
    setAppliedFilters(newAppliedFilters);
  }, [currentFilters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'size') {
      // Handle size selection
      const selectedOption = sizeOptions.find(option =>
        option.min.toString() + '-' + (option.max || 'null') === value
      );

      if (selectedOption) {
        setFilters(prev => ({
          ...prev,
          min_size: selectedOption.min,
          max_size: selectedOption.max !== null ? selectedOption.max : undefined,
        }));
      }
    } else {
      // Handle other filters
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const getSizeValue = (): string => {
    const { min_size, max_size } = filters;

    // Find matching predefined option
    for (const option of sizeOptions) {
      if (option.min === min_size &&
          (option.max === max_size || (option.max === null && max_size === undefined))) {
        return option.min.toString() + '-' + (option.max || 'null');
      }
    }

    // Default to "Any Size"
    return '0-null';
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters: FileFilters = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const removeFilter = (filterType: string) => {
    const newFilters = { ...filters };

    if (filterType.startsWith('Type')) {
      delete newFilters.file_type;
    } else if (filterType.startsWith('Size')) {
      delete newFilters.min_size;
      delete newFilters.max_size;
    } else if (filterType.startsWith('Date')) {
      delete newFilters.date_from;
      delete newFilters.date_to;
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
          Filters
        </button>

        {appliedFilters.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Applied filters */}
      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {appliedFilters.map((filter, index) => (
            <div
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
            >
              {filter}
              <button
                onClick={() => removeFilter(filter)}
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary-200 hover:bg-primary-300"
              >
                <XMarkIcon className="h-3 w-3 text-primary-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter panel */}
      {isOpen && (
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* File Type Filter */}
            <div>
              <label htmlFor="file_type" className="block text-sm font-medium text-gray-700">
                File Type
              </label>
              <select
                id="file_type"
                name="file_type"
                value={filters.file_type || ''}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                {fileTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* File Size Filter */}
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                File Size
              </label>
              <select
                id="size"
                name="size"
                value={getSizeValue()}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {sizeOptions.map((option, index) => (
                  <option key={index} value={`${option.min}-${option.max || 'null'}`}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">
                Upload Date
              </div>
              <div className="flex space-x-2">
                <div>
                  <label htmlFor="date_from" className="sr-only">
                    From
                  </label>
                  <input
                    type="date"
                    id="date_from"
                    name="date_from"
                    value={filters.date_from || ''}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="date_to" className="sr-only">
                    To
                  </label>
                  <input
                    type="date"
                    id="date_to"
                    name="date_to"
                    value={filters.date_to || ''}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="mr-2 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};