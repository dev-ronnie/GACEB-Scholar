import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Feather, Sunrise } from "lucide-react";
import { PageIntro } from "@/components/shell";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About | GACEB Scholar" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="grid gap-6">
      <PageIntro
        kicker="Our story"
        title="Learning with purpose"
        lede="GACEB began in 2025, from a simple belief: a prepared student can open a door that looked shut."
      />
      <section className="grid gap-3">
        {[
          ["01 · Opportunity", "Make useful study materials easier to find.", Compass],
          ["02 · Community", "Share knowledge carefully and help the person beside you.", Feather],
          ["03 · Growth", "Celebrate effort, not only the final mark.", Sunrise],
        ].map(([title, text, Icon]) => {
          const Glyph = Icon as typeof Compass;
          return (
            <article key={String(title)} className="flex gap-4 rounded-card border border-line bg-paper p-5">
              <Glyph className="mt-1 size-5 shrink-0 text-forest" />
              <div>
                <h2 className="font-display text-xl">{title as string}</h2>
                <p className="text-muted">{text as string}</p>
              </div>
            </article>
          );
        })}
      </section>

      <article className="rounded-card bg-forest p-6 text-paper sm:p-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">To every S.6 candidate</p>
        <h2 className="mt-2 font-display text-4xl text-balance">The paper is a door. It is not a verdict.</h2>
        <div className="mt-4 grid max-w-3xl gap-4 text-lg leading-relaxed text-paper/90">
          <p>
            UNEB briefing begins on 6 November 2026. You have already carried this course for two years. These weeks are not for learning the whole syllabus again. They are for remembering, clearly, under time.
          </p>
          <p>
            Sit one past paper as if the room were real. Mark it the same day. Write one line about why each mark was lost. Then stop, eat, and sleep. A tired mind drops marks that a rested one would have kept.
          </p>
          <p>
            Read the command word before you write. Arrive with your documents in order. Leave the phone outside the worry. When the paper starts, begin with the question you can finish — momentum is a kind of courage.
          </p>
          <p>
            However the envelope opens, you will still be someone who did the work. Walk in prepared. Walk in steady.
          </p>
        </div>
        <Link to="/events" className="btn btn-gold mt-6">See the briefing countdown</Link>
      </article>

      <section className="rounded-card border border-gold bg-gold-soft p-6">
        <h2 className="font-display text-2xl">A quiet plan for the last stretch</h2>
        <ol className="mt-3 grid gap-2 text-ink sm:grid-cols-2">
          {[
            "One timed paper, not five open topics.",
            "Mark it before you start another.",
            "Sleep before midnight on school nights.",
            "Pack documents the evening before briefing.",
            "Ask one teacher one precise question.",
            "Pray, breathe, then pick up the pen.",
          ].map((line, i) => (
            <li key={line} className="rounded-2xl bg-paper px-4 py-3">
              <span className="mr-2 font-display text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
              {line}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
