import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY in environment variables. Please add it to your .env.local file.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
 * Analyzes text content and provides suggestions and SEO scores
 * @param text - The text to analyze
 * @returns Promise<AnalysisResult>
 */
export interface AnalysisResult {
  suggestions: {
    correctness: number;
    clarity: number;
    engagement: number;
    delivery: number;
  };
  seo: {
    score: number;
    suggestions: string[];
  };
  analysis: string;
}

export async function analyzeContent(text: string): Promise<AnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `You are a JSON generator. Return ONLY a JSON object with no additional text or formatting.
The JSON object must follow this EXACT structure and format:
{
  "suggestions": {
    "correctness": 0.8,
    "clarity": 0.7,
    "engagement": 0.6,
    "delivery": 0.75
  },
  "seo": {
    "score": 0.65,
    "suggestions": [
      "Add more keywords",
      "Improve meta description",
      "Use more headings"
    ]
  },
  "analysis": "Brief analysis of the content goes here"
}

Analyze this text and respond with a JSON object using the above structure: ${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    
    // Clean up the response text
    responseText = responseText
      .replace(/```json\n/g, '') // Remove ```json and newline
      .replace(/```\n/g, '')     // Remove ``` and newline
      .replace(/```/g, '')       // Remove any remaining ```
      .replace(/\n+/g, ' ')      // Replace multiple newlines with space
      .trim();                   // Remove any extra whitespace
    
    // Log the cleaned response for debugging
    console.log('Cleaned response:', responseText);
    
    try {
      // Try to extract just the JSON object if there's any extra text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      const parsedResult = JSON.parse(responseText);
      
      // Validate the structure and types
      if (!parsedResult.suggestions?.correctness ||
          !parsedResult.suggestions?.clarity ||
          !parsedResult.suggestions?.engagement ||
          !parsedResult.suggestions?.delivery ||
          !parsedResult.seo?.score ||
          !Array.isArray(parsedResult.seo?.suggestions) ||
          typeof parsedResult.analysis !== 'string') {
        throw new Error('Invalid response structure');
      }
      
      // Ensure all scores are numbers between 0 and 1
      const normalizeScore = (score: number) => Math.max(0, Math.min(1, Number(score)));
      
      return {
        suggestions: {
          correctness: normalizeScore(parsedResult.suggestions.correctness),
          clarity: normalizeScore(parsedResult.suggestions.clarity),
          engagement: normalizeScore(parsedResult.suggestions.engagement),
          delivery: normalizeScore(parsedResult.suggestions.delivery),
        },
        seo: {
          score: normalizeScore(parsedResult.seo.score),
          suggestions: parsedResult.seo.suggestions.map(String),
        },
        analysis: String(parsedResult.analysis),
      };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Response text:', responseText);
      // Return default values if parsing fails
      return {
        suggestions: {
          correctness: 0.5,
          clarity: 0.5,
          engagement: 0.5,
          delivery: 0.5,
        },
        seo: {
          score: 0.5,
          suggestions: ['Could not analyze text. Please try again.'],
        },
        analysis: 'Analysis not available.',
      };
    }
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw new Error('Failed to analyze content');
  }
} 