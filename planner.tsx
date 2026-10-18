import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Countdown } from "@/components/countdown";
import { PageIntro } from "@/components/shell";
import { useGaceb } from "@/lib/gaceb";

const KEY = "gaceb-study-planner-v1";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Plan = { day: string; time: string; subject: string; topic: string; duration: string };

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "Study Planner | GACEB Scholar" }] }),
  component: PlannerPage,
});

function readPlans(): Plan[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as Plan[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function PlannerPage() {
  const { notify } = useGaceb();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    setPlans(readPlans());
  }, []);

  function save(next: Plan[]) {
    localStorage.setItem(KEY, JSON.stringify(next));
    setPlans(next);
  }

  const ordered = [...plans].sort(
    (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.time.localeCompare(b.time),
  );

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <PageIntro kicker="This device" title="Study planner" lede="A weekly timetable that stays on this device." />
      <Countdown compact />
      <form
        className="grid gap-3 rounded-card border border-line bg-paper p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const row = Object.fromEntries(fd.entries()) as Plan;
          save([...plans, row]);
          e.currentTarget.reset();
          notify("Study session saved on this device");
        }}
      >
        <label className="grid gap-1 text-sm font-medium">
          Day
          <select className="field" name="day" defaultValue="Monday">
            {DAYS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">Time<input className="field" type="time" name="time" required /></label>
        <label className="grid gap-1 text-sm font-medium">Subject<input className="field" name="subject" required maxLength={80} /></label>
        <label className="grid gap-1 text-sm font-medium">Topic<input className="field" name="topic" required maxLength={120} /></label>
        <label className="grid gap-1 text-sm font-medium">Duration<input className="field" name="duration" placeholder="45 minutes" required maxLength={40} /></label>
        <button className="btn btn-primary">Add session</button>
      </form>
      <div className="grid gap-2">
        {ordered.length === 0 ? <p className="text-muted">No sessions yet. Add your first study session.</p> : null}
        {ordered.map((x, i) => (
          <div key={`${x.day}-${x.time}-${i}`} className="flex items-center justify-between gap-3 rounded-card border border-line bg-paper px-4 py-3">
            <div>
              <b>{x.day} · {x.time}</b>
              <p className="text-sm text-muted">{x.subject} — {x.topic} · {x.duration}</p>
            </div>
            <button
              type="button"
              className="btn btn-outline min-h-10 px-3"
              aria-label="Remove session"
              onClick={() => save(plans.filter((_, idx) => idx !== plans.indexOf(x)))}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      {plans.length ? (
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            if (confirm("Clear all saved study sessions?")) save([]);
          }}
        >
          Clear planner
        </button>
      ) : null}
    </div>
  );
}
