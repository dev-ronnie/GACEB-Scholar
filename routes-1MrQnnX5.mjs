import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as ArrowRight, f as Megaphone, m as Library, w as CalendarDays } from "../_libs/lucide-react.mjs";
import { a as useGaceb, r as Crest } from "./router-DQr0i1j2.mjs";
import { t as Countdown } from "./countdown-xALVPeSb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-1MrQnnX5.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { openAuth, session } = useGaceb();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.18em] text-gold-deep uppercase",
						children: "Learn · Grow · Achieve"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-2 font-display text-5xl leading-[1.05] text-balance text-ink sm:text-6xl",
						children: ["Your learning journey. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-forest",
							children: "Your brighter future."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-xl text-lg text-pretty text-muted",
						children: "Uganda curriculum study resources, revision planning and a community built to help O-Level and A-Level learners rise."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/courses",
							className: "btn btn-primary",
							children: ["Explore courses ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/library",
							className: "btn btn-outline",
							children: "Open PDF library"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							className: "btn btn-outline",
							children: "My dashboard"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-primary",
							onClick: () => openAuth("login"),
							children: "Log in"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-outline",
							onClick: () => openAuth("signup"),
							children: "Create account"
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 flex flex-wrap gap-2 text-sm text-forest",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-full bg-sage px-3 py-1",
								children: "O-Level & A-Level"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-full bg-sage px-3 py-1",
								children: "Learn anywhere"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-full bg-sage px-3 py-1",
								children: "Student-first"
							})
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-card bg-forest p-6 text-paper shadow-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl bg-paper p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, { className: "mx-auto h-48 w-auto sm:h-56" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 font-display text-3xl text-balance",
							children: "Learn today. Build tomorrow."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-paper/80",
							children: "Small steps. Strong habits. Brighter futures."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid grid-cols-2 gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-paper/10 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "O-Level" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-paper/75",
									children: "Sciences · Humanities"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-paper/10 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "A-Level" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-paper/75",
									children: "Sciences · Arts"
								})]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, { compact: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-card border border-line bg-paper p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Library, { className: "size-6 text-forest" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-display text-2xl",
								children: "Study library"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted",
								children: "Revision notes, topic guides and past papers."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/library",
								className: "mt-3 inline-flex items-center gap-1 font-semibold text-forest",
								children: ["Browse resources ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-card border border-line bg-paper p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-6 text-gold-deep" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-display text-2xl",
								children: "Live events"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted",
								children: "The honour calendar and the UNEB briefing countdown."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/events",
								className: "mt-3 inline-flex items-center gap-1 font-semibold text-forest",
								children: ["Open live events ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-card border border-line bg-paper p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-6 text-burgundy" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-display text-2xl",
								children: "Announcements"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted",
								children: "Notices with words and photographs, in one board."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/announcements",
								className: "mt-3 inline-flex items-center gap-1 font-semibold text-forest",
								children: ["Read the board ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid items-center gap-4 rounded-card bg-forest-deep p-6 text-paper sm:grid-cols-[1fr_auto] sm:p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.18em] text-gold uppercase",
						children: "Your study companion"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-3xl",
						children: "Meet Gauge"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-paper/80",
						children: "Study strategies, revision ideas and a calm way through a hard topic."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/assistant",
						className: "btn btn-gold mt-4",
						children: "Open Gauge"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, { className: "hidden h-28 w-auto sm:block" })]
			})
		]
	});
}
//#endregion
export { Home as component };
