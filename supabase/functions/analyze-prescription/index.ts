import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface AnalyzePrescriptionRequest {
  rawText?: unknown;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
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

  if (str.length > 10000) {
    throw new Error('Input too large (max 10000 characters)');
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

  const GROK_API_KEY = Deno.env.get('GROK_API_KEY');
  
  if (!GROK_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let requestBody: AnalyzePrescriptionRequest;
  try {
    requestBody = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let sanitizedRawText: string;
  try {
    sanitizedRawText = sanitizeInput(requestBody.rawText);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const SYSTEM_PROMPT = `You are a medical prescription parser. Extract all medications from the prescription text.

Return ONLY valid JSON with this structure:
{
  "medications": [
    {
      "medicineName": "string - full medicine name",
      "dosage": "string - e.g. 500mg, 10ml",
      "frequency": "string - e.g. twice daily, every 8 hours, once a day",
      "beforeAfterMeal": "string - one of: before, after, with, none",
      "duration": "string - e.g. 7 days, 2 weeks, ongoing"
    }
  ]
}

Rules:
- Extract EVERY medication mentioned
- Use exact medicine names as written on the prescription
- If dosage is not specified, use "not specified"
- If frequency is not specified, use "as directed"
- If beforeAfterMeal is not specified, use "none"
- If duration is not specified, use "not specified"
- Return ONLY the JSON, no explanation or markdown`;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        model: "grok-beta",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: sanitizedRawText }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API Failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let parsed: { medications?: {
      medicineName: string;
      dosage: string;
      frequency: string;
      beforeAfterMeal: string;
      duration: string;
    }[] };

    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`Failed to parse Grok response as JSON: ${content.substring(0, 200)}`);
    }

    const medications = (parsed.medications || []).map((med) => ({
      medicineName: med.medicineName || 'Unknown',
      dosage: med.dosage || 'not specified',
      frequency: med.frequency || 'as directed',
      beforeAfterMeal: med.beforeAfterMeal || 'none',
      duration: med.duration || 'not specified',
    }));

    return new Response(JSON.stringify({ medications }), { 
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      } 
    });
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
