import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Check, l as Phone, y as Copy } from "../_libs/lucide-react.mjs";
import { a as useGaceb, c as DEFAULT_NUMS, d as GACEB_CONFIG, s as getDb } from "./router-DQr0i1j2.mjs";
import { n as fmtNum, s as ugx } from "./format-Cg7u4TL-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pay-panel-C23znCDo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var cache = null;
function clearPayCache() {
	cache = null;
}
async function loadPay() {
	if (cache) return cache;
	const info = {
		network: "",
		name: "",
		email: GACEB_CONFIG.SUPPORT_EMAIL,
		numbers: [...DEFAULT_NUMS]
	};
	const db = getDb();
	if (db) {
		const r = await db.from("site_settings").select("key,value");
		const map = {
			payment_network: "network",
			payment_number: "number",
			payment_name: "name",
			support_email: "email"
		};
		let number = "";
		for (const row of r.data ?? []) {
			const key = map[row.key];
			if (!key || !row.value) continue;
			if (key === "number") number = row.value;
			else info[key] = row.value;
		}
		const nums = number.split(/[,;/]/).map((x) => x.trim()).filter(Boolean);
		if (nums.length) info.numbers = nums;
	}
	cache = info;
	return info;
}
function PayPanel({ amount, label, onSubmit }) {
	const { notify } = useGaceb();
	const [info, setInfo] = (0, import_react.useState)(null);
	const [done, setDone] = (0, import_react.useState)(false);
	const [msg, setMsg] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		loadPay().then(setInfo);
	}, []);
	async function copy(text) {
		try {
			await navigator.clipboard.writeText(text);
			notify("Copied");
		} catch {
			notify("Press and hold to copy it");
		}
	}
	async function submit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const ref = String(fd.get("ref") || "").trim();
		const phone = String(fd.get("phone") || "").trim();
		if (ref.length < 6) {
			setMsg("Enter the full transaction ID from your Mobile Money message.");
			return;
		}
		setBusy(true);
		setMsg("Sending…");
		const res = await onSubmit(ref, phone);
		setBusy(false);
		if (res === true) setDone(true);
		else setMsg(res);
	}
	const numbers = info?.numbers ?? [...DEFAULT_NUMS];
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-sage p-5 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid size-12 place-items-center rounded-full bg-forest text-paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-3 font-display text-2xl",
				children: "Payment details received"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "Status: pending confirmation. GACEB will check the payment and update your account."
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 rounded-2xl bg-gold-soft p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-gold-deep",
						children: "AMOUNT TO PAY"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "font-display text-3xl",
						children: ugx(amount)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: label
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-outline",
					onClick: () => copy(String(amount)),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), " Copy"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							"Send exactly ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: ugx(amount) }),
							" by Mobile Money to:"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-2",
						children: numbers.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center gap-2 rounded-xl bg-cream px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									className: "text-lg tabular-nums",
									children: fmtNum(n)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "btn btn-outline min-h-10 px-3",
									href: `tel:${n}`,
									"aria-label": `Call ${fmtNum(n)}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "btn btn-outline min-h-10 px-3",
									onClick: () => copy(n),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
								})
							]
						}, n))
					}),
					info?.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: ["Account name: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
							className: "text-ink",
							children: info.name
						})]
					}) : null,
					info?.network ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: info.network
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Transaction ID", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "ref",
							required: true,
							minLength: 6,
							maxLength: 40,
							autoComplete: "off",
							placeholder: "From the confirmation message"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Phone you paid from", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "phone",
							inputMode: "tel",
							maxLength: 20,
							placeholder: "07xx xxx xxx"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-gold",
						disabled: busy,
						children: "Submit payment details"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-burgundy",
						role: "status",
						children: msg
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Never share your Mobile Money PIN. GACEB will never ask for it. Your purchase is added only after the payment is confirmed."
			})
		]
	});
}
//#endregion
export { clearPayCache as n, PayPanel as t };
