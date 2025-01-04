import { NextResponse } from 'next/server';
import { rewriteText } from '@/utils/gemini';

export async function POST(request: Request) {
  try {
    const { text, style = 'hindi' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const rewrittenText = await rewriteText(text, style);
    
    return NextResponse.json({ rewrittenText });
  } catch (error) {
    console.error('Error in rewrite API:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite text' },
      { status: 500 }
    );
  }
} 