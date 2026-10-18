import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as Heart } from "../_libs/lucide-react.mjs";
import { d as GACEB_CONFIG, i as PageIntro, o as callRpc } from "./router-DQr0i1j2.mjs";
import { s as ugx, t as dupMsg } from "./format-Cg7u4TL-.mjs";
import { t as PayPanel } from "./pay-panel-C23znCDo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/donate-CyvGPxdK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CHIPS = [
	5e3,
	1e4,
	2e4,
	5e4,
	1e5
];
function DonatePage() {
	const [step, setStep] = (0, import_react.useState)("choose");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)("");
	function go(e) {
		e.preventDefault();
		if (!/^\d+$/.test(amount.trim())) {
			setErr("Enter a whole number in UGX, for example 7500.");
			return;
		}
		const amt = Number(amount);
		if (amt < 500) {
			setErr("The smallest gift is UGX 500.");
			return;
		}
		if (amt > 1e8) {
			setErr("Please contact GACEB for gifts above UGX 100,000,000.");
			return;
		}
		setErr("");
		setStep("pay");
	}
	const donor = name.trim() || "Anonymous";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-3xl gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
				kicker: "Support learning",
				title: "Donate to GACEB",
				lede: "Give any amount you can. Every shilling helps a student learn."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-card bg-forest p-6 text-paper",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-6 text-gold" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl text-balance",
						children: "Thank you, from the whole GACEB family"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-pretty leading-relaxed text-paper/90",
						children: "Behind every note shared is a young person who refuses to give up. Whatever you give tells that student someone believes in them. We will use it carefully."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-xl",
						children: "With gratitude, Sr. Gauge and the GACEB family"
					})
				]
			}),
			step === "choose" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-card border border-line bg-paper p-5",
				onSubmit: go,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: CHIPS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `btn ${amount === String(n) ? "btn-primary" : "btn-outline"}`,
							onClick: () => {
								setAmount(String(n));
								setErr("");
							},
							children: n.toLocaleString("en-UG")
						}, n))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Amount in UGX", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							inputMode: "numeric",
							value: amount,
							onChange: (e) => setAmount(e.target.value),
							placeholder: "e.g. 7500",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Your name (optional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							value: name,
							onChange: (e) => setName(e.target.value),
							maxLength: 60
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["A message (optional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field min-h-24",
							value: message,
							onChange: (e) => setMessage(e.target.value),
							maxLength: 300
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-burgundy",
						children: err
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-gold",
						children: "Continue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "The smallest gift is UGX 500. A donation is recorded only after GACEB confirms the payment."
					})
				]
			}) : null,
			step === "pay" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-card border border-line bg-paper p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayPanel, {
						amount: Number(amount),
						label: "Donation to GACEB",
						onSubmit: async (ref, phone) => {
							const r = await callRpc("submit_donation", {
								p_name: donor,
								p_amount: Number(amount),
								p_ref: ref,
								p_phone: phone,
								p_message: message.trim()
							});
							if (r.error) return dupMsg(r.error.message);
							setStep("done");
							return true;
						}
					}),
					GACEB_CONFIG.DONATION_URL ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "btn btn-outline mt-3",
						href: GACEB_CONFIG.DONATION_URL,
						rel: "noreferrer",
						children: "Pay online instead"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-outline mt-3",
						onClick: () => setStep("choose"),
						children: "Change amount"
					})
				]
			}) : null,
			step === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-card bg-gold-soft p-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-3xl",
						children: ["Thank you, ", donor === "Anonymous" ? "dear friend" : donor]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-pretty",
						children: [
							"Your gift of ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: ugx(Number(amount)) }),
							" has reached us. We will confirm the payment and put it to work with care."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-xl",
						children: "May God bless you abundantly."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "btn btn-primary mt-4",
						children: "Back to home"
					})
				]
			}) : null
		]
	});
}
//#endregion
export { DonatePage as component };
