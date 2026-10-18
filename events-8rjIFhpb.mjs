import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as ChevronLeft, T as Award, a as Sun, o as ScrollText, r as Trash2, s as Plus, u as Moon, x as ChevronRight } from "../_libs/lucide-react.mjs";
import { a as useGaceb, i as PageIntro } from "./router-DQr0i1j2.mjs";
import { d as removeDeviceEvent, i as fetchSharedEvents, l as publishSharedEvent, n as deleteSharedEvent, o as loadDeviceEvents, p as saveDeviceEvent, s as mergeEvents } from "./board-DZE9d1eM.mjs";
import { i as monthMatrix, o as prettyDate, r as isoDate } from "./format-Cg7u4TL-.mjs";
import { t as Countdown } from "./countdown-xALVPeSb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events-8rjIFhpb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WEEK = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
function HonourCalendar({ events, onSelect, selected }) {
	const [cursor, setCursor] = (0, import_react.useState)(() => new Date(2026, 10, 1));
	const year = cursor.getFullYear();
	const month = cursor.getMonth();
	const cells = monthMatrix(year, month);
	const byDay = /* @__PURE__ */ new Map();
	for (const ev of events) {
		const list = byDay.get(ev.eventDate) ?? [];
		list.push(ev);
		byDay.set(ev.eventDate, list);
	}
	const label = cursor.toLocaleDateString("en-UG", {
		month: "long",
		year: "numeric"
	});
	const [today, setToday] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => setToday(isoDate(/* @__PURE__ */ new Date())), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "overflow-hidden rounded-card bg-forest text-paper shadow-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 px-4 py-5 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-[0.18em] text-gold",
				children: "HONOUR CALENDAR"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl text-balance",
				children: label
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-14 place-items-center rounded-full border border-gold text-gold",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-7" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "m-3 rounded-2xl bg-paper p-3 text-ink sm:m-4 sm:p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-outline min-w-11 px-3",
							"aria-label": "Previous month",
							onClick: () => setCursor(new Date(year, month - 1, 1)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
							className: "font-display text-xl",
							children: label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-outline min-w-11 px-3",
							"aria-label": "Next month",
							onClick: () => setCursor(new Date(year, month + 1, 1)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-7 gap-1 text-center text-[11px] font-semibold tracking-wide text-forest uppercase sm:text-xs",
					children: WEEK.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-1",
						children: d
					}, d))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 grid grid-cols-7 gap-1",
					children: cells.map((date, i) => {
						if (!date) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-12 sm:min-h-16" }, `e-${i}`);
						const iso = isoDate(date);
						const dayEvents = byDay.get(iso) ?? [];
						const briefing = iso === "2026-11-06";
						const isToday = iso === today;
						const isSelected = iso === selected;
						const weekend = date.getDay() === 0 || date.getDay() === 6;
						let tone = "bg-cream text-ink";
						if (weekend) tone = "bg-sage text-ink";
						if (dayEvents.length) tone = "bg-gold-soft text-ink";
						if (briefing) tone = "bg-gold text-ink";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSelect(iso),
							"aria-pressed": isSelected,
							"aria-label": `${prettyDate(iso)}${briefing ? ", UNEB briefing" : ""}`,
							className: `relative min-h-12 rounded-xl px-1 py-1 text-left sm:min-h-16 ${tone} ${isSelected ? "ring-2 ring-burgundy" : isToday ? "ring-2 ring-forest" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-semibold tabular-nums",
								children: date.getDate()
							}), briefing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block truncate text-[10px] font-bold tracking-wide text-burgundy uppercase",
								children: "Briefing"
							}) : dayEvents.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 block size-1.5 rounded-full bg-gold-deep" }) : null]
						}, iso);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-3 text-xs text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "size-3 rounded bg-gold" }), " UNEB briefing"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "size-3 rounded bg-gold-soft ring-1 ring-gold" }), " Marked day"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "size-3 rounded ring-2 ring-forest" }), " Today"]
						})
					]
				})
			]
		})]
	});
}
function EventsPage() {
	const { isAdmin, session, notify } = useGaceb();
	const [events, setEvents] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)("2026-11-06");
	const [openForm, setOpenForm] = (0, import_react.useState)(false);
	async function reload() {
		const shared = await fetchSharedEvents();
		setEvents(mergeEvents(shared, loadDeviceEvents()));
	}
	(0, import_react.useEffect)(() => {
		setEvents(mergeEvents([], loadDeviceEvents()));
		reload();
	}, []);
	const dayEvents = events.filter((e) => e.eventDate === selected);
	const upcoming = events.slice(0, 8);
	async function add(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const row = {
			id: crypto.randomUUID(),
			title: String(fd.get("title") || "").trim(),
			eventDate: String(fd.get("date") || selected),
			description: String(fd.get("description") || "").trim(),
			source: "device"
		};
		if (!row.title) return;
		if (isAdmin && session) {
			if ((await publishSharedEvent({
				...row,
				source: "shared"
			}, session.user.id)).ok) {
				notify("Event published for everyone.");
				await reload();
				setOpenForm(false);
				return;
			}
			notify("Saved on this device. Shared calendar is not ready yet.");
		} else notify("Saved on this device.");
		saveDeviceEvent(row);
		setEvents(mergeEvents(events.filter((x) => x.source !== "device"), loadDeviceEvents()));
		setSelected(row.eventDate);
		setOpenForm(false);
		e.currentTarget.reset();
	}
	async function remove(ev) {
		if (ev.source === "official") return;
		if (ev.source === "shared") {
			const r = await deleteSharedEvent(ev.id);
			if (!r.ok) {
				notify(r.message);
				return;
			}
		} else removeDeviceEvent(ev.id);
		await reload();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
				kicker: "Live events",
				title: "The road to briefing",
				lede: "A colour calendar for the season, and a live count to UNEB briefing on 6 November 2026."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3 rounded-card border border-line bg-paper p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, { className: "mt-0.5 size-5 text-forest" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Documents in one place" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Index, photos and the school stamp before the morning."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3 rounded-card border border-line bg-gold-soft p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "mt-0.5 size-5 text-gold-deep" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "One paper, fully marked" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "A finished paper beats a pile of unread notes."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3 rounded-card border border-line bg-sage p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "mt-0.5 size-5 text-forest" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Rest is revision" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Sleep keeps what you studied yesterday."
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HonourCalendar, {
				events,
				selected,
				onSelect: setSelected
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-[1.1fr_0.9fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-card border border-line bg-paper p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: prettyDate(selected)
						}),
						dayEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: "Nothing marked. Add a study mark if you want this day on your calendar."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 grid gap-3",
							children: dayEvents.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-2xl bg-cream p-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: ev.title }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: ev.description
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs tracking-wide text-gold-deep uppercase",
											children: ev.source === "device" ? "On this device" : ev.source === "official" ? "GACEB" : "Shared"
										})
									] }), ev.source !== "official" && (ev.source === "device" || isAdmin) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "btn btn-outline min-h-10 px-3",
										"aria-label": "Remove event",
										onClick: () => remove(ev),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									}) : null]
								})
							}, ev.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn btn-primary mt-4",
							onClick: () => setOpenForm((v) => !v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add a date"]
						}),
						openForm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 grid gap-3",
							onSubmit: add,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm font-medium",
									children: ["Title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										name: "title",
										required: true,
										maxLength: 80
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm font-medium",
									children: ["Date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										type: "date",
										name: "date",
										defaultValue: selected,
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm font-medium",
									children: ["Note", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "field min-h-24",
										name: "description",
										maxLength: 300
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-gold",
									children: "Save date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: isAdmin ? "As admin, this is published for every learner once the calendar table is in place." : "Saved on this device until an admin publishes it to the shared calendar."
								})
							]
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-card border border-line bg-paper p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Coming up"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-2",
						children: upcoming.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-center justify-between gap-3 rounded-2xl px-2 py-3 text-left hover:bg-sage",
							onClick: () => setSelected(ev.eventDate),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								className: "block",
								children: ev.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
								className: "text-muted",
								children: prettyDate(ev.eventDate)
							})] }), ev.eventDate === "2026-11-06" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-gold px-2 py-1 text-xs font-bold text-ink",
								children: "UNEB"
							}) : null]
						}) }, ev.id))
					})]
				})]
			})
		]
	});
}
//#endregion
export { EventsPage as component };
