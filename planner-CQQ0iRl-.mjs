import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Trash2 } from "../_libs/lucide-react.mjs";
import { a as useGaceb, i as PageIntro } from "./router-DQr0i1j2.mjs";
import { t as Countdown } from "./countdown-xALVPeSb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planner-CQQ0iRl-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "gaceb-study-planner-v1";
var DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday"
];
function readPlans() {
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
		return Array.isArray(raw) ? raw : [];
	} catch {
		return [];
	}
}
function PlannerPage() {
	const { notify } = useGaceb();
	const [plans, setPlans] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		setPlans(readPlans());
	}, []);
	function save(next) {
		localStorage.setItem(KEY, JSON.stringify(next));
		setPlans(next);
	}
	const ordered = [...plans].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.time.localeCompare(b.time));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-3xl gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
				kicker: "This device",
				title: "Study planner",
				lede: "A weekly timetable that stays on this device."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, { compact: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-card border border-line bg-paper p-5",
				onSubmit: (e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					const row = Object.fromEntries(fd.entries());
					save([...plans, row]);
					e.currentTarget.reset();
					notify("Study session saved on this device");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Day", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "field",
							name: "day",
							defaultValue: "Monday",
							children: DAYS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: d }, d))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Time", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							type: "time",
							name: "time",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Subject", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "subject",
							required: true,
							maxLength: 80
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Topic", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "topic",
							required: true,
							maxLength: 120
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Duration", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "duration",
							placeholder: "45 minutes",
							required: true,
							maxLength: 40
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						children: "Add session"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [ordered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "No sessions yet. Add your first study session."
				}) : null, ordered.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 rounded-card border border-line bg-paper px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
						x.day,
						" · ",
						x.time
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							x.subject,
							" — ",
							x.topic,
							" · ",
							x.duration
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-outline min-h-10 px-3",
						"aria-label": "Remove session",
						onClick: () => save(plans.filter((_, idx) => idx !== plans.indexOf(x))),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				}, `${x.day}-${x.time}-${i}`))]
			}),
			plans.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn btn-outline",
				onClick: () => {
					if (confirm("Clear all saved study sessions?")) save([]);
				},
				children: "Clear planner"
			}) : null
		]
	});
}
//#endregion
export { PlannerPage as component };
