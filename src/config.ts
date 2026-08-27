// App configuration — reads from env vars first, falls back to these values
export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://yivwmmyykgrfhoshwpoe.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpdndtbXl5a2dyZmhvc2h3cG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzU2NzEsImV4cCI6MjEwMzMxMTY3MX0.JbsRJB24GhJH9aqrafiDNRNwibIjZtyY6VFsMNlb9B8',
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  openrouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
}
