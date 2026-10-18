import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageIntro } from "@/components/shell";
import { assistantReply } from "@/lib/assistant";
import { useGaceb } from "@/lib/gaceb";
import { getDb } from "@/lib/supabase";

type Msg = { role: "user" | "bot"; text: string };

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "Gauge | GACEB Scholar" }] }),
  component: AssistantPage,
});

const PROMPTS = [
  "Help me make a revision timetable",
  "How do I remember what I read?",
  "How should I answer past papers?",
  "Help me understand a difficult topic",
];

async function ask(history: { role: string; content: string }[], text: string, signedIn: boolean) {
  await new Promise((r) => setTimeout(r, 400));
  if (!signedIn) return assistantReply(text) + " Log in if you want the connected Gauge chat.";
  const db = getDb();
  if (!db) return assistantReply(text);
  const next = [...history, { role: "user", content: text }].slice(-8);
  try {
    const r = await db.functions.invoke("gauge-assistant", { body: { messages: next } });
    const reply = (r.data as { reply?: string } | null)?.reply;
    if (reply) return reply;
    return assistantReply(text);
  } catch {
    return assistantReply(text);
  }
}

function AssistantPage() {
  const { session } = useGaceb();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hello. Tell me your class, subject and topic. I can offer study strategies and help you plan revision." },
  ]);
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setDraft("");
    setBusy(true);
    const reply = await ask(history, t, Boolean(session));
    setHistory((h) => [...h, { role: "user", content: t }, { role: "assistant", content: reply }].slice(-8));
    setMessages((m) => [...m, { role: "bot", text: reply }]);
    setBusy(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <PageIntro kicker="Your study companion" title="Gauge" lede="Ask for a study plan, a way to remember, or how to face a past paper." />
        <div className="grid gap-2">
          {PROMPTS.map((p) => (
            <button key={p} type="button" className="rounded-2xl border border-line bg-paper px-4 py-3 text-left font-medium hover:border-forest" onClick={() => setDraft(p)}>
              {p}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">Guidance works on this device. A signed-in chat uses Gauge when that service is connected.</p>
      </div>
      <section className="flex min-h-[28rem] flex-col rounded-card border border-line bg-paper">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <p key={i} className={`max-w-[90%] rounded-2xl px-4 py-3 text-pretty leading-relaxed ${m.role === "user" ? "ml-auto bg-forest text-paper" : "bg-cream text-ink"}`}>
              {m.text}
            </p>
          ))}
          {busy ? <p className="text-sm text-muted">Gauge is thinking…</p> : null}
        </div>
        <form
          className="flex gap-2 border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask a study question…" required />
          <button className="btn btn-primary">Send</button>
        </form>
        <button
          type="button"
          className="btn btn-outline m-3 mt-0"
          onClick={() => {
            setHistory([]);
            setMessages([{ role: "bot", text: "Chat cleared. What would you like to study?" }]);
          }}
        >
          Clear chat
        </button>
      </section>
    </div>
  );
}
