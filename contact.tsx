import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { PageIntro } from "@/components/shell";
import { GACEB_CONFIG, WHATSAPP_URL } from "@/lib/config";
import { fmtNum } from "@/lib/format";
import { useGaceb } from "@/lib/gaceb";
import { getDb } from "@/lib/supabase";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact | GACEB Scholar" }] }),
  component: ContactPage,
});

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.4a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2zm5.76 14.05c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.12.1-1.81-.11-.41-.13-.95-.31-1.64-.61-2.88-1.25-4.76-4.15-4.9-4.35-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.24-.26.64-.38 1.02-.38.12 0 .23 0 .33.01.3.01.45.03.65.5.24.58.82 2 .89 2.15.07.14.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.41.48-.14.13-.28.28-.12.54.16.26.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.26.13.42.11.57-.07.16-.19.66-.77.84-1.03.18-.26.35-.22.58-.13.24.1 1.5.71 1.76.84.26.13.43.19.49.3.07.1.07.61-.17 1.29z"
      />
    </svg>
  );
}

function Glyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
      <path fill="currentColor" d={d} />
    </svg>
  );
}

const SOON = [
  { name: "Facebook", d: "M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" },
  { name: "Instagram", d: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm5.2-.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1zM12 9.2A2.8 2.8 0 1 1 9.2 12 2.8 2.8 0 0 1 12 9.2z" },
  { name: "X", d: "M4 4h3.4l4.1 5.7L16.2 4H20l-6.3 7.6L20.2 20h-3.4l-4.5-6.2L7.6 20H4l6.6-8z" },
  { name: "YouTube", d: "M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3z" },
  { name: "Telegram", d: "M21.5 4.5 2.8 11.2c-1.3.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.1.9.8.9.5 0 .7-.2 1-.5l2.7-2.6 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.2-.4-1.8-1.8-1.2z" },
];

function ContactPage() {
  const { notify } = useGaceb();
  const [status, setStatus] = useState("");

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const db = getDb();
    const fd = new FormData(e.currentTarget);
    if (!db) {
      setStatus("The form is not connected yet. Use WhatsApp or email.");
      return;
    }
    setStatus("Sending…");
    const r = await db.from("contact_messages").insert({
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      message: String(fd.get("message") || "").trim(),
    });
    if (r.error) setStatus(r.error.message);
    else {
      setStatus("Sent. Thank you.");
      e.currentTarget.reset();
    }
  }

  return (
    <div className="grid gap-8">
      <PageIntro kicker="Contact" title="Reach GACEB" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <a href={WHATSAPP_URL} className="grid justify-items-center gap-2 rounded-card bg-forest p-4 text-paper" aria-label="WhatsApp" target="_blank" rel="noreferrer">
          <WhatsAppIcon />
          <span className="sr-only">WhatsApp</span>
        </a>
        <a href="tel:+256743766451" className="grid justify-items-center gap-2 rounded-card border border-line bg-paper p-4 text-forest" aria-label="Call">
          <Phone className="size-7" />
        </a>
        <a href={`mailto:${GACEB_CONFIG.SUPPORT_EMAIL}`} className="grid justify-items-center gap-2 rounded-card border border-line bg-paper p-4 text-burgundy" aria-label="Email">
          <Mail className="size-7" />
        </a>
        {SOON.map((p) => (
          <button
            key={p.name}
            type="button"
            className="grid justify-items-center gap-2 rounded-card border border-dashed border-line bg-paper p-4 text-muted"
            aria-label={`${p.name}, link coming`}
            onClick={() => notify(`${p.name} link is coming.`)}
          >
            <Glyph d={p.d} />
            <span className="text-xs font-medium">{p.name}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-muted tabular-nums">
        {fmtNum("0743766451")} · {fmtNum("0783165623")}
      </p>
      <form className="mx-auto grid w-full max-w-lg gap-3 rounded-card border border-line bg-paper p-5" onSubmit={send}>
        <label className="grid gap-1 text-sm font-medium">Name<input className="field" name="name" required maxLength={100} /></label>
        <label className="grid gap-1 text-sm font-medium">Email<input className="field" name="email" type="email" required /></label>
        <label className="grid gap-1 text-sm font-medium">Message<textarea className="field min-h-32" name="message" required maxLength={3000} /></label>
        <button className="btn btn-primary">Send</button>
        <p className="text-sm text-muted" role="status">{status}</p>
        <p className="text-xs text-muted">Never send a password or Mobile Money PIN.</p>
      </form>
    </div>
  );
}
