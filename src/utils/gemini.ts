import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

type RewriteStyle = 'hindi' | 'english';

/**
 * Rewrites the entire text content based on the selected style
 * @param text - The full text to rewrite
 * @param style - The style to rewrite in (hindi or english)
 * @returns Promise<string> - The rewritten text
 */
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

/**
 * Rewrites a selected portion of text with more focused and contextual prompting
 * @param text - The selected text to rewrite
 * @param style - The style to rewrite in (hindi or english)
 * @returns Promise<string> - The rewritten text
 */
export async function rewriteSelectedText(text: string, style: RewriteStyle = 'hindi'): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = getPromptForSelectedText(style, text);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error rewriting selected text:', error);
    throw new Error('Failed to rewrite selected text');
  }
}

/**
 * Generates a prompt for full text rewriting
 * @param style - The style to rewrite in
 * @param text - The text to rewrite
 * @returns string - The generated prompt
 */
function getPromptForStyle(style: RewriteStyle, text: string): string {
  switch (style) {
    case 'hindi':
      return `Make this in very natural language that normal man speck in active voice in hindi just provide the output text:\n\n${text}`;
    case 'english':
      return `Rewrite Whole text from starting and Make this in very natural language that normal man speck in active voice in english just provide the output text:\n\n${text}`;
    default:
      return `Make this in very natural language that normal man speck in active voice in hindi just provide the output text:\n\n${text}`;
  }
}

/**
 * Generates a more focused prompt for selected text rewriting
 * This prompt is designed to maintain better context and flow with surrounding text
 * @param style - The style to rewrite in
 * @param text - The selected text to rewrite
 * @returns string - The generated prompt
 */
function getPromptForSelectedText(style: RewriteStyle, text: string): string {
  switch (style) {
    case 'hindi':
      return `rewrite this specific text segment into natural conversational Hindi, maintaining its original tone and context. Keep the output focused and concise:\n\n${text}\n\nProvide only the rewritten text without any explanations.`;
    case 'english':
      return `Rewrite this specific text segment into natural conversational English, maintaining its original tone and context. Make it sound natural and fluid while keeping the same meaning:\n\n${text}\n\nProvide only the rewritten text without any explanations.`;
    default:
      return `rewrite this specific text segment into natural conversational Hindi, maintaining its original tone and context. Keep the output focused and concise:\n\n${text}\n\nProvide only the rewritten text without any explanations.`;
  }
} 