import { useEffect, useState } from "react";
import { UNEB_BRIEFING } from "@/lib/config";

function parts(target: number, now: number) {
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, done: diff <= 0 };
}

export function Countdown({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const p = now == null ? null : parts(UNEB_BRIEFING.getTime(), now);
  const runStart = new Date("2026-09-01T00:00:00+03:00").getTime();
  const runEnd = UNEB_BRIEFING.getTime();
  const progress = now == null ? 0 : Math.min(100, Math.max(0, ((now - runStart) / (runEnd - runStart)) * 100));

  const units = [
    ["Days", p?.days],
    ["Hours", p?.hours],
    ["Mins", p?.mins],
    ["Secs", p?.secs],
  ] as const;

  return (
    <section className={compact ? "rounded-card bg-forest p-4 text-paper" : "overflow-hidden rounded-card bg-forest text-paper shadow-lg"}>
      <div className={compact ? "" : "grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.2fr_1fr] lg:items-center"}>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-gold">S.6 · UACE 2026</p>
          <h2 className="mt-1 font-display text-3xl text-balance sm:text-4xl">UNEB briefing</h2>
          <p className="mt-2 text-paper/85">6 November 2026 · stay ready</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper/15" aria-hidden>
            <div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-gold-soft">The final run-in is open. Steady work beats a late rush.</p>
        </div>
        <div className="grid grid-cols-4 gap-2" aria-live="polite">
          {units.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-paper/10 px-1 py-3 text-center ring-1 ring-gold/40">
              <b className="block font-display text-3xl tabular-nums text-gold sm:text-4xl">
                {value == null ? "—" : String(value).padStart(2, "0")}
              </b>
              <small className="text-xs tracking-wide text-paper/80 uppercase">{label}</small>
            </div>
          ))}
        </div>
      </div>
      {p?.done ? (
        <p className="bg-gold px-5 py-3 text-center font-semibold text-ink">Briefing day is here. Walk in prepared.</p>
      ) : null}
    </section>
  );
}
