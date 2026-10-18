import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Phone, p as Mail } from "../_libs/lucide-react.mjs";
import { a as useGaceb, d as GACEB_CONFIG, i as PageIntro, p as WHATSAPP_URL, s as getDb } from "./router-DQr0i1j2.mjs";
import { n as fmtNum } from "./format-Cg7u4TL-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-LUtyYoit.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WhatsAppIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-7",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.4a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2zm5.76 14.05c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.12.1-1.81-.11-.41-.13-.95-.31-1.64-.61-2.88-1.25-4.76-4.15-4.9-4.35-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.24-.26.64-.38 1.02-.38.12 0 .23 0 .33.01.3.01.45.03.65.5.24.58.82 2 .89 2.15.07.14.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.41.48-.14.13-.28.28-.12.54.16.26.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.26.13.42.11.57-.07.16-.19.66-.77.84-1.03.18-.26.35-.22.58-.13.24.1 1.5.71 1.76.84.26.13.43.19.49.3.07.1.07.61-.17 1.29z"
		})
	});
}
function Glyph({ d }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-7",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d
		})
	});
}
var SOON = [
	{
		name: "Facebook",
		d: "M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"
	},
	{
		name: "Instagram",
		d: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm5.2-.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1zM12 9.2A2.8 2.8 0 1 1 9.2 12 2.8 2.8 0 0 1 12 9.2z"
	},
	{
		name: "X",
		d: "M4 4h3.4l4.1 5.7L16.2 4H20l-6.3 7.6L20.2 20h-3.4l-4.5-6.2L7.6 20H4l6.6-8z"
	},
	{
		name: "YouTube",
		d: "M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3z"
	},
	{
		name: "Telegram",
		d: "M21.5 4.5 2.8 11.2c-1.3.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.1.9.8.9.5 0 .7-.2 1-.5l2.7-2.6 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.2-.4-1.8-1.8-1.2z"
	}
];
function ContactPage() {
	const { notify } = useGaceb();
	const [status, setStatus] = (0, import_react.useState)("");
	async function send(e) {
		e.preventDefault();
		const db = getDb();
		const fd = new FormData(e.currentTarget);
		if (!db) {
			setStatus("The form is not connected yet. Use WhatsApp or email.");
			return;
		}
		setStatus("Sending…");
		const r = await db.from("contact_messages").insert({
			name: String(fd.get("name") || "").trim(),
			email: String(fd.get("email") || "").trim(),
			message: String(fd.get("message") || "").trim()
		});
		if (r.error) setStatus(r.error.message);
		else {
			setStatus("Sent. Thank you.");
			e.currentTarget.reset();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
				kicker: "Contact",
				title: "Reach GACEB"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: WHATSAPP_URL,
						className: "grid justify-items-center gap-2 rounded-card bg-forest p-4 text-paper",
						"aria-label": "WhatsApp",
						target: "_blank",
						rel: "noreferrer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppIcon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "WhatsApp"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "tel:+256743766451",
						className: "grid justify-items-center gap-2 rounded-card border border-line bg-paper p-4 text-forest",
						"aria-label": "Call",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `mailto:${GACEB_CONFIG.SUPPORT_EMAIL}`,
						className: "grid justify-items-center gap-2 rounded-card border border-line bg-paper p-4 text-burgundy",
						"aria-label": "Email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-7" })
					}),
					SOON.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "grid justify-items-center gap-2 rounded-card border border-dashed border-line bg-paper p-4 text-muted",
						"aria-label": `${p.name}, link coming`,
						onClick: () => notify(`${p.name} link is coming.`),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, { d: p.d }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium",
							children: p.name
						})]
					}, p.name))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-sm text-muted tabular-nums",
				children: [
					fmtNum("0743766451"),
					" · ",
					fmtNum("0783165623")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mx-auto grid w-full max-w-lg gap-3 rounded-card border border-line bg-paper p-5",
				onSubmit: send,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "name",
							required: true,
							maxLength: 100
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "email",
							type: "email",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Message", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field min-h-32",
							name: "message",
							required: true,
							maxLength: 3e3
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						children: "Send"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						role: "status",
						children: status
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Never send a password or Mobile Money PIN."
					})
				]
			})
		]
	});
}
//#endregion
export { ContactPage as component };
