import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

type RewriteStyle = 'hindi' | 'english';

export async function rewriteText(text: string, style: RewriteStyle = 'hindi'): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = getPromptForStyle(style, text);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error rewriting text:', error);
    throw new Error('Failed to rewrite text');
  }
}

function getPromptForStyle(style: RewriteStyle, text: string): string {
  switch (style) {
    case 'hindi':
      return `Make this in very natural language that normal man speck in active voice in hindi just provide the output text:\n\n${text}`;
    case 'english':
      return `Make this in very natural language that normal man speck in active voice in english just provide the output text:\n\n${text}`;
    default:
      return `Make this in very natural language that normal man speck in active voice in hindi just provide the output text:\n\n${text}`;
  }
} 