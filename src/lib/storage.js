const STORAGE_KEY = 'debrief_data';

const DEFAULT_DATA = { meetings: [] };

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA, meetings: [] };
    const data = JSON.parse(raw);
    return { ...DEFAULT_DATA, ...data };
  } catch {
    return { ...DEFAULT_DATA, meetings: [] };
  }
}

export function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addMeeting(meeting) {
  const data = load();
  data.meetings.push(meeting);
  save(data);
  return data;
}

export function updateMeeting(id, updates) {
  const data = load();
  const idx = data.meetings.findIndex((m) => m.id === id);
  if (idx === -1) return data;
  data.meetings[idx] = { ...data.meetings[idx], ...updates };
  save(data);
  return data;
}

export function getMeeting(id) {
  const data = load();
  return data.meetings.find((m) => m.id === id) || null;
}
