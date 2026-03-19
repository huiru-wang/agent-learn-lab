import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const docPath = path.join(process.cwd(), 'src/app/chatbot/docs/index.md');
    const content = await fs.readFile(docPath, 'utf-8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  } catch {
    return NextResponse.json({ error: '文档不存在' }, { status: 404 });
  }
}
