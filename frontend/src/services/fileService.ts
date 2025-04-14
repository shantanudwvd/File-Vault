import axios from 'axios';
import {File as FileType} from '../types/file';
import { FileFilters } from '../types/filterTypes';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Add to fileService.ts

interface StorageStats {
    total_files: number;
    unique_files: number;
    duplicate_files: number;
    total_size_bytes: number;
    actual_storage_bytes: number;
    saved_storage_bytes: number;
    efficiency_percentage: number;
}


export const fileService = {
    async uploadFile(file: File): Promise<FileType> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_URL}/files/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async getFiles(filters: FileFilters = {}): Promise<FileType[]> {
        // Build query parameters
        const params = new URLSearchParams();

        // Add each filter to params if it exists
        if (filters.filename) params.append('filename', filters.filename);
        if (filters.file_type) params.append('file_type', filters.file_type);
        if (filters.min_size !== undefined) params.append('min_size', filters.min_size.toString());
        if (filters.max_size !== undefined) params.append('max_size', filters.max_size.toString());
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);

        const response = await axios.get(`${API_URL}/files/`, {params});
        return response.data;
    },

    async deleteFile(id: string): Promise<void> {
        await axios.delete(`${API_URL}/files/${id}/`);
    },

    async downloadFile(fileUrl: string, filename: string): Promise<void> {
        try {
            const response = await axios.get(fileUrl, {
                responseType: 'blob',
            });

            // Create a blob URL and trigger download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            throw new Error('Failed to download file');
        }
    },

    async getFileTypes(): Promise<string[]> {
        const response = await axios.get(`${API_URL}/files/file_types/`);
        return response.data;
    },

    async getStorageStats(): Promise<{
        total_files: number;
        unique_files: number;
        duplicate_files: number;
        total_size_bytes: number;
        actual_storage_bytes: number;
        saved_storage_bytes: number;
        efficiency_percentage: number;
    }> {
        const response = await axios.get(`${API_URL}/files/storage_stats/`);
        return response.data;
    },
}; 