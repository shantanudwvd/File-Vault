export interface File {
  id: string;
  original_filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
  file: string;
  content_hash: string;
  is_duplicate: boolean;
  reference_file: string | null;
  storage_saved: number;
}