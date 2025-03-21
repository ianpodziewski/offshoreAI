/**
 * Utility functions for handling document files and previews
 */

/**
 * Creates a blob URL from a file to enable browser viewing
 * @param file The File object to create a URL for
 * @returns A blob URL that can be used in an iframe src attribute
 */
export const createBlobUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };
  
  /**
   * Creates a blob URL from base64 data
   * @param base64Data Base64-encoded file data
   * @param mimeType The MIME type of the file
   * @returns A blob URL that can be used in an iframe src attribute
   */
  export const createBlobUrlFromBase64 = (base64Data: string, mimeType: string): string => {
    try {
      // Decode base64 data
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      // Create a blob from the byte arrays
      const blob = new Blob(byteArrays, { type: mimeType });
      
      // Create and return a URL for the blob
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating blob URL from base64:', error);
      return '';
    }
  };
  
  /**
   * Gets the MIME type based on file extension
   * @param filename The filename to get the MIME type for
   * @returns The MIME type string
   */
  export const getMimeTypeFromFilename = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'html': 'text/html',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'csv': 'text/csv',
      'xml': 'application/xml',
      'json': 'application/json',
      'zip': 'application/zip',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
      'wav': 'audio/wav',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'rtf': 'application/rtf'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  };
  
  /**
   * Convert a File to base64 string
   * @param file The File object to convert
   * @returns A Promise that resolves to the base64 string
   */
  export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (data:application/pdf;base64,)
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };
  
  /**
   * Clean up blob URLs to prevent memory leaks
   * @param url The blob URL to revoke
   */
  export const revokeBlobUrl = (url: string): void => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };
  
  /**
   * Generate a temporary preview URL for a document
   * For document objects that have fileData (base64) or a File object
   */
  export const getDocumentPreviewUrl = (document: any): string | null => {
    if (!document) return null;
    
    // If it already has a fileUrl, use it
    if (document.fileUrl && document.fileUrl.startsWith('blob:')) {
      return document.fileUrl;
    }
    
    // If it has a fileObj (actual File object), create blob URL
    if (document.fileObj instanceof File) {
      return createBlobUrl(document.fileObj);
    }
    
    // If it has base64 data, create a blob URL from it
    if (document.fileData) {
      const mimeType = getMimeTypeFromFilename(document.filename || '');
      return createBlobUrlFromBase64(document.fileData, mimeType);
    }
    
    return null;
  };
  
  /**
   * Determine if a file is viewable in the browser
   * @param filename The filename to check
   * @returns Boolean indicating if the file can be viewed in browser
   */
  export const isFileViewable = (filename: string): boolean => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const viewableExtensions = [
      'pdf', 'jpg', 'jpeg', 'png', 'gif', 'html', 'txt', 'json', 'svg'
    ];
    
    return viewableExtensions.includes(extension);
  };
  
  /**
   * Create a data URL from base64 data
   * @param base64Data Base64-encoded file data
   * @param mimeType The MIME type of the file
   * @returns A data URL that can be used in an iframe src or img src
   */
  export const createDataUrl = (base64Data: string, mimeType: string): string => {
    return `data:${mimeType};base64,${base64Data}`;
  };
  
  /**
   * Get the appropriate icon for a file type
   * @param filename The filename to get an icon for
   * @returns An SVG element or path for the file type icon
   */
// Update this part of your documentUtils.ts file

/**
 * Get the appropriate icon for a file type
 * @param filename The filename to get an icon for
 * @returns A string containing SVG markup
 */
    export const getFileTypeIcon = (filename: string): string => {
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        
        // PDF icon
        if (extension === 'pdf') {
        return `<svg 
            width="24" 
            height="24" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="1.5" 
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
        </svg>`;
        }
        
        // Default file icon
        return `<svg 
        width="24" 
        height="24" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
        >
        <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="1.5" 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        </svg>`;
    };