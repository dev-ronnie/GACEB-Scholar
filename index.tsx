import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Library, Megaphone } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { Crest } from "@/components/shell";
import { useGaceb } from "@/lib/gaceb";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Home | GACEB Scholar" }] }),
  component: Home,
});

function Home() {
  const { openAuth, session } = useGaceb();
  return (
    <div className="grid gap-8">
      <section className="grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-gold-deep uppercase">Learn · Grow · Achieve</p>
          <h1 className="mt-2 font-display text-5xl leading-[1.05] text-balance text-ink sm:text-6xl">
            Your learning journey. <span className="text-forest">Your brighter future.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-pretty text-muted">
            Uganda curriculum study resources, revision planning and a community built to help O-Level and A-Level learners rise.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/courses" className="btn btn-primary">Explore courses <ArrowRight className="size-4" /></Link>
            <Link to="/library" className="btn btn-outline">Open PDF library</Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {session ? (
              <Link to="/dashboard" className="btn btn-outline">My dashboard</Link>
            ) : (
              <>
                <button type="button" className="btn btn-primary" onClick={() => openAuth("login")}>Log in</button>
                <button type="button" className="btn btn-outline" onClick={() => openAuth("signup")}>Create account</button>
              </>
            )}
          </div>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm text-forest">
            <li className="rounded-full bg-sage px-3 py-1">O-Level & A-Level</li>
            <li className="rounded-full bg-sage px-3 py-1">Learn anywhere</li>
            <li className="rounded-full bg-sage px-3 py-1">Student-first</li>
          </ul>
        </div>
        <div className="rounded-card bg-forest p-6 text-paper shadow-lg">
          <div className="rounded-2xl bg-paper p-3">
            <Crest className="mx-auto h-48 w-auto sm:h-56" />
          </div>
          <h2 className="mt-4 font-display text-3xl text-balance">Learn today. Build tomorrow.</h2>
          <p className="mt-1 text-paper/80">Small steps. Strong habits. Brighter futures.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-paper/10 p-3"><b>O-Level</b><p className="text-paper/75">Sciences · Humanities</p></div>
            <div className="rounded-2xl bg-paper/10 p-3"><b>A-Level</b><p className="text-paper/75">Sciences · Arts</p></div>
          </div>
        </div>
      </section>

      <Countdown compact />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-card border border-line bg-paper p-5">
          <Library className="size-6 text-forest" />
          <h3 className="mt-3 font-display text-2xl">Study library</h3>
          <p className="mt-1 text-muted">Revision notes, topic guides and past papers.</p>
          <Link to="/library" className="mt-3 inline-flex items-center gap-1 font-semibold text-forest">Browse resources <ArrowRight className="size-4" /></Link>
        </article>
        <article className="rounded-card border border-line bg-paper p-5">
          <CalendarDays className="size-6 text-gold-deep" />
          <h3 className="mt-3 font-display text-2xl">Live events</h3>
          <p className="mt-1 text-muted">The honour calendar and the UNEB briefing countdown.</p>
          <Link to="/events" className="mt-3 inline-flex items-center gap-1 font-semibold text-forest">Open live events <ArrowRight className="size-4" /></Link>
        </article>
        <article className="rounded-card border border-line bg-paper p-5">
          <Megaphone className="size-6 text-burgundy" />
          <h3 className="mt-3 font-display text-2xl">Announcements</h3>
          <p className="mt-1 text-muted">Notices with words and photographs, in one board.</p>
          <Link to="/announcements" className="mt-3 inline-flex items-center gap-1 font-semibold text-forest">Read the board <ArrowRight className="size-4" /></Link>
        </article>
      </section>

      <section className="grid items-center gap-4 rounded-card bg-forest-deep p-6 text-paper sm:grid-cols-[1fr_auto] sm:p-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Your study companion</p>
          <h2 className="mt-1 font-display text-3xl">Meet Gauge</h2>
          <p className="mt-2 max-w-xl text-paper/80">Study strategies, revision ideas and a calm way through a hard topic.</p>
          <Link to="/assistant" className="btn btn-gold mt-4">Open Gauge</Link>
        </div>
        <Crest className="hidden h-28 w-auto sm:block" />
      </section>
    </div>
  );
}
