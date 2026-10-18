import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as useGaceb, i as PageIntro, o as callRpc, s as getDb } from "./router-DQr0i1j2.mjs";
import { s as ugx } from "./format-Cg7u4TL-.mjs";
import { n as clearPayCache } from "./pay-panel-C23znCDo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-QjI9ysLW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TIERS = [
	["New Scholar", 0],
	["Bronze Scholar", 20],
	["Silver Scholar", 100],
	["Gold Scholar", 500]
];
var WHY = {
	approved_upload: "PDF approved",
	verified_referral: "Referral verified",
	coin_purchase: "Coins purchased",
	admin_adjustment: "Adjustment",
	premium_reward: "Reward"
};
function DashboardPage() {
	const { session, profile, ready, isAdmin, openAuth, notify, refresh } = useGaceb();
	const [data, setData] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!session) {
			setData(null);
			return;
		}
		const db = getDb();
		if (!db) return;
		let cancel = false;
		(async () => {
			const [ups, tx, buys, prem, subs] = await Promise.all([
				db.from("resources").select("title,subject,status,created_at").eq("uploaded_by", session.user.id).order("created_at", { ascending: false }).limit(20),
				db.from("coin_transactions").select("amount,reason,created_at").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(8),
				db.from("coin_purchases").select("coins,amount_ugx,status,created_at").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(8),
				callRpc("my_premium", {}),
				db.from("premium_requests").select("plan,amount_ugx,status,created_at").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(8)
			]);
			if (cancel) return;
			const premRow = Array.isArray(prem.data) ? prem.data[0] ?? null : prem.data;
			setData({
				ups: ups.data ?? [],
				tx: tx.data ?? [],
				buys: buys.data ?? [],
				prem: premRow,
				subs: subs.error ? [] : subs.data ?? []
			});
		})();
		return () => {
			cancel = true;
		};
	}, [session, profile]);
	const name = profile?.full_name || session?.user.email || "Learner";
	const coins = Number(profile?.coins || 0);
	let tierIndex = 0;
	TIERS.forEach((t, i) => {
		if (coins >= t[1]) tierIndex = i;
	});
	const tier = TIERS[tierIndex];
	const next = TIERS[tierIndex + 1];
	const pct = next ? Math.min(100, Math.round((coins - tier[1]) / (next[1] - tier[1]) * 100)) : 100;
	const title = greetingTitle(profile);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-3xl gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
				kicker: "Your learning space",
				title: "Dashboard",
				lede: "Your account, from top to bottom."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-paper p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl",
						children: session ? `Welcome back, ${title}` : "Welcome, learner"
					}), session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-outline",
						onClick: async () => {
							await getDb()?.auth.signOut();
							notify("Logged out");
							await refresh();
						},
						children: "Log out"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-primary",
						onClick: () => openAuth("login"),
						children: "Log in / Create account"
					})]
				}), !session && ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-muted",
					children: "Sign in to see your coins, payments and progress in one column."
				}) : null]
			}),
			session && data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "divide-y divide-line overflow-hidden rounded-card border border-line bg-paper",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Name",
							v: name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "School",
							v: profile?.school || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Level",
							v: profile?.level || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Coins",
							v: String(coins)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Standing",
							v: tier[0]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "px-4 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Progress to ", next ? next[0] : "the top"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
									className: "tabular-nums",
									children: [pct, "%"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-2 overflow-hidden rounded-full bg-sage",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-gold",
									style: { width: `${pct}%` }
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Premium",
							v: premiumText(data.prem)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Referral code",
							v: profile?.referral_code || "Not ready yet"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: "Coin activity",
					children: [data.tx.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "No coin activity yet."
					}) : null, data.tx.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLine, {
						title: `${Number(x.amount) > 0 ? "+" : ""}${x.amount} · ${WHY[String(x.reason)] || String(x.reason || "Update")}`,
						meta: String(x.created_at || "").slice(0, 10)
					}, i))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: "Coin payments",
					children: [data.buys.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "No coin payments yet."
					}) : null, data.buys.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLine, {
						title: `${x.coins} coins · ${ugx(Number(x.amount_ugx || 0))}`,
						meta: String(x.status || "")
					}, i))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: "Premium history",
					children: [data.subs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "No Premium requests yet."
					}) : null, data.subs.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLine, {
						title: `${x.plan} · ${ugx(Number(x.amount_ugx || 0))}`,
						meta: String(x.status || "")
					}, i))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: "Your uploads",
					children: [data.ups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "No uploads yet."
					}) : null, data.ups.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLine, {
						title: String(x.title || "PDF"),
						meta: `${x.subject || ""} · ${x.status || ""}`
					}, i))]
				})
			] }) : null,
			session && isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStack, { onChange: refresh }) : null
		]
	});
}
function greetingTitle(profile) {
	const first = (profile?.full_name?.trim() || "").split(" ")[0] || "learner";
	const gender = (profile?.gender || "").toLowerCase();
	if (gender.startsWith("f")) return `Ms. ${first}`;
	if (gender.startsWith("m")) return `Mr. ${first}`;
	return first;
}
function premiumText(row) {
	if (!row) return "No active Premium";
	const plan = row.plan || row.name || row.code || "Premium";
	const until = row.ends_at || row.expires_at || row.premium_until || row.valid_until;
	return until ? `${plan} until ${String(until).slice(0, 10)}` : String(plan);
}
function Line({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center justify-between gap-4 px-4 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
			className: "text-right",
			children: v
		})]
	});
}
function Block({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-card border border-line bg-paper p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-display text-2xl",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 grid gap-2",
			children
		})]
	});
}
function RowLine({ title, meta }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 border-b border-line py-2 last:border-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
			className: "text-muted",
			children: meta
		})]
	});
}
function AdminStack({ onChange }) {
	const { notify } = useGaceb();
	const [resources, setResources] = (0, import_react.useState)([]);
	const [donations, setDonations] = (0, import_react.useState)([]);
	const [premium, setPremium] = (0, import_react.useState)([]);
	const [purchases, setPurchases] = (0, import_react.useState)([]);
	const [students, setStudents] = (0, import_react.useState)([]);
	const [referrals, setReferrals] = (0, import_react.useState)([]);
	const [settings, setSettings] = (0, import_react.useState)({
		network: "",
		number: "",
		name: "",
		email: ""
	});
	async function load() {
		const db = getDb();
		if (!db) return;
		const [res, don, prem, buy, stu, ref, set] = await Promise.all([
			db.from("resources").select("id,title,subject,level").eq("status", "pending").order("created_at"),
			db.from("donations").select("id,donor_name,amount_ugx,provider_ref,payer_phone,message").eq("status", "pending").order("created_at"),
			db.from("premium_requests").select("id,plan,amount_ugx,provider_ref,payer_phone,created_at,profiles(full_name)").eq("status", "pending").order("created_at"),
			db.from("coin_purchases").select("id,coins,amount_ugx,provider_ref,payer_phone").eq("status", "pending").order("created_at"),
			db.from("profiles").select("full_name,email,level,coins,role").order("created_at", { ascending: false }).limit(40),
			db.from("referrals").select("id,referral_code,status,created_at").eq("status", "pending").limit(40),
			db.from("site_settings").select("key,value")
		]);
		setResources(res.data ?? []);
		setDonations(don.data ?? []);
		setPremium(prem.data ?? []);
		setPurchases(buy.data ?? []);
		setStudents(stu.data ?? []);
		setReferrals(ref.data ?? []);
		const next = {
			network: "",
			number: "",
			name: "",
			email: ""
		};
		for (const row of set.data ?? []) {
			if (row.key === "payment_network") next.network = row.value;
			if (row.key === "payment_number") next.number = row.value;
			if (row.key === "payment_name") next.name = row.value;
			if (row.key === "support_email") next.email = row.value;
		}
		setSettings(next);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function act(fn, id, ok) {
		const r = await callRpc(fn, fn === "approve_resource" || fn === "verify_referral" ? fn === "approve_resource" ? { resource_id: id } : { referral_id: id } : { p_id: id });
		notify(r.error ? r.error.message : ok);
		await load();
		await onChange();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4 rounded-card border border-gold bg-gold-soft p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Admin"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "PDFs waiting",
				children: [resources.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "No pending PDFs."
				}) : null, resources.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: String(x.title) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
						className: "block text-muted",
						children: [
							String(x.subject || ""),
							" · ",
							String(x.level || "")
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-primary",
						onClick: () => act("approve_resource", String(x.id), "PDF approved."),
						children: "Approve"
					})]
				}, String(x.id)))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-card bg-paper p-4",
				onSubmit: async (e) => {
					e.preventDefault();
					const db = getDb();
					if (!db) return;
					const fd = new FormData(e.currentTarget);
					const rows = [
						["payment_network", fd.get("network")],
						["payment_number", fd.get("number")],
						["payment_name", fd.get("pname")],
						["support_email", fd.get("email")]
					].map(([key, value]) => ({
						key,
						value: String(value || "").trim()
					}));
					const r = await db.from("site_settings").upsert(rows);
					clearPayCache();
					notify(r.error ? r.error.message : "Payment settings saved.");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-2xl",
						children: "Payment settings"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Students see these details when they pay. Never enter a PIN."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "network",
						defaultValue: settings.network,
						placeholder: "Network",
						maxLength: 60
					}, `n-${settings.network}`),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "number",
						defaultValue: settings.number,
						placeholder: "Mobile money number",
						maxLength: 40
					}, `num-${settings.number}`),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "pname",
						defaultValue: settings.name,
						placeholder: "Name on the account",
						maxLength: 60
					}, `p-${settings.name}`),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "email",
						type: "email",
						defaultValue: settings.email,
						placeholder: "Support email",
						maxLength: 80
					}, `e-${settings.email}`),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						children: "Save payment settings"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Queue, {
				title: "Donations",
				rows: donations,
				line: (x) => `${ugx(Number(x.amount_ugx))} · ${x.donor_name}`,
				sub: (x) => String(x.provider_ref || ""),
				ok: "confirm_donation",
				no: "reject_donation",
				onAct: act
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Queue, {
				title: "Premium requests",
				rows: premium,
				line: (x) => `${x.plan} · ${ugx(Number(x.amount_ugx))}`,
				sub: (x) => String(x.provider_ref || ""),
				ok: "approve_premium",
				no: "reject_premium",
				onAct: act
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Queue, {
				title: "Coin purchases",
				rows: purchases,
				line: (x) => `${x.coins} coins · ${ugx(Number(x.amount_ugx))}`,
				sub: (x) => String(x.provider_ref || ""),
				ok: "approve_coin_purchase",
				no: "reject_coin_purchase",
				onAct: act
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Students",
				children: [students.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "No students found."
				}) : null, students.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLine, {
					title: String(x.full_name || x.email || "Student"),
					meta: `${x.level || ""} · ${x.coins ?? 0} · ${x.role || ""}`
				}, i))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Referrals waiting",
				children: [referrals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "No pending referrals."
				}) : null, referrals.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: String(x.referral_code) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
						className: "block text-muted",
						children: String(x.created_at || "").slice(0, 10)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-primary",
						onClick: () => act("verify_referral", String(x.id), "Referral verified."),
						children: "Verify"
					})]
				}, String(x.id)))]
			})
		]
	});
}
function Queue({ title, rows, line, sub, ok, no, onAct }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
		title,
		children: [rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "Nothing waiting."
		}) : null, rows.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2 border-b border-line py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: line(x) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
				className: "block text-muted",
				children: sub(x)
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-primary",
					onClick: () => onAct(ok, String(x.id), "Confirmed."),
					children: "Confirm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-outline",
					onClick: () => onAct(no, String(x.id), "Rejected."),
					children: "Reject"
				})]
			})]
		}, String(x.id)))]
	});
}
//#endregion
export { DashboardPage as component };
