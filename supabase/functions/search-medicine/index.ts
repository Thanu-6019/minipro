import { serve } from "std/http/server.ts";
import { Buffer } from "std/io/buffer.ts";

interface SearchMedicineRequest {
  term?: unknown;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting setup
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30;

  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }

  record.count++;
  return { allowed: true };
}

function sanitizeInput(input: unknown): string {
  if (input === null || input === undefined) {
    throw new Error('Input is required');
  }

  const str = String(input).trim();
  if (str.length === 0) {
    throw new Error('Input cannot be empty');
  }

  if (str.length > 100) {
    throw new Error('Input too long (max 100 characters)');
  }

  if (!/^[a-zA-Z0-9\s\-]+$/.test(str)) {
    throw new Error('Input contains invalid characters');
  }

  return str;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const clientIP = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-forwarded-for') || 
                   req.socket?.remoteAddress || 
                   'unknown';

  const rateLimitCheck = checkRateLimit(clientIP);
  if (!rateLimitCheck.allowed) {
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded', 
        retryAfter: rateLimitCheck.retryAfter 
      }),
      { 
        status: 429, 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': rateLimitCheck.retryAfter?.toString() || '60'
        }
      }
    );
  }

  const OPENFDA_API_KEY = Deno.env.get('OPENFDA_API_KEY');
  
  if (!OPENFDA_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let requestBody: SearchMedicineRequest;
  try {
    requestBody = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let sanitizedTerm: string;
  try {
    sanitizedTerm = sanitizeInput(requestBody.term);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const encodedTerm = encodeURIComponent(sanitizedTerm);
  try {
    const response = await fetch(`https://api.fda.gov/drug/label.json?api_key=${OPENFDA_API_KEY}&search=brand_name:${encodedTerm}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenFDA API Failed: ${response.status} ${errorText}`);
    }
    
    try {
      const data = await response.json();
      return new Response(JSON.stringify(data), { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      });
    } catch (parseError) {
      throw new Error(`Failed to parse OpenFDA API response: ${parseError.message}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
