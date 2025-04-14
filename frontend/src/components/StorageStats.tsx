import React from 'react';
import { fileService } from '../services/fileService';
import { useQuery } from '@tanstack/react-query';

interface StorageStats {
  total_files: number;
  unique_files: number;
  duplicate_files: number;
  total_size_bytes: number;
  actual_storage_bytes: number;
  saved_storage_bytes: number;
  efficiency_percentage: number;
}

export const StorageStats: React.FC = () => {
  // Query for fetching storage statistics
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['storage-stats'],
    queryFn: fileService.getStorageStats,
  });

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <div className="text-red-500">Failed to load storage statistics</div>
      </div>
    );
  }

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Storage Efficiency</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-500">Total Files</p>
          <p className="text-2xl font-bold">{stats.total_files}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-500">Duplicate Files</p>
          <p className="text-2xl font-bold">{stats.duplicate_files}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Storage Savings</h3>
        <div className="h-4 w-full bg-gray-200 rounded-full">
          <div
            className="h-4 bg-primary-600 rounded-full"
            style={{ width: `${stats.efficiency_percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span>{formatBytes(stats.saved_storage_bytes)} saved</span>
          <span>{stats.efficiency_percentage}% efficiency</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Total Size</p>
          <p className="text-lg font-semibold">{formatBytes(stats.total_size_bytes)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Actual Storage Used</p>
          <p className="text-lg font-semibold">{formatBytes(stats.actual_storage_bytes)}</p>
        </div>
      </div>
    </div>
  );
};