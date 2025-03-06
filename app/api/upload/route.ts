import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File;

  if (!file) {
    return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: 'public' });

  console.log(`Uploaded file URL: ${blob.url}`);

  return NextResponse.json({ message: 'File uploaded successfully!', url: blob.url }, { status: 200 });
}

