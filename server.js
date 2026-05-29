// ═══════════════════════════════════════════════════════
//  ResumeATS Pro — Backend Server (server.js)
//  Node.js + Express · Proxies Anthropic API securely
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security headers ──
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "fonts.gstatic.com"],
      fontSrc:    ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
      connectSrc: ["'self'"],
      imgSrc:     ["'self'", "data:"],
    }
  }
}));

// ── CORS (update origin for production) ──
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET','POST'],
}));

app.use(express.json({ limit: '50kb' }));

// ── Serve static files (index.html) ──
app.use(express.static(path.join(__dirname, '.')));

// ── Rate limiter: 10 checks per IP per hour (free tier enforcement) ──
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a while or upgrade to Pro.' }
});

// ── POST /api/analyze — Main endpoint ──
app.post('/api/analyze', apiLimiter, async (req, res) => {
  const { resume, job } = req.body;

  // Validate input
  if (!resume || typeof resume !== 'string' || resume.trim().length < 50) {
    return res.status(400).json({ error: 'Please provide a valid resume (minimum 50 characters).' });
  }
  if (resume.length > 15000) {
    return res.status(400).json({ error: 'Resume is too long. Please trim to under 15,000 characters.' });
  }

  const jobPart = (job && job.trim().length > 10)
    ? `\n\nJOB DESCRIPTION TO MATCH:\n${job.trim()}`
    : '\n\n(No job description — perform a general ATS analysis based on best practices.)';

  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyst with deep knowledge of Workday, Greenhouse, Taleo, and Lever. Analyze the resume below and return ONLY valid JSON — no markdown, no backticks, no preamble.

RESUME:
${resume.trim()}${jobPart}

Return EXACTLY this JSON structure:
{
  "score": <integer 0-100 overall ATS compatibility>,
  "grade": <"Excellent" if 80+, "Good" if 60-79, "Needs Work" if below 60>,
  "gradeClass": <"grade-great" if 80+, "grade-good" if 60-79, "grade-poor" if below 60>,
  "scoreColor": <"#10b981" if 80+, "#f59e0b" if 60-79, "#ef4444" if below 60>,
  "ringColor": <same as scoreColor>,
  "summary": <one sentence summary of the resume ATS readiness — be honest and specific>,
  "metrics": [
    { "name": "Keyword Match",    "icon": "🔑", "score": <0-100>, "color": "#3b82f6" },
    { "name": "Format & Structure","icon": "📋","score": <0-100>, "color": "#8b5cf6" },
    { "name": "Achievements",     "icon": "🏆", "score": <0-100>, "color": "#f59e0b" },
    { "name": "Contact Info",     "icon": "📞", "score": <0-100>, "color": "#10b981" }
  ],
  "foundKeywords":   [<8-12 important skills/keywords present in resume as short strings>],
  "missingKeywords": [<5-8 important missing keywords as short strings>],
  "strengths":       [<4-6 specific strengths as complete sentences>],
  "suggestions": [
    { "text": "<specific, actionable suggestion>", "priority": <"critical"|"warn"|"ok"> }
  ]
}

Suggestions: 6-8 items. "critical" = must fix now, "warn" = should fix, "ok" = minor polish.
Be honest. If the resume is weak, say so clearly. If it's strong, acknowledge that.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(502).json({ error: 'AI service error. Please try again in a moment.' });
    }

    const data     = await response.json();
    const rawText  = data.content.map(b => b.text || '').join('');
    const cleaned  = rawText.replace(/```json|```/g, '').trim();
    const parsed   = JSON.parse(cleaned);

    res.json(parsed);

  } catch (err) {
    console.error('Server error:', err.message);

    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned unexpected response. Please try again.' });
    }
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── Health check endpoint ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Fallback: serve index.html for all other routes ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start server ──
app.listen(PORT, () => {
  console.log(`\n✅  ResumeATS Pro server running at http://localhost:${PORT}`);
  console.log(`📄  Open your browser and go to: http://localhost:${PORT}\n`);
});
