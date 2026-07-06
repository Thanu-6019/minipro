import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface ProcessOCRRequest {
  image_input?: unknown;
  imagePath?: unknown;
  confidence_threshold?: unknown;
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

  let requestBody: ProcessOCRRequest;
  try {
    requestBody = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const imageInput = requestBody.imageInput || requestBody.imagePath;
  if (!imageInput || typeof imageInput !== 'string' || imageInput.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'image_input is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const TESSERACT_API_URL = Deno.env.get('TESSERACT_API_URL') || 'http://localhost:8000/process_ocr_image';

  try {
    const response = await fetch(TESSERACT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_input: imageInput.trim(),
        confidence_threshold: requestBody.confidence_threshold || 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OCR backend failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        text: '',
        confidence: 0,
        success: false,
        error: message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
