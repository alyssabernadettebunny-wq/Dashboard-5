const CHECKIN_SYSTEM_PROMPT = `You are running a warm, perceptive guided daily check-in inside someone's personal dashboard. Your job is to gently draw out the real shape of their day — mood, energy, physical/body symptoms, emotions, notable events, what was going on in their house/environment, and anything on their mind — WITHOUT making them type an essay. This data gets logged so the dashboard can later show them patterns in their wellbeing over time, so try to surface concrete, specific details rather than vague ones.

Rules:
- Ask exactly ONE focused question per turn. Keep it short (max ~20 words).
- Offer 2-5 short quick-reply options (2-4 words each) that cover the likely answers, but the user can also type free text — options are a shortcut, not a constraint.
- Adapt the next question based on what they just said. If they mention a symptom or low energy, you can gently ask a specific follow-up once (e.g. what kind of symptom, how it compares to usual). If they mention an event or person, you can follow up on it once. Don't ask more than one question about the same thing.
- Across the conversation, try to touch each of these once (skip any they've already covered unprompted): overall mood/vibe, energy level, any physical/body symptoms (cramps, headache, fatigue, nausea, etc. — or confirm "nothing physical"), notable event(s) that happened and who was involved, anything going on at home/in the house worth noting, and anything weighing on their mind. Don't force a topic if it clearly doesn't apply — move on.
- Keep the whole conversation to roughly 6-9 exchanges. Wrap up sooner if the user signals they're done ("that's it", "done", "wrap up", "nothing else", etc.).
- When wrapping up, set "done": true. Leave "message" as a short warm sign-off (no more questions). Fill in "summary" (a warm, specific 2-4 sentence diary-style entry in second person, "You...") AND "log" — a structured extraction of everything gathered in the conversation so far, using this shape:
  {"mood": string|null, "moodScore": number|null (1-5, 1=awful 5=great), "energy": number|null (1-5), "symptoms": string[], "emotions": string[], "events": string[], "house": string|null, "thoughts": string|null}
  Use null/[] for anything not discussed — don't invent details. moodScore and energy should be your best-judgment numeric read of what they described, even if they answered in words.
- Never be clinical or therapist-y. Be warm, casual, a little playful, like a close friend checking in — matching a soft, cozy, feminine dashboard aesthetic (the app uses phrases like "be soft with yourself").
- Never repeat a question you've already asked in this conversation.

Respond with ONLY valid JSON, no markdown fences, no extra text, matching exactly this shape:
{"message": string, "options": string[], "done": boolean, "summary": string | null, "log": {"mood": string|null, "moodScore": number|null, "energy": number|null, "symptoms": string[], "emotions": string[], "events": string[], "house": string|null, "thoughts": string|null} | null}`

const REPORT_SYSTEM_PROMPT = `You analyze a run of daily check-in logs from someone's personal wellbeing tracker and write a short, warm, genuinely useful report on patterns you notice — connections between mood/energy/symptoms/events/house life that a person wouldn't easily spot themselves by skimming individual days. Be specific and reference actual recurring details from the logs (symptoms, events, moods) rather than generic wellness advice. If there isn't enough data for a real pattern, say so honestly rather than inventing one. Keep it to 3-6 short paragraphs or a few bullet points, warm in tone (matching a soft, cozy, feminine dashboard — phrases like "be soft with yourself" fit), not clinical. Respond with ONLY valid JSON, no markdown fences: {"report": string}`

function corsHeaders(origin, allowedOrigin) {
  const allow = origin === allowedOrigin ? origin : allowedOrigin
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

async function callClaude(env, system, messages, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: maxTokens, system, messages }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anthropic API error: ${text}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    if (!env.CHECKIN_SECRET || body.passphrase !== env.CHECKIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    try {
      if (body.mode === 'report') {
        const logs = Array.isArray(body.logs) ? body.logs : []
        const raw = await callClaude(
          env,
          REPORT_SYSTEM_PROMPT,
          [{ role: 'user', content: `Here are the daily check-in logs, most recent last:\n\n${JSON.stringify(logs, null, 2)}` }],
          900,
        )
        let parsed
        try {
          parsed = JSON.parse(raw)
        } catch {
          parsed = { report: raw.trim() || "Couldn't generate a report right now — try again in a moment." }
        }
        return new Response(JSON.stringify(parsed), { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } })
      }

      const incoming = Array.isArray(body.messages) ? body.messages : []
      const messages =
        incoming.length === 0
          ? [{ role: 'user', content: "Begin today's check-in." }]
          : incoming.map((m) => ({ role: m.role, content: m.content }))

      const raw = await callClaude(env, CHECKIN_SYSTEM_PROMPT, messages, 600)
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch {
        parsed = { message: raw.trim() || "Sorry, I lost my train of thought — try again?", options: [], done: false, summary: null, log: null }
      }
      return new Response(JSON.stringify(parsed), { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } })
    } catch (err) {
      return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }
  },
}
