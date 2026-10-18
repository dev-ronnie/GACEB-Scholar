import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Pin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PageIntro } from "@/components/shell";
import {
  deleteSharedAnnouncement,
  fetchSharedAnnouncements,
  loadDeviceAnnouncements,
  publishSharedAnnouncement,
  removeDeviceAnnouncement,
  saveDeviceAnnouncement,
  type Announcement,
} from "@/lib/board";
import { useGaceb } from "@/lib/gaceb";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Announcements | GACEB Scholar" }] }),
  component: AnnouncementsPage,
});

function fileToJpeg(file: File) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not read that photo"));
        return;
      }
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => reject(new Error("Could not read that photo"));
    img.src = url;
  });
}

function AnnouncementsPage() {
  const { isAdmin, session, notify } = useGaceb();
  const [rows, setRows] = useState<Announcement[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function showLocalPlus(shared: Announcement[]) {
    const local = loadDeviceAnnouncements();
    const ids = new Set(shared.map((r) => r.id));
    const merged = [...shared, ...local.filter((r) => !ids.has(r.id))];
    merged.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
    setRows(merged);
  }

  useEffect(() => {
    showLocalPlus([]);
    void fetchSharedAnnouncements().then(showLocalPlus);
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) {
      setPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      notify("Choose a photo.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      notify("Choose a photo under 8 MB.");
      return;
    }
    try {
      setPreview(await fileToJpeg(file));
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not read that photo");
    }
  }

  async function publish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const row: Announcement = {
      id: crypto.randomUUID(),
      title: String(fd.get("title") || "").trim(),
      body: String(fd.get("body") || "").trim(),
      imageUrl: preview,
      pinned: fd.get("pinned") === "on",
      authorName: "GACEB",
      createdAt: new Date().toISOString(),
      source: "device",
    };
    if (!row.title || !row.body) return;
    setBusy(true);
    try {
      if (isAdmin && session) {
        const pub = await publishSharedAnnouncement(row, session.user.id);
        if (pub.ok) {
          notify("Announcement published.");
          const shared = await fetchSharedAnnouncements();
          showLocalPlus(shared);
          e.currentTarget.reset();
          setPreview(null);
          return;
        }
        notify("Saved on this device. The shared board is not ready yet.");
      } else {
        notify("Saved on this device.");
      }
      try {
        saveDeviceAnnouncement(row);
      } catch {
        notify("This photo is too large to keep on the device.");
        return;
      }
      showLocalPlus(rows.filter((r) => r.source === "shared"));
      e.currentTarget.reset();
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: Announcement) {
    if (row.source === "shared") {
      if (!isAdmin) return;
      const r = await deleteSharedAnnouncement(row.id);
      if (!r.ok) {
        notify(r.message);
        return;
      }
      setRows((list) => list.filter((x) => x.id !== row.id));
      return;
    }
    removeDeviceAnnouncement(row.id);
    setRows((list) => list.filter((x) => x.id !== row.id));
  }

  return (
    <div className="grid gap-6">
      <PageIntro
        kicker="Notice board"
        title="Announcements"
        lede="Write a notice and add a photo. Learners see it here."
      />
      <form className="grid gap-3 rounded-card border border-line bg-paper p-5" onSubmit={publish}>
        <h2 className="font-display text-2xl">New announcement</h2>
        <label className="grid gap-1 text-sm font-medium">
          Title
          <input className="field" name="title" required maxLength={120} placeholder="Briefing reminder" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Message
          <textarea className="field min-h-32" name="body" required maxLength={2000} placeholder="Write the notice in plain words." />
        </label>
        <label className="btn btn-outline w-fit cursor-pointer">
          <ImagePlus className="size-4" /> Add a photo
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
        {preview ? <img src={preview} alt="Announcement preview" className="max-h-72 w-full rounded-2xl object-cover" /> : null}
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="pinned" className="size-4" />
          <Pin className="size-4 text-gold-deep" /> Pin to the top
        </label>
        <button className="btn btn-primary" disabled={busy}>Publish</button>
        <p className="text-sm text-muted">
          {isAdmin
            ? "You are signed in as admin. Posts go to every learner once the announcement table is in place. Until then they stay on this device, photo included."
            : "What you publish now stays on this device, with the photo. An admin post appears for everyone after the shared board is connected."}
        </p>
      </form>

      <div className="grid gap-4">
        {rows.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-paper p-10 text-center">
            <img src="/brand/gaceb-logo.png" alt="" className="mx-auto h-24 w-auto" />
            <p className="mt-3 text-muted">The board is clear. Post the first notice.</p>
          </div>
        ) : null}
        {rows.map((row) => (
          <article key={row.id} className="overflow-hidden rounded-card border border-line bg-paper">
            {row.imageUrl ? <img src={row.imageUrl} alt="" className="max-h-96 w-full object-cover" /> : null}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {row.pinned ? <p className="text-xs font-bold tracking-widest text-gold-deep uppercase">Pinned</p> : null}
                  <h2 className="font-display text-2xl text-balance">{row.title}</h2>
                  <p className="text-sm text-muted">
                    {new Date(row.createdAt).toLocaleDateString("en-UG", { day: "numeric", month: "long", year: "numeric" })}
                    {" · "}
                    {row.source === "device" ? "On this device" : "Shared"}
                  </p>
                </div>
                {row.source === "device" || isAdmin ? (
                  <button type="button" className="btn btn-outline min-h-10 px-3" aria-label="Remove announcement" onClick={() => void remove(row)}>
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-pretty leading-relaxed">{row.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
