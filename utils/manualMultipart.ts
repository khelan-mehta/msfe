// utils/manualMultipart.ts - Manual Multipart Form Data Builder

/**
 * Manually construct multipart/form-data for React Native Web
 * This bypasses issues with FormData not properly sending filenames
 */

export async function createManualMultipart(
  fileUri: string,
  filename: string,
  mimeType: string
): Promise<{ body: string; boundary: string }> {
  // Generate a unique boundary
  const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;

  // Fetch the file as blob
  const response = await fetch(fileUri);
  const blob = await response.blob();

  // Convert blob to base64
  const base64Data = await blobToBase64(blob);

  // Build multipart body manually
  const parts: string[] = [];

  // Add file part with proper headers
  parts.push(`--${boundary}`);
  parts.push(`Content-Disposition: form-data; name="file"; filename="${filename}"`);
  parts.push(`Content-Type: ${mimeType}`);
  parts.push('');
  parts.push(base64Data);
  parts.push(`--${boundary}--`);

  const body = parts.join('\r\n');

  return { body, boundary };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
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
 * Alternative: Use XMLHttpRequest which handles multipart better
 */
export function uploadWithXHR(
  url: string,
  fileUri: string,
  filename: string,
  mimeType: string,
  token: string,
  onProgress?: (percent: number) => void
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch file as blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Create File object
      const file = new File([blob], filename, { type: mimeType });

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Use XMLHttpRequest instead of fetch
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = (e.loaded / e.total) * 100;
          onProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      // Don't set Content-Type - let XMLHttpRequest set it with boundary

      xhr.send(formData);
    } catch (error) {
      reject(error);
    }
  });
}