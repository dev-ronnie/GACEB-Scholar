import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as Download } from "../_libs/lucide-react.mjs";
import { a as useGaceb, i as PageIntro, n as Route$3, s as getDb } from "./router-DQr0i1j2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-BqkKU728.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LibraryPage() {
	const { level: levelQuery = "" } = Route$3.useSearch();
	const { session, openAuth, notify } = useGaceb();
	const [rows, setRows] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)("");
	const [q, setQ] = (0, import_react.useState)("");
	const [level, setLevel] = (0, import_react.useState)(levelQuery);
	const [category, setCategory] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setLevel(levelQuery);
	}, [levelQuery]);
	(0, import_react.useEffect)(() => {
		const db = getDb();
		if (!db) {
			setRows([]);
			setNote("The library will load when the connection is available.");
			return;
		}
		db.from("resources").select("id,title,description,subject,level,category,resource_type,file_path,status,created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(100).then((r) => {
			if (r.error) {
				setRows([]);
				setNote("Could not load resources just now.");
				return;
			}
			setRows(r.data ?? []);
			setNote("");
		});
	}, []);
	const list = (0, import_react.useMemo)(() => {
		return (rows ?? []).filter((r) => {
			const blob = `${r.title} ${r.subject ?? ""} ${r.description ?? ""}`.toLowerCase();
			if (q && !blob.includes(q.toLowerCase())) return false;
			if (level && r.level !== level) return false;
			if (category && r.category !== category) return false;
			if (type && r.resource_type !== type) return false;
			return true;
		});
	}, [
		rows,
		q,
		level,
		category,
		type
	]);
	async function download(item) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			kicker: "Approved materials",
			title: "PDF library",
			lede: "Notes, past papers and revision guides that GACEB has approved."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 rounded-card border border-line bg-paper p-4 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field sm:col-span-4",
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search title or subject",
					"aria-label": "Search resources"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "field",
					value: level,
					onChange: (e) => setLevel(e.target.value),
					"aria-label": "Level",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All levels"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "O-Level" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "A-Level" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "field",
					value: category,
					onChange: (e) => setCategory(e.target.value),
					"aria-label": "Category",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All categories"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Sciences" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Humanities" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Arts" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "field sm:col-span-2",
					value: type,
					onChange: (e) => setType(e.target.value),
					"aria-label": "Type",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All types"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Notes" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Past Paper" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Revision Guide" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Other" })
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: note || `${list.length} approved resource${list.length === 1 ? "" : "s"} shown.`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3",
			children: [
				rows == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Loading resources…"
				}) : null,
				rows && list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-card border border-dashed border-line bg-paper p-8 text-center text-muted",
					children: "No matching approved PDFs yet."
				}) : null,
				list.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-card border border-line bg-paper p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold tracking-widest text-burgundy",
							children: "PDF"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: r.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-muted",
							children: r.description || "Study resource"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2 text-xs font-medium text-forest",
							children: [
								r.level,
								r.category,
								r.subject,
								r.resource_type
							].filter(Boolean).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-sage px-2 py-1",
								children: x
							}, String(x)))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn btn-outline mt-4",
							onClick: () => download(r),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Download PDF"]
						})
					]
				}, r.id))
			]
		})
	] });
}
//#endregion
export { LibraryPage as component };
