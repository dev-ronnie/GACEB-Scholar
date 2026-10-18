import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as PageIntro } from "./router-DQr0i1j2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/courses-CkgHhvmw.js
var import_jsx_runtime = require_jsx_runtime();
var OLEVEL = [
	"Biology",
	"Chemistry",
	"Physics",
	"Mathematics",
	"English",
	"Geography",
	"History",
	"CRE / Divinity"
];
var ALEVEL = [
	"Biology",
	"Chemistry",
	"Physics",
	"Mathematics",
	"Economics",
	"History",
	"Literature",
	"Geography"
];
function Courses() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			kicker: "Find your path",
			title: "Courses & subjects",
			lede: "Choose your level and follow a focused path through your subjects."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-card border border-line bg-paper p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.16em] text-forest uppercase",
						children: "Ordinary level"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-3xl",
						children: "O-Level"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "Build strong foundations, revise key topics and practise exam-style questions."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-wrap gap-2",
						children: OLEVEL.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-full bg-sage px-3 py-1 text-sm text-forest",
							children: s
						}, s))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/library",
						search: { level: "O-Level" },
						className: "btn btn-primary mt-5",
						children: "O-Level resources"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-card border border-gold bg-gold-soft p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.16em] text-gold-deep uppercase",
						children: "Advanced level"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-3xl",
						children: "A-Level"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "Strengthen subject knowledge, practise structured answers and prepare for UNEB."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-wrap gap-2",
						children: ALEVEL.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-full bg-paper px-3 py-1 text-sm text-ink",
							children: s
						}, s))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/library",
						search: { level: "A-Level" },
						className: "btn btn-primary mt-5",
						children: "A-Level resources"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 grid gap-4 rounded-card border border-line bg-paper p-6 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "1. Learn"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Understand the concept before memorising facts."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "2. Practise"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Answer questions without looking at notes."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "3. Review"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Track mistakes and revisit weak areas."
				})] })
			]
		})
	] });
}
//#endregion
export { Courses as component };
