import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageIntro } from "@/components/shell";
import { useGaceb } from "@/lib/gaceb";
import { getDb } from "@/lib/supabase";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  level: string | null;
  category: string | null;
  resource_type: string | null;
  file_path: string;
};

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>): { level?: string } => {
    const level = typeof search.level === "string" ? search.level : "";
    return level ? { level } : {};
  },
  head: () => ({ meta: [{ title: "PDF Library | GACEB Scholar" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const { level: levelQuery = "" } = Route.useSearch();
  const { session, openAuth, notify } = useGaceb();
  const [rows, setRows] = useState<Resource[] | null>(null);
  const [note, setNote] = useState("");
  const [q, setQ] = useState("");
  const [level, setLevel] = useState(levelQuery);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    setLevel(levelQuery);
  }, [levelQuery]);

  useEffect(() => {
    const db = getDb();
    if (!db) {
      setRows([]);
      setNote("The library will load when the connection is available.");
      return;
    }
    void db
      .from("resources")
      .select("id,title,description,subject,level,category,resource_type,file_path,status,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100)
      .then((r) => {
        if (r.error) {
          setRows([]);
          setNote("Could not load resources just now.");
          return;
        }
        setRows((r.data as Resource[]) ?? []);
        setNote("");
      });
  }, []);

  const list = useMemo(() => {
    return (rows ?? []).filter((r) => {
      const blob = `${r.title} ${r.subject ?? ""} ${r.description ?? ""}`.toLowerCase();
      if (q && !blob.includes(q.toLowerCase())) return false;
      if (level && r.level !== level) return false;
      if (category && r.category !== category) return false;
      if (type && r.resource_type !== type) return false;
      return true;
    });
  }, [rows, q, level, category, type]);

  async function download(item: Resource) {
    if (!session) {
      openAuth("login");
      notify("Log in to download resources.");
      return;
    }
    const db = getDb();
    if (!db) return;
    const { data, error } = await db.storage.from("study-pdfs").createSignedUrl(item.file_path, 120);
    if (error || !data?.signedUrl) {
      notify(error?.message || "Download link failed");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <div>
      <PageIntro kicker="Approved materials" title="PDF library" lede="Notes, past papers and revision guides that GACEB has approved." />
      <div className="grid gap-3 rounded-card border border-line bg-paper p-4 sm:grid-cols-4">
        <input className="field sm:col-span-4" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or subject" aria-label="Search resources" />
        <select className="field" value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
          <option value="">All levels</option>
          <option>O-Level</option>
          <option>A-Level</option>
        </select>
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          <option>Sciences</option>
          <option>Humanities</option>
          <option>Arts</option>
        </select>
        <select className="field sm:col-span-2" value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="">All types</option>
          <option>Notes</option>
          <option>Past Paper</option>
          <option>Revision Guide</option>
          <option>Other</option>
        </select>
      </div>
      <p className="mt-3 text-sm text-muted">{note || `${list.length} approved resource${list.length === 1 ? "" : "s"} shown.`}</p>
      <div className="mt-4 grid gap-3">
        {rows == null ? <p className="text-muted">Loading resources…</p> : null}
        {rows && list.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-paper p-8 text-center text-muted">No matching approved PDFs yet.</div>
        ) : null}
        {list.map((r) => (
          <article key={r.id} className="rounded-card border border-line bg-paper p-5">
            <p className="text-xs font-bold tracking-widest text-burgundy">PDF</p>
            <h2 className="font-display text-2xl">{r.title}</h2>
            <p className="mt-1 text-muted">{r.description || "Study resource"}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-forest">
              {[r.level, r.category, r.subject, r.resource_type].filter(Boolean).map((x) => (
                <span key={String(x)} className="rounded-full bg-sage px-2 py-1">{x}</span>
              ))}
            </div>
            <button type="button" className="btn btn-outline mt-4" onClick={() => download(r)}>
              <Download className="size-4" /> Download PDF
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
