// Base64 Upload Solution - Bypasses multipart form-data issues

/**
 * Convert image URI to base64 and send as JSON - 2mb limitation
 * This completely bypasses multipart form-data issues
 */

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
 * Convert blob to base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload image as base64 in JSON payload
 */
export async function uploadImageAsBase64(
  imageUri: string,
  type: 'front' | 'back' | 'selfie'
): Promise<UploadResult> {
  try {
    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    console.log('=== Base64 Upload Starting ===');
    console.log('URI:', imageUri);

    // Get file extension
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
    console.log('Filename:', filename);
    console.log('MIME Type:', mimeType);

    // Convert to base64
    let base64Data: string;

    // Convert to base64 for all platforms
    console.log('Converting to base64...');

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      // On native blob.size may be undefined; guard it
      if (blob && (blob as any).size) console.log('Blob size:', (blob as any).size);
      base64Data = await blobToBase64(blob);
      console.log('Base64 length:', base64Data.length);
    } else {
      // Native: use expo-file-system to read file directly as base64
      try {
        const FileSystem = require('expo-file-system');
        base64Data = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
        console.log('Native base64 length:', base64Data.length);
      } catch (err) {
        console.error('Native base64 read failed:', err);
        throw new Error('Native base64 conversion failed');
      }
    }

    // Send as JSON
    console.log('Sending JSON request...');
    const response = await fetch(`${API_BASE_URL}/upload/document-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename,
        mime_type: mimeType,
        data: base64Data,
      }),
    });

    const result = await response.json();
    console.log('Upload result:', result);
    console.log('=== Base64 Upload Complete ===\n');

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
    console.error('Base64 upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload',
    };
  }
}