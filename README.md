# AI Text Rewriter

A modern web application that uses AI to rewrite text in natural Hindi language. Built with Next.js, Supabase, and Google's Gemini AI.

## Features

- AI-powered text rewriting
- Real-time word and token counting
- Cost tracking per request
- Usage history with daily statistics
- Dark/Light theme support
- Persistent storage with Supabase
- Modern, responsive UI

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Gemini AI
- Supabase
- Chart.js for statistics

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your credentials:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `GEMINI_API_KEY`: Google Gemini AI API key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
