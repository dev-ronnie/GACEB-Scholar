import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as UNEB_BRIEFING } from "./router-DQr0i1j2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/countdown-xALVPeSb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parts(target, now) {
	const diff = Math.max(0, target - now);
	return {
		days: Math.floor(diff / 864e5),
		hours: Math.floor(diff % 864e5 / 36e5),
		mins: Math.floor(diff % 36e5 / 6e4),
		secs: Math.floor(diff % 6e4 / 1e3),
		done: diff <= 0
	};
}
function Countdown({ compact = false }) {
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const tick = () => setNow(Date.now());
		tick();
		const id = window.setInterval(tick, 1e3);
		return () => window.clearInterval(id);
	}, []);
	const p = now == null ? null : parts(UNEB_BRIEFING.getTime(), now);
	const runStart = (/* @__PURE__ */ new Date("2026-09-01T00:00:00+03:00")).getTime();
	const runEnd = UNEB_BRIEFING.getTime();
	const progress = now == null ? 0 : Math.min(100, Math.max(0, (now - runStart) / (runEnd - runStart) * 100));
	const units = [
		["Days", p?.days],
		["Hours", p?.hours],
		["Mins", p?.mins],
		["Secs", p?.secs]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: compact ? "rounded-card bg-forest p-4 text-paper" : "overflow-hidden rounded-card bg-forest text-paper shadow-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: compact ? "" : "grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.2fr_1fr] lg:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-[0.2em] text-gold",
					children: "S.6 · UACE 2026"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-3xl text-balance sm:text-4xl",
					children: "UNEB briefing"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-paper/85",
					children: "6 November 2026 · stay ready"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 h-2 overflow-hidden rounded-full bg-paper/15",
					"aria-hidden": true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full bg-gold",
						style: { width: `${progress}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-gold-soft",
					children: "The final run-in is open. Steady work beats a late rush."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4 gap-2",
				"aria-live": "polite",
				children: units.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-paper/10 px-1 py-3 text-center ring-1 ring-gold/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "block font-display text-3xl tabular-nums text-gold sm:text-4xl",
						children: value == null ? "—" : String(value).padStart(2, "0")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
						className: "text-xs tracking-wide text-paper/80 uppercase",
						children: label
					})]
				}, label))
			})]
		}), p?.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "bg-gold px-5 py-3 text-center font-semibold text-ink",
			children: "Briefing day is here. Walk in prepared."
		}) : null]
	});
}
//#endregion
export { Countdown as t };
