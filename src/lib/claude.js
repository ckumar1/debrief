const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const API_URL = '/anthropic/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are a meeting transcript analyzer. Given a raw meeting transcript, extract structured data and return ONLY valid JSON (no markdown fences, no explanation, no extra text). The JSON must match this exact shape:

{
  "meta": {
    "title": "string - descriptive meeting title",
    "date": "string - ISO date or best guess from transcript",
    "participants": ["string - names of participants"]
  },
  "summary": "string - 3-5 sentence paragraph covering what was discussed, key outcomes, agreements, and overall tone of the meeting",
  "quickStart": "string - one sentence: the single most important next action from this meeting",
  "tasks": [
    {
      "id": "string - unique short id like T1, T2",
      "priority": "TODAY | TOMORROW | THIS WEEK | UPCOMING | FUTURE",
      "owner": "string - person responsible",
      "title": "string - short task title",
      "detail": "string - additional context",
      "tags": ["string - relevant tags"],
      "done": false
    }
  ],
  "projects": [
    {
      "id": "string - unique short id like P1, P2",
      "emoji": "string - representative emoji",
      "name": "string - project name",
      "status": "IN PROGRESS | PENDING | FUTURE | BLOCKED | DONE",
      "deadline": "string or null",
      "color": "string - hex color for UI",
      "summary": "string - one-line summary",
      "context": "string - broader context from discussion",
      "phases": [
        {
          "phase": "number - phase number",
          "label": "string - phase name",
          "steps": ["string - specific steps"]
        }
      ]
    }
  ],
  "decisions": [
    {
      "title": "string - what was decided",
      "reason": "string - why it was decided"
    }
  ],
  "references": [
    {
      "emoji": "string - representative emoji",
      "label": "string - reference name",
      "desc": "string - brief description",
      "tag": "string - category tag"
    }
  ],
  "architecture": {
    "pattern": "string - architectural pattern discussed, if any",
    "description": "string - description of the architecture",
    "layers": [
      {
        "layer": "string - layer name",
        "desc": "string - layer description"
      }
    ],
    "providers": [
      {
        "name": "string - provider/service name",
        "status": "string - current status",
        "note": "string - relevant notes",
        "color": "string - hex color for UI"
      }
    ]
  }
}

Rules:
- Return ONLY the JSON object, nothing else
- Do not wrap in markdown code fences
- All fields are required; use empty arrays [] or empty strings "" for missing data
- Infer priority and status from context clues in the conversation
- Extract ALL actionable tasks, even implicit ones
- Group related work into projects with phases where applicable`;

function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // noop
  }

  // Try stripping markdown fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // noop
    }
  }

  // Try finding the first { ... } block via regex
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {
      // noop
    }
  }

  throw new Error('Failed to extract valid JSON from Claude response');
}

export async function extractTranscript(rawText) {
  if (!API_KEY) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Extract structured meeting data from this transcript:\n\n${rawText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error('Empty response from Claude API');
  }

  return extractJSON(content);
}
