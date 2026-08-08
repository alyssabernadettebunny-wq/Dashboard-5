const CHECKIN_SYSTEM_PROMPT = `You are running a warm, perceptive guided daily check-in inside someone's personal dashboard. Your job is to gently draw out the real shape of their day — mood, energy, physical/body symptoms, emotions, notable events, what was going on in their house/environment, and anything on their mind — WITHOUT making them type an essay. This data gets logged so the dashboard can later show them patterns in their wellbeing over time, so try to surface concrete, specific details rather than vague ones.

Rules:
- Ask exactly ONE focused question per turn. Keep it short (max ~20 words).
- Offer 2-5 short quick-reply options (2-4 words each) that cover the likely answers, but the user can also type free text — options are a shortcut, not a constraint.
- Adapt the next question based on what they just said. If they mention a symptom or low energy, you can gently ask a specific follow-up once (e.g. what kind of symptom, how it compares to usual). If they mention an event or person, you can follow up on it once. Don't ask more than one question about the same thing.
- Across the conversation, try to touch each of these once (skip any they've already covered unprompted): overall mood/vibe, energy level, any physical/body symptoms (cramps, headache, fatigue, nausea, etc. — or confirm "nothing physical"), notable event(s) that happened and who was involved, anything going on at home/in the house worth noting, and anything weighing on their mind. Don't force a topic if it clearly doesn't apply — move on.
- Keep the whole conversation to roughly 6-9 exchanges. Wrap up sooner if the user signals they're done ("that's it", "done", "wrap up", "nothing else", etc.).
- When wrapping up, set "done": true. Leave "message" as a short warm sign-off (no more questions). Fill in "summary" (a warm, specific 2-4 sentence diary-style entry in second person, "You...") AND "log" — a structured extraction of everything gathered in the conversation so far. Use null/[] for anything not discussed — don't invent details. moodScore and energy should be your best-judgment numeric read of what they described, even if they answered in words.
- When NOT done yet, still call the tool but leave summary and log as null.
- Never be clinical or therapist-y. Be warm, casual, a little playful, like a close friend checking in — matching a soft, cozy, feminine dashboard aesthetic (the app uses phrases like "be soft with yourself").
- Never repeat a question you've already asked in this conversation.

Always respond by calling the "respond" tool — never respond in plain text.`

const REPORT_SYSTEM_PROMPT = `You analyze a run of daily check-in logs from someone's personal wellbeing tracker and write a short, warm, genuinely useful report on patterns you notice — connections between mood/energy/symptoms/events/house life that a person wouldn't easily spot themselves by skimming individual days. Be specific and reference actual recurring details from the logs (symptoms, events, moods) rather than generic wellness advice. If there isn't enough data for a real pattern, say so honestly rather than inventing one. Keep it to 3-6 short paragraphs or a few bullet points, warm in tone (matching a soft, cozy, feminine dashboard — phrases like "be soft with yourself" fit), not clinical. Always respond by calling the "respond" tool — never respond in plain text.`

const CHECKIN_TOOL = {
  name: 'respond',
  description: "Respond to the user in the guided daily check-in conversation.",
  input_schema: {
    type: 'object',
    properties: {
      message: { type: 'string', description: 'The question or sign-off to show the user.' },
      options: { type: 'array', items: { type: 'string' }, description: 'Short quick-reply choices, 0-5 items.' },
      done: { type: 'boolean', description: 'True once the check-in is wrapping up.' },
      summary: { type: ['string', 'null'], description: 'Diary-style summary, only when done is true.' },
      log: {
        type: ['object', 'null'],
        description: 'Structured extraction of the conversation, only when done is true.',
        properties: {
          mood: { type: ['string', 'null'] },
          moodScore: { type: ['number', 'null'] },
          energy: { type: ['number', 'null'] },
          symptoms: { type: 'array', items: { type: 'string' } },
          emotions: { type: 'array', items: { type: 'string' } },
          events: { type: 'array', items: { type: 'string' } },
          house: { type: ['string', 'null'] },
          thoughts: { type: ['string', 'null'] },
        },
        required: ['mood', 'moodScore', 'energy', 'symptoms', 'emotions', 'events', 'house', 'thoughts'],
      },
    },
    required: ['message', 'options', 'done', 'summary', 'log'],
  },
}

const REPORT_TOOL = {
  name: 'respond',
  description: 'Provide the wellbeing pattern report.',
  input_schema: {
    type: 'object',
    properties: { report: { type: 'string' } },
    required: ['report'],
  },
}

function corsHeaders(origin, allowedOrigin) {
  const allow = origin === allowedOrigin ? origin : allowedOrigin
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

async function callClaudeTool(env, system, messages, tool, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: maxTokens,
      system,
      messages,
      tools: [tool],
      tool_choice: { type: 'tool', name: tool.name },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anthropic API error: ${text}`)
  }
  const data = await res.json()
  const toolUse = data.content?.find((c) => c.type === 'tool_use')
  if (!toolUse) throw new Error('Model did not return a tool call')
  return toolUse.input
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
        const result = await callClaudeTool(
          env,
          REPORT_SYSTEM_PROMPT,
          [{ role: 'user', content: `Here are the daily check-in logs, most recent last:\n\n${JSON.stringify(logs, null, 2)}` }],
          REPORT_TOOL,
          900,
        )
        return new Response(JSON.stringify(result), { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } })
      }

      const incoming = Array.isArray(body.messages) ? body.messages : []
      const messages =
        incoming.length === 0
          ? [{ role: 'user', content: "Begin today's check-in." }]
          : incoming.map((m) => ({ role: m.role, content: m.content }))

      const result = await callClaudeTool(env, CHECKIN_SYSTEM_PROMPT, messages, CHECKIN_TOOL, 700)
      return new Response(JSON.stringify(result), { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } })
    } catch (err) {
      return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }
  },
}
