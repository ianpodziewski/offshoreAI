import { NextRequest, NextResponse } from 'next/server';
import busboy from 'busboy';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    // Create a readable stream from the request
    const contentType = req.headers.get('content-type') || '';
    const contentLength = req.headers.get('content-length') || '0';
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data' },
        { status: 400 }
      );
    }
    
    // Parse the form data using busboy
    const bb = busboy({ headers: { 'content-type': contentType, 'content-length': contentLength } });
    
    // Create a promise to handle the form data
    const formData = await new Promise<{ file?: File, loanId?: string, docType?: string }>((resolve, reject) => {
      const data: { file?: File, loanId?: string, docType?: string } = {};
      
      bb.on('file', (name, file, info) => {
        const { filename, mimeType } = info;
        
        // Process the file stream
        const chunks: Buffer[] = [];
        
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        file.on('end', () => {
          const buffer = Buffer.concat(chunks);
          
          // Create a File object
          data.file = new File([buffer], filename, { type: mimeType });
        });
      });
      
      bb.on('field', (name, val) => {
        if (name === 'loanId') {
          data.loanId = val;
        } else if (name === 'docType') {
          data.docType = val;
        }
      });
      
      bb.on('close', () => {
        resolve(data);
      });
      
      bb.on('error', (err) => {
        reject(err);
      });
      
      // Convert request to stream and pipe to busboy
      const readable = Readable.fromWeb(req.body as any);
      readable.pipe(bb);
    });
    
    // Validate the form data
    if (!formData.file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!formData.loanId) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      );
    }
    
    // Log successful upload
    console.log(`Document uploaded successfully: ${formData.file.name} for loan ${formData.loanId}`);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: `Document ${formData.file.name} processed successfully for loan ${formData.loanId}`,
      loanId: formData.loanId,
      docType: formData.docType || 'unknown',
      fileName: formData.file.name
    });
  } catch (error) {
    console.error('Error processing document upload:', error);
    return NextResponse.json(
      { error: 'Failed to process document upload' },
      { status: 500 }
    );
  }
} 