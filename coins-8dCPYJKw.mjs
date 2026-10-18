import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as useGaceb, i as PageIntro, l as DEFAULT_PACKS, o as callRpc, s as getDb, u as DEFAULT_PLANS } from "./router-DQr0i1j2.mjs";
import { a as planLen, s as ugx, t as dupMsg } from "./format-Cg7u4TL-.mjs";
import { t as PayPanel } from "./pay-panel-C23znCDo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coins-8dCPYJKw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CoinsPage() {
	const { session, profile, openAuth, notify, refresh, openDialog, closeDialog } = useGaceb();
	const [packs, setPacks] = (0, import_react.useState)([...DEFAULT_PACKS]);
	const [plans, setPlans] = (0, import_react.useState)([...DEFAULT_PLANS]);
	const [referral, setReferral] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const db = getDb();
		if (!db) return;
		db.from("coin_packs").select("coins,amount_ugx,label").order("sort").then((r) => {
			if (r.data?.length) setPacks(r.data);
		});
		db.from("premium_plans").select("code,name,hours,amount_ugx").eq("active", true).order("sort").then((r) => {
			if (r.data?.length) setPlans(r.data);
		});
	}, []);
	function requireLogin() {
		openAuth("login");
		notify("Log in first");
		return false;
	}
	function buy(pack) {
		if (!session) return requireLogin();
		openDialog(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-3 font-display text-3xl",
			children: [
				"Buy ",
				pack.coins,
				" GACEB coins"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayPanel, {
			amount: Number(pack.amount_ugx),
			label: `${pack.coins} GACEB coins`,
			onSubmit: async (ref, phone) => {
				const r = await callRpc("request_coin_purchase", {
					p_coins: pack.coins,
					p_ref: ref,
					p_phone: phone
				});
				if (r.error) return dupMsg(r.error.message);
				refresh();
				return true;
			}
		})] }));
	}
	function choose(plan) {
		if (!session) return requireLogin();
		openDialog(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-3 font-display text-3xl",
			children: [plan.name, " Premium"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayPanel, {
			amount: Number(plan.amount_ugx),
			label: `${plan.name} Premium plan`,
			onSubmit: async (ref, phone) => {
				const r = await callRpc("request_premium", {
					p_plan: plan.code,
					p_ref: ref,
					p_phone: phone
				});
				if (r.error) return dupMsg(r.error.message);
				refresh();
				return true;
			}
		})] }));
	}
	async function invite() {
		if (!session) return requireLogin();
		await refresh();
		const code = profile?.referral_code;
		if (!code) {
			setReferral("Referral code is not available yet. Try again after account setup.");
			return;
		}
		const link = `${location.origin}/?ref=${encodeURIComponent(code)}`;
		setReferral(link);
		try {
			await navigator.clipboard.writeText(link);
			notify("Referral link copied");
		} catch {
			notify("Copy the link below");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
				kicker: "Learn · Contribute · Earn",
				title: "GACEB coins & Premium",
				lede: "You need an account to buy coins or subscribe. Coins and Premium start only after GACEB confirms your Mobile Money payment."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Buy coins"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 md:grid-cols-3",
				children: packs.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: `rounded-card border bg-paper p-5 ${i === packs.length - 1 ? "border-gold" : "border-line"}`,
					children: [
						p.label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold tracking-widest text-gold-deep uppercase",
							children: p.label
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-display text-4xl",
							children: [
								p.coins,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg text-muted",
									children: "coins"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xl font-semibold",
							children: ugx(Number(p.amount_ugx))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"Sh. ",
								Math.round(Number(p.amount_ugx) / Number(p.coins)),
								" per coin"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn btn-primary mt-4 w-full",
							onClick: () => buy(p),
							children: ["Buy ", p.coins]
						})
					]
				}, `${p.coins}-${i}`))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: "Premium"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: plans.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: `rounded-card border bg-paper p-5 ${p.code === "yearly" ? "border-gold bg-gold-soft" : "border-line"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-2xl",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-2xl font-semibold",
								children: ugx(Number(p.amount_ugx))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [planLen(Number(p.hours)), " of Premium"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-primary mt-4 w-full",
								onClick: () => choose(p),
								children: "Choose"
							})
						]
					}, p.code))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "A new Premium purchase replaces the current plan and starts a fresh timer. Premium opens documents marked Premium as they are published."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-card border border-line bg-paper p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Earn"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "5 coins" }), " when an administrator approves your PDF."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "5 coins" }), " when an administrator verifies a genuine referral."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/dashboard",
								className: "btn btn-outline mt-3",
								onClick: (e) => {
									if (!session) {
										e.preventDefault();
										closeDialog();
										openAuth("login");
									}
								},
								children: "View my account"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-card border border-line bg-paper p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Invite a classmate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-outline mt-3",
								onClick: () => void invite(),
								children: "Create my invite link"
							}),
							referral ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field mt-3",
								readOnly: true,
								value: referral,
								onFocus: (e) => e.currentTarget.select()
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-card border border-line bg-paper p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Donate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "Every gift is checked before it is recorded."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/donate",
								className: "btn btn-gold mt-3",
								children: "Donate to GACEB"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl bg-gold-soft px-4 py-3 text-sm",
				children: "Never share your Mobile Money PIN."
			})
		]
	});
}
//#endregion
export { CoinsPage as component };
