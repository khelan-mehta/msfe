// utils/fileUpload.ts - Working File Upload for React Native Web + Rocket

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { API_BASE_URL } from '../constants';

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  message?: string;
  error?: string;
}

/**
 * Upload a document (works for both web and native)
 */
export async function uploadDocument(
  imageUri: string,
  type: 'front' | 'back' | 'selfie'
): Promise<UploadResult> {
  // Keep existing behavior (document upload)
  try {
    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    // Get file extension from URI
    const uriParts = imageUri.split('.');
    const fileExtension = uriParts[uriParts.length - 1].toLowerCase();

    // Determine extension and mime type
    let extension = 'jpg';
    let mimeType = 'image/jpeg';

    if (['jpg', 'jpeg'].includes(fileExtension)) {
      extension = 'jpg';
      mimeType = 'image/jpeg';
    } else if (fileExtension === 'png') {
      extension = 'png';
      mimeType = 'image/png';
    }

    const filename = `${type}_${Date.now()}.${extension}`;

    console.log('=== Upload Starting ===');
    console.log('URI:', imageUri);
    console.log('Filename:', filename);
    console.log('MIME Type:', mimeType);
    console.log('Platform:', Platform.OS);

    const formData = new FormData();

    if (Platform.OS === 'web') {
      // For web, we need to create a proper File object
      console.log('Web platform: Converting to blob...');

      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();

        console.log('Blob created:', blob.type, blob.size);

        // Create a File object from the Blob
        // The File constructor takes: bits, filename, options
        const file = new File([blob], filename, { type: mimeType });

        console.log('File object created:', file.name, file.type, file.size);

        // Append the File object
        formData.append('file', file);
      } catch (error) {
        console.error('Failed to create file from blob:', error);
        return {
          success: false,
          error: 'Failed to process image',
        };
      }
    } else {
      // For native (iOS/Android)
      console.log('Native platform: Using native format...');

      formData.append('file', {
        uri: imageUri,
        type: mimeType,
        name: filename,
      } as any);
    }

    console.log('Sending request to:', `${API_BASE_URL}/upload/document`);

    // Upload
    const uploadResponse = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let FormData set it with boundary
      },
      body: formData,
    });

    const result = await uploadResponse.json();

    console.log('Upload response:', result);
    console.log('=== Upload Complete ===\n');

    if (result.success) {
      return {
        success: true,
        url: result.data.url,
        filename: result.data.filename,
        message: result.data.message,
      };
    } else {
      return {
        success: false,
        error: result.message || 'Upload failed',
      };
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload document',
    };
  }
}

// New: upload profile photo using user-specific endpoint (more tolerant of missing content-type)
export async function uploadProfilePhoto(
  imageUri: string
): Promise<UploadResult> {
  try {
    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    // Get file extension from URI
    const uriParts = imageUri.split('.');
    const fileExtension = uriParts[uriParts.length - 1].toLowerCase();

    // Determine extension and mime type
    let extension = 'jpg';
    let mimeType = 'image/jpeg';

    if (['jpg', 'jpeg'].includes(fileExtension)) {
      extension = 'jpg';
      mimeType = 'image/jpeg';
    } else if (fileExtension === 'png') {
      extension = 'png';
      mimeType = 'image/png';
    }

    const filename = `profile_${Date.now()}.${extension}`;

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: mimeType });
      formData.append('file', file);
    } else {
      formData.append('file', {
        uri: imageUri,
        type: mimeType,
        name: filename,
      } as any);
    }

    const uploadResponse = await fetch(`${API_BASE_URL}/user/upload-photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await uploadResponse.json();

    if (result.success) {
      return {
        success: true,
        url: result.data.url,
        filename: result.data.filename,
        message: result.data.message,
      };
    }

    return {
      success: false,
      error: result.message || 'Upload failed',
    };
  } catch (error: any) {
    console.error('Upload profile photo error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload profile photo',
    };
  }
}

/**
 * USAGE IN SETTINGSSCREEN:
 * 
 * import { uploadDocument } from './utils/fileUpload';
 * 
 * const uploadImage = async (uri: string, type: 'front' | 'back' | 'selfie') => {
 *   try {
 *     const result = await uploadDocument(uri, type);
 *     
 *     if (result.success) {
 *       if (type === 'front') setDocumentFrontImage(result.url!);
 *       else if (type === 'back') setDocumentBackImage(result.url!);
 *       else setSelfieImage(result.url!);
 *       
 *       toast.showWarning('Success', 'Image uploaded successfully');
 *     } else {
 *       throw new Error(result.error);
 *     }
 *   } catch (error: any) {
 *     toast.showWarning('Error', error.message || 'Failed to upload image');
 *   }
 * };
 */