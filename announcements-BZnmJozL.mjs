import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Pin, h as ImagePlus, r as Trash2 } from "../_libs/lucide-react.mjs";
import { a as useGaceb, i as PageIntro } from "./router-DQr0i1j2.mjs";
import { a as loadDeviceAnnouncements, c as publishSharedAnnouncement, f as saveDeviceAnnouncement, r as fetchSharedAnnouncements, t as deleteSharedAnnouncement, u as removeDeviceAnnouncement } from "./board-DZE9d1eM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/announcements-BZnmJozL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fileToJpeg(file) {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
			const canvas = document.createElement("canvas");
			canvas.width = Math.round(img.width * scale);
			canvas.height = Math.round(img.height * scale);
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(/* @__PURE__ */ new Error("Could not read that photo"));
				return;
			}
			ctx.fillStyle = "#fff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(url);
			resolve(canvas.toDataURL("image/jpeg", .82));
		};
		img.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that photo"));
		img.src = url;
	});
}
function AnnouncementsPage() {
	const { isAdmin, session, notify } = useGaceb();
	const [rows, setRows] = (0, import_react.useState)([]);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	function showLocalPlus(shared) {
		const local = loadDeviceAnnouncements();
		const ids = new Set(shared.map((r) => r.id));
		const merged = [...shared, ...local.filter((r) => !ids.has(r.id))];
		merged.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
		setRows(merged);
	}
	(0, import_react.useEffect)(() => {
		showLocalPlus([]);
		fetchSharedAnnouncements().then(showLocalPlus);
	}, []);
	async function onFile(file) {
		if (!file) {
			setPreview(null);
			return;
		}
		if (!file.type.startsWith("image/")) {
			notify("Choose a photo.");
			return;
		}
		if (file.size > 8388608) {
			notify("Choose a photo under 8 MB.");
			return;
		}
		try {
			setPreview(await fileToJpeg(file));
		} catch (err) {
			notify(err instanceof Error ? err.message : "Could not read that photo");
		}
	}
	async function publish(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const row = {
			id: crypto.randomUUID(),
			title: String(fd.get("title") || "").trim(),
			body: String(fd.get("body") || "").trim(),
			imageUrl: preview,
			pinned: fd.get("pinned") === "on",
			authorName: "GACEB",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			source: "device"
		};
		if (!row.title || !row.body) return;
		setBusy(true);
		try {
			if (isAdmin && session) {
				if ((await publishSharedAnnouncement(row, session.user.id)).ok) {
					notify("Announcement published.");
					showLocalPlus(await fetchSharedAnnouncements());
					e.currentTarget.reset();
					setPreview(null);
					return;
				}
				notify("Saved on this device. The shared board is not ready yet.");
			} else notify("Saved on this device.");
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
	async function remove(row) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
				kicker: "Notice board",
				title: "Announcements",
				lede: "Write a notice and add a photo. Learners see it here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-card border border-line bg-paper p-5",
				onSubmit: publish,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "New announcement"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "title",
							required: true,
							maxLength: 120,
							placeholder: "Briefing reminder"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Message", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field min-h-32",
							name: "body",
							required: true,
							maxLength: 2e3,
							placeholder: "Write the notice in plain words."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "btn btn-outline w-fit cursor-pointer",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-4" }),
							" Add a photo",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "sr-only",
								type: "file",
								accept: "image/*",
								onChange: (e) => void onFile(e.target.files?.[0])
							})
						]
					}),
					preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: preview,
						alt: "Announcement preview",
						className: "max-h-72 w-full rounded-2xl object-cover"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								name: "pinned",
								className: "size-4"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-4 text-gold-deep" }),
							" Pin to the top"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						disabled: busy,
						children: "Publish"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: isAdmin ? "You are signed in as admin. Posts go to every learner once the announcement table is in place. Until then they stay on this device, photo included." : "What you publish now stays on this device, with the photo. An admin post appears for everyone after the shared board is connected."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-card border border-dashed border-line bg-paper p-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/brand/gaceb-logo.png",
						alt: "",
						className: "mx-auto h-24 w-auto"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-muted",
						children: "The board is clear. Post the first notice."
					})]
				}) : null, rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "overflow-hidden rounded-card border border-line bg-paper",
					children: [row.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: row.imageUrl,
						alt: "",
						className: "max-h-96 w-full object-cover"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								row.pinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-bold tracking-widest text-gold-deep uppercase",
									children: "Pinned"
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-2xl text-balance",
									children: row.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted",
									children: [
										new Date(row.createdAt).toLocaleDateString("en-UG", {
											day: "numeric",
											month: "long",
											year: "numeric"
										}),
										" · ",
										row.source === "device" ? "On this device" : "Shared"
									]
								})
							] }), row.source === "device" || isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-outline min-h-10 px-3",
								"aria-label": "Remove announcement",
								onClick: () => void remove(row),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 whitespace-pre-wrap text-pretty leading-relaxed",
							children: row.body
						})]
					})]
				}, row.id))]
			})
		]
	});
}
//#endregion
export { AnnouncementsPage as component };
