import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
}

export class SupabaseStorage {
  private bucketName = 'uploads';

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File,
    folder: string = 'general',
    options?: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      generateUniqueName?: boolean;
    }
  ): Promise<UploadResult> {
    try {
      // Validate file size
      if (options?.maxSize && file.size > options.maxSize) {
        throw new Error(`File size exceeds limit of ${options.maxSize} bytes`);
      }

      // Validate file type
      if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const fileName = options?.generateUniqueName 
        ? `${timestamp}-${randomId}.${extension}`
        : file.name;

      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  }

  /**
   * Get a list of files in a folder
   */
  async listFiles(folder: string = ''): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folder);

      if (error) {
        throw new Error(`List failed: ${error.message}`);
      }

      return data?.map(file => file.name) || [];
    } catch (error) {
      console.error('File list error:', error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<any> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(filePath.split('/').slice(0, -1).join('/'), {
          search: filePath.split('/').pop()
        });

      if (error) {
        throw new Error(`Metadata fetch failed: ${error.message}`);
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('File metadata error:', error);
      throw error;
    }
  }

  /**
   * Create a signed URL for private file access
   */
  async createSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Signed URL creation failed: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Signed URL error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supabaseStorage = new SupabaseStorage(); 