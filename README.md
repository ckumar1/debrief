# Debrief

A meeting transcript analyzer that uses Claude AI to extract structured insights from your meetings. Import transcripts via paste or Google Drive, and get organized tasks, projects, decisions, references, architecture notes, and an interactive mind map.

## Features

- **Transcript Import** -- Paste text directly or import from Google Drive (with OAuth + Picker API)
- **AI-Powered Extraction** -- Claude API analyzes transcripts and extracts structured data (tasks, projects, decisions, architecture, references)
- **Meeting Summary** -- Auto-generated 3-5 sentence summary with a highlighted "next action"
- **Tasks Tab** -- Actionable items with priority levels (Today/Tomorrow/This Week/Upcoming/Future), assignee/owner filter, tags, completion tracking, and expandable details
- **Projects Tab** -- Extracted projects with status, deadlines, phased plans, and color-coded cards
- **Architecture Tab** -- Architectural patterns, layered descriptions, and provider/service status
- **Decisions Tab** -- Key decisions captured with rationale
- **References Tab** -- Links, tools, and resources mentioned in the meeting
- **Mind Map** -- Interactive force-directed SVG graph connecting meeting topics, participants, tasks, and projects
- **Participant Avatars** -- Color-coded initials badges for each meeting participant
- **Re-process** -- Re-run Claude extraction on any previously imported transcript
- **Persistent Storage** -- Meeting data saved to localStorage across sessions

## Tech Stack

- React 19 + Vite 8
- Claude API (Sonnet) for transcript analysis
- Google Drive API + Picker API for document import
- No external UI framework -- custom inline styles with IBM Plex Mono typography

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment file and add your keys:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

| Variable | Required | Description |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Yes | Your Claude API key (`sk-ant-...`) |
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth client ID (for Drive import) |
| `VITE_GOOGLE_API_KEY` | No | Google API key (for Drive import) |

For Google Drive import, create credentials in the [Google Cloud Console](https://console.cloud.google.com/) with the **Drive API** and **Picker API** enabled.

4. Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Usage

1. **Import a transcript** -- Click "Paste" to paste raw text, or "Google Drive" to pick a document
2. **Wait for extraction** -- Claude processes the transcript and extracts structured data
3. **Browse results** -- Navigate tabs (Tasks, Projects, Architecture, Decisions, References, Mind Map)
4. **Track tasks** -- Check off completed items, filter by priority or assignee
5. **Re-process** -- Hit the re-process button to re-run extraction if needed

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Architecture

The Vite dev server proxies `/anthropic/*` requests to `https://api.anthropic.com` to avoid CORS issues with direct browser API calls. In production, you'll need your own proxy or backend to forward Claude API requests.
