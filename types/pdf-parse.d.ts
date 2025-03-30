// Type definitions for pdf-parse
// Allows TypeScript to use the pdf-parse module without type errors

declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: {
      PDFFormatVersion?: string;
      IsAcroFormPresent?: boolean;
      IsXFAPresent?: boolean;
      IsCollectionPresent?: boolean;
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      Creator?: string;
      Producer?: string;
      CreationDate?: string;
      ModDate?: string;
      [key: string]: any;
    };
    metadata: any;
    text: string;
    version: string;
  }

  /**
   * Parse PDF file
   * @param dataBuffer - PDF file content as Buffer
   * @param options - Custom options
   */
  function PDFParse(
    dataBuffer: Buffer,
    options?: {
      pagerender?: (pageData: any) => string;
      max?: number;
      version?: string;
    }
  ): Promise<PDFData>;

  export default PDFParse;
} 