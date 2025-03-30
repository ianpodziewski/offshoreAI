import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as File;

  if (!file) {
    return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
  }

  try {
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`Uploaded file URL: ${blob.url}`);

    return NextResponse.json({ message: 'File uploaded successfully!', url: blob.url });
  } catch (error) {
    console.error("Blob Upload Error:", error);
    return NextResponse.json({ message: 'Blob upload failed.' }, { status: 500 });
  }
}