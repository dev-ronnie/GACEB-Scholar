import { s as getDb } from "./router-DQr0i1j2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board-DZE9d1eM.js
var ANN_KEY = "gaceb-announcements-v1";
var EVT_KEY = "gaceb-calendar-local-v1";
var UNEB_EVENT = {
	id: "uneb-briefing-2026-11-06",
	title: "UNEB briefing begins",
	eventDate: "2026-11-06",
	description: "Official UNEB briefing. S.6 candidates, carry your documents and arrive steady.",
	source: "official"
};
function readJson(key) {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = JSON.parse(localStorage.getItem(key) || "[]");
		return Array.isArray(raw) ? raw : [];
	} catch {
		return [];
	}
}
function loadDeviceAnnouncements() {
	return readJson(ANN_KEY);
}
function loadDeviceEvents() {
	return readJson(EVT_KEY);
}
function writeAnnouncements(rows) {
	localStorage.setItem(ANN_KEY, JSON.stringify(rows.slice(0, 24)));
}
function writeEvents(rows) {
	localStorage.setItem(EVT_KEY, JSON.stringify(rows.slice(0, 80)));
}
async function fetchSharedAnnouncements() {
	const db = getDb();
	if (!db) return [];
	const r = await db.from("announcements").select("id,title,body,image_url,pinned,author_name,created_at").order("created_at", { ascending: false }).limit(40);
	if (r.error || !r.data) return [];
	return r.data.map((row) => ({
		id: String(row.id),
		title: String(row.title ?? ""),
		body: String(row.body ?? ""),
		imageUrl: row.image_url ? String(row.image_url) : null,
		pinned: Boolean(row.pinned),
		authorName: String(row.author_name ?? "GACEB"),
		createdAt: String(row.created_at ?? (/* @__PURE__ */ new Date()).toISOString()),
		source: "shared"
	}));
}
async function fetchSharedEvents() {
	const db = getDb();
	if (!db) return [];
	const r = await db.from("calendar_events").select("id,title,event_date,description").order("event_date", { ascending: true }).limit(120);
	if (r.error || !r.data) return [];
	return r.data.map((row) => ({
		id: String(row.id),
		title: String(row.title ?? ""),
		eventDate: String(row.event_date ?? "").slice(0, 10),
		description: String(row.description ?? ""),
		source: "shared"
	}));
}
function mergeEvents(shared, device) {
	const base = shared.some((e) => e.eventDate === UNEB_EVENT.eventDate && /brief/i.test(e.title)) ? shared : [UNEB_EVENT, ...shared];
	const seen = new Set(base.map((e) => e.id));
	return [...base, ...device.filter((e) => !seen.has(e.id))].sort((a, b) => a.eventDate.localeCompare(b.eventDate));
}
function saveDeviceAnnouncement(row) {
	const all = loadDeviceAnnouncements().filter((x) => x.id !== row.id);
	all.unshift(row);
	writeAnnouncements(all);
}
function removeDeviceAnnouncement(id) {
	writeAnnouncements(loadDeviceAnnouncements().filter((x) => x.id !== id));
}
function saveDeviceEvent(row) {
	const all = loadDeviceEvents().filter((x) => x.id !== row.id);
	all.push(row);
	writeEvents(all);
}
function removeDeviceEvent(id) {
	writeEvents(loadDeviceEvents().filter((x) => x.id !== id));
}
function dataUrlToBlob(dataUrl) {
	const [head, body] = dataUrl.split(",");
	const mime = /data:(.*?);/.exec(head || "")?.[1] || "image/jpeg";
	const bin = atob(body || "");
	const arr = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
	return new Blob([arr], { type: mime });
}
async function publishSharedAnnouncement(row, userId) {
	const db = getDb();
	if (!db) return {
		ok: false,
		message: "Not connected."
	};
	let imageUrl = null;
	if (row.imageUrl?.startsWith("data:")) {
		const path = `${userId}/${row.id}.jpg`;
		const up = await db.storage.from("announcement-photos").upload(path, dataUrlToBlob(row.imageUrl), {
			contentType: "image/jpeg",
			upsert: true
		});
		if (up.error) return {
			ok: false,
			message: up.error.message
		};
		imageUrl = db.storage.from("announcement-photos").getPublicUrl(path).data.publicUrl;
	}
	const ins = await db.from("announcements").insert({
		id: row.id,
		title: row.title,
		body: row.body,
		image_url: imageUrl,
		pinned: row.pinned,
		author_name: row.authorName,
		created_by: userId
	});
	if (ins.error) return {
		ok: false,
		message: ins.error.message
	};
	return {
		ok: true,
		imageUrl
	};
}
async function publishSharedEvent(row, userId) {
	const db = getDb();
	if (!db) return {
		ok: false,
		message: "Not connected."
	};
	const ins = await db.from("calendar_events").insert({
		id: row.id,
		title: row.title,
		event_date: row.eventDate,
		description: row.description,
		created_by: userId
	});
	if (ins.error) return {
		ok: false,
		message: ins.error.message
	};
	return { ok: true };
}
async function deleteSharedAnnouncement(id) {
	const db = getDb();
	if (!db) return {
		ok: false,
		message: "Not connected."
	};
	const r = await db.from("announcements").delete().eq("id", id);
	if (r.error) return {
		ok: false,
		message: r.error.message
	};
	return { ok: true };
}
async function deleteSharedEvent(id) {
	const db = getDb();
	if (!db) return {
		ok: false,
		message: "Not connected."
	};
	const r = await db.from("calendar_events").delete().eq("id", id);
	if (r.error) return {
		ok: false,
		message: r.error.message
	};
	return { ok: true };
}
//#endregion
export { loadDeviceAnnouncements as a, publishSharedAnnouncement as c, removeDeviceEvent as d, saveDeviceAnnouncement as f, fetchSharedEvents as i, publishSharedEvent as l, deleteSharedEvent as n, loadDeviceEvents as o, saveDeviceEvent as p, fetchSharedAnnouncements as r, mergeEvents as s, deleteSharedAnnouncement as t, removeDeviceAnnouncement as u };
