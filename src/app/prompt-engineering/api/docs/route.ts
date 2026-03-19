import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const docsDir = path.join(process.cwd(), 'src/app/prompt-engineering/docs');
    const files = await fs.readdir(docsDir);
    
    const docs = files
      .filter(file => file.endsWith('.md'))
      .sort()
      .slice(0, 10)
      .map(file => {
        const name = file.replace('.md', '');
        const title = name
          .replace(/^\d+-/, '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        return { name, title };
      });
    
    return NextResponse.json({ docs });
  } catch {
    return NextResponse.json({ docs: [] });
  }
}
