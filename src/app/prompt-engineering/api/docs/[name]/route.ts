import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const docPath = path.join(process.cwd(), 'src/app/prompt-engineering/docs', `${name}.md`);
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
