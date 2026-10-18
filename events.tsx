import { createFileRoute } from "@tanstack/react-router";
import { Award, Moon, Plus, ScrollText, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Countdown } from "@/components/countdown";
import { HonourCalendar } from "@/components/honour-calendar";
import { PageIntro } from "@/components/shell";
import {
  fetchSharedEvents,
  loadDeviceEvents,
  mergeEvents,
  publishSharedEvent,
  removeDeviceEvent,
  saveDeviceEvent,
  deleteSharedEvent,
  type CalEvent,
} from "@/lib/board";
import { prettyDate } from "@/lib/format";
import { useGaceb } from "@/lib/gaceb";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Live Events | GACEB Scholar" }] }),
  component: EventsPage,
});

function EventsPage() {
  const { isAdmin, session, notify } = useGaceb();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selected, setSelected] = useState("2026-11-06");
  const [openForm, setOpenForm] = useState(false);

  async function reload() {
    const shared = await fetchSharedEvents();
    setEvents(mergeEvents(shared, loadDeviceEvents()));
  }

  useEffect(() => {
    setEvents(mergeEvents([], loadDeviceEvents()));
    void reload();
  }, []);

  const dayEvents = events.filter((e) => e.eventDate === selected);
  const upcoming = events.slice(0, 8);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const row: CalEvent = {
      id: crypto.randomUUID(),
      title: String(fd.get("title") || "").trim(),
      eventDate: String(fd.get("date") || selected),
      description: String(fd.get("description") || "").trim(),
      source: "device",
    };
    if (!row.title) return;
    if (isAdmin && session) {
      const pub = await publishSharedEvent({ ...row, source: "shared" }, session.user.id);
      if (pub.ok) {
        notify("Event published for everyone.");
        await reload();
        setOpenForm(false);
        return;
      }
      notify("Saved on this device. Shared calendar is not ready yet.");
    } else {
      notify("Saved on this device.");
    }
    saveDeviceEvent(row);
    setEvents(mergeEvents(events.filter((x) => x.source !== "device"), loadDeviceEvents()));
    setSelected(row.eventDate);
    setOpenForm(false);
    e.currentTarget.reset();
  }

  async function remove(ev: CalEvent) {
    if (ev.source === "official") return;
    if (ev.source === "shared") {
      const r = await deleteSharedEvent(ev.id);
      if (!r.ok) {
        notify(r.message);
        return;
      }
    } else removeDeviceEvent(ev.id);
    await reload();
  }

  return (
    <div className="grid gap-6">
      <PageIntro
        kicker="Live events"
        title="The road to briefing"
        lede="A colour calendar for the season, and a live count to UNEB briefing on 6 November 2026."
      />
      <Countdown />
      <ul className="grid gap-3 sm:grid-cols-3">
        <li className="flex items-start gap-3 rounded-card border border-line bg-paper p-4">
          <ScrollText className="mt-0.5 size-5 text-forest" />
          <div><b>Documents in one place</b><p className="text-sm text-muted">Index, photos and the school stamp before the morning.</p></div>
        </li>
        <li className="flex items-start gap-3 rounded-card border border-line bg-gold-soft p-4">
          <Award className="mt-0.5 size-5 text-gold-deep" />
          <div><b>One paper, fully marked</b><p className="text-sm text-muted">A finished paper beats a pile of unread notes.</p></div>
        </li>
        <li className="flex items-start gap-3 rounded-card border border-line bg-sage p-4">
          <Moon className="mt-0.5 size-5 text-forest" />
          <div><b>Rest is revision</b><p className="text-sm text-muted">Sleep keeps what you studied yesterday.</p></div>
        </li>
      </ul>
      <HonourCalendar events={events} selected={selected} onSelect={setSelected} />
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-card border border-line bg-paper p-5">
          <h2 className="font-display text-2xl">{prettyDate(selected)}</h2>
          {dayEvents.length === 0 ? <p className="mt-2 text-muted">Nothing marked. Add a study mark if you want this day on your calendar.</p> : null}
          <ul className="mt-3 grid gap-3">
            {dayEvents.map((ev) => (
              <li key={ev.id} className="rounded-2xl bg-cream p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <b>{ev.title}</b>
                    <p className="text-sm text-muted">{ev.description}</p>
                    <p className="mt-1 text-xs tracking-wide text-gold-deep uppercase">{ev.source === "device" ? "On this device" : ev.source === "official" ? "GACEB" : "Shared"}</p>
                  </div>
                  {ev.source !== "official" && (ev.source === "device" || isAdmin) ? (
                    <button type="button" className="btn btn-outline min-h-10 px-3" aria-label="Remove event" onClick={() => remove(ev)}>
                      <Trash2 className="size-4" />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-primary mt-4" onClick={() => setOpenForm((v) => !v)}>
            <Plus className="size-4" /> Add a date
          </button>
          {openForm ? (
            <form className="mt-4 grid gap-3" onSubmit={add}>
              <label className="grid gap-1 text-sm font-medium">Title<input className="field" name="title" required maxLength={80} /></label>
              <label className="grid gap-1 text-sm font-medium">Date<input className="field" type="date" name="date" defaultValue={selected} required /></label>
              <label className="grid gap-1 text-sm font-medium">Note<textarea className="field min-h-24" name="description" maxLength={300} /></label>
              <button className="btn btn-gold">Save date</button>
              <p className="text-sm text-muted">{isAdmin ? "As admin, this is published for every learner once the calendar table is in place." : "Saved on this device until an admin publishes it to the shared calendar."}</p>
            </form>
          ) : null}
        </article>
        <article className="rounded-card border border-line bg-paper p-5">
          <h2 className="font-display text-2xl">Coming up</h2>
          <ul className="mt-3 grid gap-2">
            {upcoming.map((ev) => (
              <li key={ev.id}>
                <button type="button" className="flex w-full items-center justify-between gap-3 rounded-2xl px-2 py-3 text-left hover:bg-sage" onClick={() => setSelected(ev.eventDate)}>
                  <span>
                    <b className="block">{ev.title}</b>
                    <small className="text-muted">{prettyDate(ev.eventDate)}</small>
                  </span>
                  {ev.eventDate === "2026-11-06" ? <span className="rounded-full bg-gold px-2 py-1 text-xs font-bold text-ink">UNEB</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
