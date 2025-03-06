import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as File;

  if (!file) {
    return NextResponse.json({ message: 'No file received.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const path = `./public/uploads/${file.name}`;
  await writeFile(path, buffer);

  console.log(`Uploaded file saved at: ${path}`);

  return NextResponse.json({ message: 'File uploaded successfully!' }, { status: 200 });
}
