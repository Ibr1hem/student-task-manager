/**
 * Vercel & Express compatible serverless handler for AI Task Breakdown
 * Uses OpenRouter API with model: openai/gpt-5-mini
 * Secures OPENROUTER_API_KEY server-side and applies rate limiting & validation
 */

// Simple in-memory rate limiter per IP
interface RateLimitRecord {
  count: number;
  firstRequestTime: number;
  lastRequestTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 12;
const MIN_COOLDOWN_MS = 1500; // 1.5 seconds between consecutive requests

// Clean up stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.firstRequestTime > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, {
      count: 1,
      firstRequestTime: now,
      lastRequestTime: now,
    });
    return { allowed: true };
  }

  // Cooldown check (prevent rapid button spam)
  if (now - record.lastRequestTime < MIN_COOLDOWN_MS) {
    return {
      allowed: false,
      message: 'Please wait a couple seconds between breakdown requests.',
    };
  }

  // Window reset
  if (now - record.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, {
      count: 1,
      firstRequestTime: now,
      lastRequestTime: now,
    });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      message: 'Rate limit reached (max requests per minute). Please wait a moment before trying again.',
    };
  }

  record.count += 1;
  record.lastRequestTime = now;
  return { allowed: true };
}

export default async function handler(req: any, res: any) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // 1. Rate limiting & Abuse protection
  const clientIp = getClientIp(req);
  const rateLimitResult = checkRateLimit(clientIp);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: rateLimitResult.message });
  }

  // 2. Validate input payload
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const { title, subject, description } = body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const cleanTitle = title.trim().slice(0, 200);
  const cleanSubject = typeof subject === 'string' ? subject.trim().slice(0, 100) : '';
  const cleanDescription = typeof description === 'string' ? description.trim().slice(0, 1000) : '';

  // 3. Verify Server-Side API Key
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'OpenRouter API key is not configured on the server. Please add OPENROUTER_API_KEY to your environment variables.',
      missingKey: true,
    });
  }

  // 4. Construct System & User Prompt for OpenRouter (model: openai/gpt-5-mini)
  const systemPrompt = `You are a practical university academic study assistant.
Break down the student's task or assignment into 3 to 6 practical, sequential study steps.
Guidelines:
1. Provide between 3 and 6 steps (never fewer than 3, never more than 6).
2. Each step should be concise (1-2 sentences), actionable, and direct.
3. Language: If the task title, subject, or description is written in Arabic, provide the steps in Arabic. If written in English, provide the steps in English.
4. Output format: Return a JSON object with a "steps" key containing the array of 3 to 6 strings.`;

  const userContent = `Course/Subject: ${cleanSubject || 'General Coursework'}
Task Title: ${cleanTitle}
Description/Notes: ${cleanDescription || 'None provided'}

Break this down into 3 to 6 practical sequential steps.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const response = await fetch(openRouterUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://student-task-manager.app',
        'X-Title': 'Student Task Manager',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 600,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('OpenRouter API returned error status:', response.status, errText);
      return res.status(502).json({
        error: `AI service error (${response.status}). Please try again shortly.`,
      });
    }

    const data: any = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent || typeof rawContent !== 'string') {
      return res.status(502).json({
        error: 'AI service returned an empty response. Please try again.',
      });
    }

    // 5. Clean & Validate AI response
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // If parsing fails, try to extract object or array using regex
      const objMatch = cleaned.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try {
          parsed = JSON.parse(objMatch[0]);
        } catch {
          parsed = null;
        }
      }
    }

    // Extract steps list from either { steps: [...] } or direct [...]
    let rawStepsArray: any[] = [];
    if (parsed && Array.isArray(parsed.steps)) {
      rawStepsArray = parsed.steps;
    } else if (Array.isArray(parsed)) {
      rawStepsArray = parsed;
    } else if (parsed && typeof parsed === 'object') {
      // Look for any array value in the object
      const possibleArray = Object.values(parsed).find((val) => Array.isArray(val));
      if (possibleArray && Array.isArray(possibleArray)) {
        rawStepsArray = possibleArray;
      }
    }

    if (!rawStepsArray || rawStepsArray.length === 0) {
      return res.status(502).json({
        error: 'AI response was not in the expected list format. Please try again.',
      });
    }

    // Filter and sanitize string steps
    const validSteps = rawStepsArray
      .map((item: any) => (typeof item === 'string' ? item.trim() : ''))
      .filter((text: string) => text.length > 0)
      // Remove any leading numbers or dashes like "1. " or "- "
      .map((text: string) => text.replace(/^(\d+[\.\)]\s*|[-*•]\s*)/, '').trim());

    if (validSteps.length === 0) {
      return res.status(502).json({
        error: 'Could not generate valid study steps. Please try again.',
      });
    }

    // Ensure 3 to 6 steps
    let finalSteps = validSteps;
    if (finalSteps.length > 6) {
      finalSteps = finalSteps.slice(0, 6);
    }

    return res.status(200).json({
      steps: finalSteps,
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'AI request timed out. Please check your network and try again.',
      });
    }
    console.error('Error during AI breakdown request:', error);
    return res.status(500).json({
      error: 'An internal error occurred while communicating with the AI service.',
    });
  }
}
