import { getDb } from "@/lib/supabase";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  pinned: boolean;
  authorName: string;
  createdAt: string;
  source: "device" | "shared";
};

export type CalEvent = {
  id: string;
  title: string;
  eventDate: string;
  description: string;
  source: "official" | "device" | "shared";
};

const ANN_KEY = "gaceb-announcements-v1";
const EVT_KEY = "gaceb-calendar-local-v1";

export const UNEB_EVENT: CalEvent = {
  id: "uneb-briefing-2026-11-06",
  title: "UNEB briefing begins",
  eventDate: "2026-11-06",
  description: "Official UNEB briefing. S.6 candidates, carry your documents and arrive steady.",
  source: "official",
};

function readJson<T>(key: string): T[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]") as T[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function loadDeviceAnnouncements() {
  return readJson<Announcement>(ANN_KEY);
}

export function loadDeviceEvents() {
  return readJson<CalEvent>(EVT_KEY);
}

function writeAnnouncements(rows: Announcement[]) {
  localStorage.setItem(ANN_KEY, JSON.stringify(rows.slice(0, 24)));
}

function writeEvents(rows: CalEvent[]) {
  localStorage.setItem(EVT_KEY, JSON.stringify(rows.slice(0, 80)));
}

export async function fetchSharedAnnouncements(): Promise<Announcement[]> {
  const db = getDb();
  if (!db) return [];
  const r = await db
    .from("announcements")
    .select("id,title,body,image_url,pinned,author_name,created_at")
    .order("created_at", { ascending: false })
    .limit(40);
  if (r.error || !r.data) return [];
  return (r.data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    imageUrl: row.image_url ? String(row.image_url) : null,
    pinned: Boolean(row.pinned),
    authorName: String(row.author_name ?? "GACEB"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    source: "shared" as const,
  }));
}

export async function fetchSharedEvents(): Promise<CalEvent[]> {
  const db = getDb();
  if (!db) return [];
  const r = await db
    .from("calendar_events")
    .select("id,title,event_date,description")
    .order("event_date", { ascending: true })
    .limit(120);
  if (r.error || !r.data) return [];
  return (r.data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    title: String(row.title ?? ""),
    eventDate: String(row.event_date ?? "").slice(0, 10),
    description: String(row.description ?? ""),
    source: "shared" as const,
  }));
}

export function mergeEvents(shared: CalEvent[], device: CalEvent[]) {
  const hasBriefing = shared.some((e) => e.eventDate === UNEB_EVENT.eventDate && /brief/i.test(e.title));
  const base = hasBriefing ? shared : [UNEB_EVENT, ...shared];
  const seen = new Set(base.map((e) => e.id));
  return [...base, ...device.filter((e) => !seen.has(e.id))].sort((a, b) =>
    a.eventDate.localeCompare(b.eventDate),
  );
}

export function saveDeviceAnnouncement(row: Announcement) {
  const all = loadDeviceAnnouncements().filter((x) => x.id !== row.id);
  all.unshift(row);
  writeAnnouncements(all);
}

export function removeDeviceAnnouncement(id: string) {
  writeAnnouncements(loadDeviceAnnouncements().filter((x) => x.id !== id));
}

export function saveDeviceEvent(row: CalEvent) {
  const all = loadDeviceEvents().filter((x) => x.id !== row.id);
  all.push(row);
  writeEvents(all);
}

export function removeDeviceEvent(id: string) {
  writeEvents(loadDeviceEvents().filter((x) => x.id !== id));
}

function dataUrlToBlob(dataUrl: string) {
  const [head, body] = dataUrl.split(",");
  const mime = /data:(.*?);/.exec(head || "")?.[1] || "image/jpeg";
  const bin = atob(body || "");
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export async function publishSharedAnnouncement(row: Announcement, userId: string) {
  const db = getDb();
  if (!db) return { ok: false as const, message: "Not connected." };
  let imageUrl: string | null = null;
  if (row.imageUrl?.startsWith("data:")) {
    const path = `${userId}/${row.id}.jpg`;
    const up = await db.storage.from("announcement-photos").upload(path, dataUrlToBlob(row.imageUrl), {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (up.error) return { ok: false as const, message: up.error.message };
    imageUrl = db.storage.from("announcement-photos").getPublicUrl(path).data.publicUrl;
  }
  const ins = await db.from("announcements").insert({
    id: row.id,
    title: row.title,
    body: row.body,
    image_url: imageUrl,
    pinned: row.pinned,
    author_name: row.authorName,
    created_by: userId,
  });
  if (ins.error) return { ok: false as const, message: ins.error.message };
  return { ok: true as const, imageUrl };
}

export async function publishSharedEvent(row: CalEvent, userId: string) {
  const db = getDb();
  if (!db) return { ok: false as const, message: "Not connected." };
  const ins = await db.from("calendar_events").insert({
    id: row.id,
    title: row.title,
    event_date: row.eventDate,
    description: row.description,
    created_by: userId,
  });
  if (ins.error) return { ok: false as const, message: ins.error.message };
  return { ok: true as const };
}

export async function deleteSharedAnnouncement(id: string) {
  const db = getDb();
  if (!db) return { ok: false as const, message: "Not connected." };
  const r = await db.from("announcements").delete().eq("id", id);
  if (r.error) return { ok: false as const, message: r.error.message };
  return { ok: true as const };
}

export async function deleteSharedEvent(id: string) {
  const db = getDb();
  if (!db) return { ok: false as const, message: "Not connected." };
  const r = await db.from("calendar_events").delete().eq("id", id);
  if (r.error) return { ok: false as const, message: r.error.message };
  return { ok: true as const };
}
