import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as Feather, b as Compass, i as Sunrise } from "../_libs/lucide-react.mjs";
import { i as PageIntro } from "./router-DQr0i1j2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-N7wwH1pd.js
var import_jsx_runtime = require_jsx_runtime();
function AboutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
				kicker: "Our story",
				title: "Learning with purpose",
				lede: "GACEB began in 2025, from a simple belief: a prepared student can open a door that looked shut."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-3",
				children: [
					[
						"01 · Opportunity",
						"Make useful study materials easier to find.",
						Compass
					],
					[
						"02 · Community",
						"Share knowledge carefully and help the person beside you.",
						Feather
					],
					[
						"03 · Growth",
						"Celebrate effort, not only the final mark.",
						Sunrise
					]
				].map(([title, text, Icon]) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex gap-4 rounded-card border border-line bg-paper p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-1 size-5 shrink-0 text-forest" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: text
						})] })]
					}, String(title));
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-card bg-forest p-6 text-paper sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.18em] text-gold uppercase",
						children: "To every S.6 candidate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-4xl text-balance",
						children: "The paper is a door. It is not a verdict."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid max-w-3xl gap-4 text-lg leading-relaxed text-paper/90",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "UNEB briefing begins on 6 November 2026. You have already carried this course for two years. These weeks are not for learning the whole syllabus again. They are for remembering, clearly, under time." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sit one past paper as if the room were real. Mark it the same day. Write one line about why each mark was lost. Then stop, eat, and sleep. A tired mind drops marks that a rested one would have kept." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Read the command word before you write. Arrive with your documents in order. Leave the phone outside the worry. When the paper starts, begin with the question you can finish — momentum is a kind of courage." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "However the envelope opens, you will still be someone who did the work. Walk in prepared. Walk in steady." })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/events",
						className: "btn btn-gold mt-6",
						children: "See the briefing countdown"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-gold bg-gold-soft p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "A quiet plan for the last stretch"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 grid gap-2 text-ink sm:grid-cols-2",
					children: [
						"One timed paper, not five open topics.",
						"Mark it before you start another.",
						"Sleep before midnight on school nights.",
						"Pack documents the evening before briefing.",
						"Ask one teacher one precise question.",
						"Pray, breathe, then pick up the pen."
					].map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl bg-paper px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 font-display text-gold-deep",
							children: String(i + 1).padStart(2, "0")
						}), line]
					}, line))
				})]
			})
		]
	});
}
//#endregion
export { AboutPage as component };
