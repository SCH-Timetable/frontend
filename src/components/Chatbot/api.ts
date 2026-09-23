// Single adapter: the floating ScheduleAI Assistant talks only to this module.
// Backend-first: every call goes to the real FastAPI backend (Gemini-backed).
// The assistant keeps its own offline canned replies, so no mock engine needed.
// frontend/src/components/Chatbot/api.ts

export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function fetchJSON(url: string, options?: RequestInit) {
  const r = await fetch(url, options);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// ── Primary: backend chat (NLU + facts + Gemini answer in one call) ──────────
// timetableJson: optional live timetable snapshot (formatted JSON text) that the
// backend forwards as core context to Gemini.
export async function sendChat(message: string, timetableJson?: string) {
  const payload: Record<string, string> = { message };
  if (timetableJson) payload.timetable_json = timetableJson;
  const data = await fetchJSON(`${BACKEND_URL}/api/chatbot/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data; // {intent, entities, answer_ar, facts, gemini_used}
}
