import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro } from "@/components/shell";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [{ title: "Courses | GACEB Scholar" }] }),
  component: Courses,
});

const OLEVEL = ["Biology", "Chemistry", "Physics", "Mathematics", "English", "Geography", "History", "CRE / Divinity"];
const ALEVEL = ["Biology", "Chemistry", "Physics", "Mathematics", "Economics", "History", "Literature", "Geography"];

function Courses() {
  return (
    <div>
      <PageIntro kicker="Find your path" title="Courses & subjects" lede="Choose your level and follow a focused path through your subjects." />
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-card border border-line bg-paper p-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-forest uppercase">Ordinary level</p>
          <h2 className="mt-1 font-display text-3xl">O-Level</h2>
          <p className="mt-2 text-muted">Build strong foundations, revise key topics and practise exam-style questions.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {OLEVEL.map((s) => <li key={s} className="rounded-full bg-sage px-3 py-1 text-sm text-forest">{s}</li>)}
          </ul>
          <Link to="/library" search={{ level: "O-Level" }} className="btn btn-primary mt-5">O-Level resources</Link>
        </article>
        <article className="rounded-card border border-gold bg-gold-soft p-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-gold-deep uppercase">Advanced level</p>
          <h2 className="mt-1 font-display text-3xl">A-Level</h2>
          <p className="mt-2 text-muted">Strengthen subject knowledge, practise structured answers and prepare for UNEB.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ALEVEL.map((s) => <li key={s} className="rounded-full bg-paper px-3 py-1 text-sm text-ink">{s}</li>)}
          </ul>
          <Link to="/library" search={{ level: "A-Level" }} className="btn btn-primary mt-5">A-Level resources</Link>
        </article>
      </div>
      <section className="mt-4 grid gap-4 rounded-card border border-line bg-paper p-6 sm:grid-cols-3">
        <div><h3 className="font-display text-xl">1. Learn</h3><p className="text-muted">Understand the concept before memorising facts.</p></div>
        <div><h3 className="font-display text-xl">2. Practise</h3><p className="text-muted">Answer questions without looking at notes.</p></div>
        <div><h3 className="font-display text-xl">3. Review</h3><p className="text-muted">Track mistakes and revisit weak areas.</p></div>
      </section>
    </div>
  );
}
