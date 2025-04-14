export interface FileFilters {
  filename?: string;
  file_type?: string;
  min_size?: number;
  max_size?: number;
  date_from?: string;
  date_to?: string;
}

export interface SizeOption {
  label: string;
  min: number;
  max: number | null;
}