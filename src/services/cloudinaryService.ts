/**
 * Cloudinary Service for Unsigned Direct Client Uploads
 *
 * Configuration:
 * - Cloud Name: ao8y6v30
 * - Upload Preset: portfolio_upload
 * - Signing Mode: Unsigned
 * - Endpoint: https://api.cloudinary.com/v1_1/ao8y6v30/upload
 * - Max file size: 10MB
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'ao8y6v30',
  uploadPreset: 'portfolio_upload',
  uploadEndpoint: 'https://api.cloudinary.com/v1_1/ao8y6v30/upload',
  rawUploadEndpoint: 'https://api.cloudinary.com/v1_1/ao8y6v30/raw/upload',
  maxFileSize: 10 * 1024 * 1024, // 10MB limit
  maxCvFileSize: 15 * 1024 * 1024, // 15MB limit for PDF
} as const;

export interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  version: number;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
  original_filename: string;
  error?: {
    message: string;
  };
}

/**
 * Validate image file before uploading to Cloudinary.
 * Enforces image MIME type and strict 10MB file size limit.
 */
export function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPEG, PNG, WebP, GIF, etc.).');
  }

  if (file.size > CLOUDINARY_CONFIG.maxFileSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Selected image (${sizeMB}MB) exceeds the 10MB limit. Please choose a smaller file.`);
  }
}

/**
 * Upload an image file directly from the browser to Cloudinary.
 * Uses the unsigned portfolio_upload preset without exposing any API secret.
 * Tracks upload progress via XMLHttpRequest and returns the secure_url.
 */
export function uploadToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      validateImageFile(file);
    } catch (validationError) {
      return reject(validationError);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_CONFIG.uploadEndpoint, true);

    // Track upload progress
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            if (onProgress) onProgress(100);
            resolve(response.secure_url);
          } else {
            reject(new Error('Cloudinary upload completed, but no secure_url was returned.'));
          }
        } catch {
          reject(new Error('Failed to parse Cloudinary response.'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          const errorMessage =
            errorResponse?.error?.message ||
            `Cloudinary upload failed with status ${xhr.status}.`;
          reject(new Error(errorMessage));
        } catch {
          reject(
            new Error(`Cloudinary upload failed with status ${xhr.status}: ${xhr.statusText}`)
          );
        }
      }
    };

    xhr.onerror = () => {
      reject(
        new Error('Network error during upload to Cloudinary. Please check your internet connection.')
      );
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload to Cloudinary timed out. Please try again.'));
    };

    // 60-second timeout for large uploads
    xhr.timeout = 60000;

    xhr.send(formData);
  });
}

/**
 * Upload profile image to Cloudinary and return the secure_url.
 */
export async function uploadProfileImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return uploadToCloudinary(file, onProgress);
}

/**
 * Upload project image / screenshot to Cloudinary and return the secure_url.
 */
export async function uploadProjectImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return uploadToCloudinary(file, onProgress);
}

/**
 * Validate PDF CV file before uploading.
 * Requires .pdf extension or application/pdf MIME type, up to 15MB.
 */
export function validatePdfFile(file: File): void {
  const isPdf =
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    throw new Error('Please select a valid PDF file (.pdf).');
  }

  if (file.size > CLOUDINARY_CONFIG.maxCvFileSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Selected PDF (${sizeMB}MB) exceeds the 15MB limit. Please choose a smaller file.`);
  }
}

export interface CloudinaryCvUploadResult {
  secure_url: string;
  original_filename: string;
  bytes: number;
}

/**
 * Upload a PDF CV directly to Cloudinary using the auto-upload endpoint and portfolio_upload preset.
 * Tracks upload progress via XMLHttpRequest and returns secure_url and metadata.
 */
export function uploadCvToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<CloudinaryCvUploadResult> {
  return new Promise((resolve, reject) => {
    try {
      validatePdfFile(file);
    } catch (validationError) {
      return reject(validationError);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_CONFIG.rawUploadEndpoint, true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            if (onProgress) onProgress(100);
            resolve({
              secure_url: response.secure_url,
              original_filename: file.name,
              bytes: response.bytes || file.size,
            });
          } else {
            reject(new Error('Cloudinary upload completed, but no secure_url was returned.'));
          }
        } catch {
          reject(new Error('Failed to parse Cloudinary response.'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          const errorMessage =
            errorResponse?.error?.message ||
            `Cloudinary upload failed with status ${xhr.status}.`;
          reject(new Error(errorMessage));
        } catch {
          reject(
            new Error(`Cloudinary upload failed with status ${xhr.status}: ${xhr.statusText}`)
          );
        }
      }
    };

    xhr.onerror = () => {
      reject(
        new Error('Network error during upload to Cloudinary. Please check your internet connection.')
      );
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload to Cloudinary timed out. Please try again.'));
    };

    xhr.timeout = 60000;
    xhr.send(formData);
  });
}

