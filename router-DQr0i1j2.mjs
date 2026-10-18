import { i as __toESM } from "../_runtime.mjs";
import { K as redirect, S as require_jsx_runtime, Y as require_react, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, x as useRouter, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Menu, g as Heart, n as TriangleAlert, t as X } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DQr0i1j2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
/** Public browser settings already used by GACEB Scholar. Do not rename these keys. */
var GACEB_CONFIG = {
	SUPABASE_URL: "https://wwiedsnmkqjlhxlkfquj.supabase.co",
	SUPABASE_ANON_KEY: "sb_publishable_OElqt_dsZWnkLxd-gykvjA_NO4AFJOT",
	DONATION_URL: "",
	WEEKLY_PAYMENT_URL: "",
	MONTHLY_PAYMENT_URL: "",
	SUPPORT_EMAIL: "gacebscholar@gmail.com"
};
var WHATSAPP_URL = "https://api.whatsapp.com/send?phone=+256743766451";
var UNEB_BRIEFING = /* @__PURE__ */ new Date("2026-11-06T00:00:00+03:00");
var DEFAULT_NUMS = ["0743766451", "0783165623"];
var DEFAULT_PACKS = [
	{
		coins: 150,
		amount_ugx: 1e4,
		label: "Starter"
	},
	{
		coins: 500,
		amount_ugx: 25e3,
		label: "Popular"
	},
	{
		coins: 1e3,
		amount_ugx: 4e4,
		label: "Best value"
	}
];
var DEFAULT_PLANS = [
	{
		code: "daily",
		name: "Daily",
		hours: 24,
		amount_ugx: 2e3
	},
	{
		code: "weekly",
		name: "Weekly",
		hours: 168,
		amount_ugx: 7e3
	},
	{
		code: "monthly",
		name: "Monthly",
		hours: 720,
		amount_ugx: 2e4
	},
	{
		code: "yearly",
		name: "Yearly",
		hours: 8760,
		amount_ugx: 15e4
	}
];
var client = null;
function getDb() {
	if (typeof window === "undefined") return null;
	if (!client) client = createClient(GACEB_CONFIG.SUPABASE_URL, GACEB_CONFIG.SUPABASE_ANON_KEY, { auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true
	} });
	return client;
}
async function callRpc(fn, args) {
	const db = getDb();
	if (!db) return {
		data: null,
		error: { message: "Sign-in is not available right now." }
	};
	const rpc = db.rpc;
	return rpc(fn, args);
}
var GacebContext = (0, import_react.createContext)(null);
function useGaceb() {
	const ctx = (0, import_react.useContext)(GacebContext);
	if (!ctx) throw new Error("useGaceb outside provider");
	return ctx;
}
function GacebProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [toast, setToast] = (0, import_react.useState)(null);
	const [dialog, setDialog] = (0, import_react.useState)(null);
	const [authMode, setAuthMode] = (0, import_react.useState)(null);
	const timer = (0, import_react.useRef)(null);
	const notify = (0, import_react.useCallback)((msg) => {
		setToast(msg);
		if (timer.current) window.clearTimeout(timer.current);
		timer.current = window.setTimeout(() => setToast(null), 3800);
	}, []);
	const refresh = (0, import_react.useCallback)(async () => {
		const db = getDb();
		if (!db) {
			setReady(true);
			return;
		}
		try {
			const s = (await db.auth.getSession()).data.session;
			setSession(s);
			if (s) {
				const p = await db.from("profiles").select("*").eq("id", s.user.id).maybeSingle();
				setProfile(p.data ?? null);
			} else setProfile(null);
		} catch {} finally {
			setReady(true);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const ref = new URLSearchParams(window.location.search).get("ref");
		if (ref) sessionStorage.setItem("gaceb-ref", ref);
		const db = getDb();
		refresh();
		if (!db) return;
		const sub = db.auth.onAuthStateChange(() => {
			window.setTimeout(() => void refresh(), 0);
		});
		return () => sub.data.subscription.unsubscribe();
	}, [refresh]);
	(0, import_react.useEffect)(() => {
		if (!dialog && !authMode) return;
		const onKey = (e) => {
			if (e.key === "Escape") {
				setDialog(null);
				setAuthMode(null);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [dialog, authMode]);
	const closeDialog = (0, import_react.useCallback)(() => {
		setDialog(null);
		setAuthMode(null);
	}, []);
	const openDialog = (0, import_react.useCallback)((node) => {
		setAuthMode(null);
		setDialog(node);
	}, []);
	const openAuth = (0, import_react.useCallback)((mode = "login") => {
		setDialog(null);
		setAuthMode(mode);
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		session,
		profile,
		ready,
		isAdmin: profile?.role === "admin",
		notify,
		refresh,
		openDialog,
		closeDialog,
		openAuth
	}), [
		session,
		profile,
		ready,
		notify,
		refresh,
		openDialog,
		closeDialog,
		openAuth
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GacebContext.Provider, {
		value,
		children: [
			children,
			toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "status",
				className: "fixed bottom-20 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-paper shadow-lg",
				children: toast
			}) : null,
			dialog || authMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-end bg-ink/50 p-0 sm:place-items-center sm:p-4",
				onClick: closeDialog,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper p-5 shadow-2xl sm:rounded-card",
					onClick: (e) => e.stopPropagation(),
					role: "dialog",
					"aria-modal": "true",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-outline min-h-10 px-3",
							onClick: closeDialog,
							"aria-label": "Close",
							children: "Close"
						})
					}), authMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPanel, {
						mode: authMode,
						onMode: setAuthMode
					}) : dialog]
				})
			}) : null
		]
	});
}
function AuthPanel({ mode, onMode }) {
	const { notify, closeDialog, refresh } = useGaceb();
	const [status, setStatus] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const refCode = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("gaceb-ref") || "" : "";
	async function onSubmit(e) {
		e.preventDefault();
		const db = getDb();
		const fd = new FormData(e.currentTarget);
		if (!db) {
			setStatus("Sign-in is not available right now.");
			return;
		}
		setBusy(true);
		setStatus("Please wait…");
		try {
			if (mode === "signup") {
				const result = await db.auth.signUp({
					email: String(fd.get("email") || ""),
					password: String(fd.get("password") || ""),
					options: { data: {
						full_name: fd.get("full_name"),
						school: fd.get("school"),
						level: fd.get("level"),
						referral_code: fd.get("referral_code")
					} }
				});
				if (result.error) throw result.error;
				setStatus("Account created. Check your email if confirmation is on.");
			} else {
				const result = await db.auth.signInWithPassword({
					email: String(fd.get("email") || ""),
					password: String(fd.get("password") || "")
				});
				if (result.error) throw result.error;
				setStatus("You are logged in.");
			}
			await refresh();
			notify(mode === "signup" ? "Account created" : "Welcome back");
			window.setTimeout(closeDialog, 700);
		} catch (err) {
			setStatus(err instanceof Error ? err.message : "Authentication failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-3xl text-balance",
			children: mode === "signup" ? "Create your account" : "Log in to GACEB Scholar"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3",
			onSubmit,
			children: [
				mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Full name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "full_name",
							required: true,
							maxLength: 100
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["School", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "school",
							maxLength: 150
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Study level", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "field",
							name: "level",
							defaultValue: "O-Level",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "O-Level" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "A-Level" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-medium",
						children: ["Referral code (optional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							name: "referral_code",
							defaultValue: refCode
						})]
					})
				] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm font-medium",
					children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "email",
						type: "email",
						required: true,
						autoComplete: "email"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm font-medium",
					children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "password",
						type: "password",
						required: true,
						minLength: 6,
						autoComplete: mode === "signup" ? "new-password" : "current-password"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					disabled: busy,
					children: mode === "signup" ? "Create account" : "Log in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					role: "status",
					children: status
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "btn btn-outline mt-2 w-full",
			onClick: () => onMode(mode === "signup" ? "login" : "signup"),
			children: mode === "signup" ? "I already have an account" : "Create a new account"
		})
	] });
}
var LINKS = [
	{
		to: "/",
		label: "Home"
	},
	{
		to: "/courses",
		label: "Courses"
	},
	{
		to: "/library",
		label: "PDF Library"
	},
	{
		to: "/events",
		label: "Live Events"
	},
	{
		to: "/planner",
		label: "Study Planner"
	},
	{
		to: "/announcements",
		label: "Announcements"
	},
	{
		to: "/coins",
		label: "Coins & Premium"
	},
	{
		to: "/assistant",
		label: "Gauge"
	},
	{
		to: "/dashboard",
		label: "Dashboard"
	},
	{
		to: "/about",
		label: "About"
	},
	{
		to: "/contact",
		label: "Contact"
	}
];
function Crest({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/brand/gaceb-logo.png",
		alt: "Gauge-Caliper Examination Board",
		className: className ?? "h-12 w-auto"
	});
}
function PageIntro({ kicker, title, lede }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "mb-8 max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-[0.18em] text-gold-deep uppercase",
				children: kicker
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl leading-tight text-balance text-ink sm:text-5xl",
				children: title
			}),
			lede ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-lg text-pretty text-muted",
				children: lede
			}) : null
		]
	});
}
function Shell({ children }) {
	const path = useRouterState({ select: (s) => s.location.pathname });
	const { session, openAuth } = useGaceb();
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [path]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#content",
				className: "sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-paper focus:p-3",
				children: "Skip to content"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex min-w-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, { className: "h-14 w-auto shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-display text-lg leading-none text-ink",
								children: ["GACEB ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									className: "text-forest",
									children: "Scholar"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-2",
							children: [session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/dashboard",
								className: "btn btn-primary hidden sm:inline-flex",
								children: "My account"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-primary hidden sm:inline-flex",
								onClick: () => openAuth("login"),
								children: "Log in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-outline min-w-11 px-3 lg:hidden",
								"aria-label": open ? "Close navigation" : "Open navigation",
								onClick: () => setOpen((v) => !v),
								children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mx-auto hidden w-full max-w-6xl gap-1 overflow-x-auto px-4 pb-2 lg:flex",
						"aria-label": "Primary",
						children: LINKS.map((l) => {
							const active = l.to === "/" ? path === "/" : path === l.to;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: l.to,
								className: `shrink-0 rounded-full px-3 py-2 text-sm font-medium ${active ? "bg-forest text-paper" : "text-muted hover:bg-sage hover:text-forest"}`,
								children: l.label
							}, l.to);
						})
					}),
					open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "grid gap-1 border-t border-line px-3 py-3 lg:hidden",
						"aria-label": "Mobile",
						children: [LINKS.map((l) => {
							const active = l.to === "/" ? path === "/" : path === l.to;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: l.to,
								className: `rounded-2xl px-3 py-3 text-base font-medium ${active ? "bg-forest text-paper" : "text-ink hover:bg-sage"}`,
								children: l.label
							}, l.to);
						}), session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							className: "btn btn-primary mt-1",
							children: "My account"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-primary mt-1",
							onClick: () => openAuth("login"),
							children: "Log in"
						})]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				id: "content",
				className: "mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-28",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "border-t border-line bg-paper",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, { className: "h-16 w-auto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
							className: "font-display text-lg",
							children: "GACEB Scholar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Learn today · Build tomorrow"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/courses",
								className: "hover:text-forest",
								children: "Courses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/library",
								className: "hover:text-forest",
								children: "PDF Library"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/events",
								className: "hover:text-forest",
								children: "Live Events"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/coins",
								className: "hover:text-forest",
								children: "Coins"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/contact",
								className: "hover:text-forest",
								children: "Contact"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/donate",
								className: "hover:text-forest",
								children: "Donate"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "pb-6 text-center text-sm text-muted",
					children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" GACEB Scholar · Made for learners."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/donate",
				className: "btn btn-gold fixed right-4 bottom-4 z-30 hidden shadow-lg sm:inline-flex",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
					className: "size-4 fill-current",
					"aria-hidden": true
				}), "Donate"]
			})
		]
	});
}
var styles_default = "/assets/styles-B0CwUtQW.css";
var Route$14 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "GACEB Scholar" },
			{
				name: "description",
				content: "Uganda curriculum learning for O-Level and A-Level students."
			},
			{
				name: "theme-color",
				content: "#0e5c43"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/png",
				href: "/brand/icon-192.png"
			},
			{
				rel: "apple-touch-icon",
				href: "/brand/icon-192.png"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600;700&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GacebProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$13 = () => import("./routes-1MrQnnX5.mjs");
var Route$13 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Home | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./about-N7wwH1pd.mjs");
var Route$12 = createFileRoute("/about")({
	head: () => ({ meta: [{ title: "About | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./announcements-BZnmJozL.mjs");
var Route$11 = createFileRoute("/announcements")({
	head: () => ({ meta: [{ title: "Announcements | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./assistant-D04YQhB9.mjs");
var Route$10 = createFileRoute("/assistant")({
	head: () => ({ meta: [{ title: "Gauge | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./coins-8dCPYJKw.mjs");
var Route$9 = createFileRoute("/coins")({
	head: () => ({ meta: [{ title: "Coins & Premium | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./contact-LUtyYoit.mjs");
var Route$8 = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: "Contact | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./courses-CkgHhvmw.mjs");
var Route$7 = createFileRoute("/courses")({
	head: () => ({ meta: [{ title: "Courses | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./dashboard-QjI9ysLW.mjs");
var Route$6 = createFileRoute("/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./donate-CyvGPxdK.mjs");
var Route$5 = createFileRoute("/donate")({
	head: () => ({ meta: [{ title: "Donate | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./events-8rjIFhpb.mjs");
var Route$4 = createFileRoute("/events")({
	head: () => ({ meta: [{ title: "Live Events | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./library-BqkKU728.mjs");
var Route$3 = createFileRoute("/library")({
	validateSearch: (search) => {
		const level = typeof search.level === "string" ? search.level : "";
		return level ? { level } : {};
	},
	head: () => ({ meta: [{ title: "PDF Library | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./notices-C2WrzTqu.mjs");
var Route$2 = createFileRoute("/notices")({
	beforeLoad: () => {
		throw redirect({ to: "/events" });
	},
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./planner-CQQ0iRl-.mjs");
var Route$1 = createFileRoute("/planner")({
	head: () => ({ meta: [{ title: "Study Planner | GACEB Scholar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./quizzes-CE-It_sU.mjs");
var Route = createFileRoute("/quizzes")({
	beforeLoad: () => {
		throw redirect({ to: "/events" });
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$13.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$14
	}),
	AboutRoute: Route$12.update({
		id: "/about",
		path: "/about",
		getParentRoute: () => Route$14
	}),
	AnnouncementsRoute: Route$11.update({
		id: "/announcements",
		path: "/announcements",
		getParentRoute: () => Route$14
	}),
	AssistantRoute: Route$10.update({
		id: "/assistant",
		path: "/assistant",
		getParentRoute: () => Route$14
	}),
	CoinsRoute: Route$9.update({
		id: "/coins",
		path: "/coins",
		getParentRoute: () => Route$14
	}),
	ContactRoute: Route$8.update({
		id: "/contact",
		path: "/contact",
		getParentRoute: () => Route$14
	}),
	CoursesRoute: Route$7.update({
		id: "/courses",
		path: "/courses",
		getParentRoute: () => Route$14
	}),
	DashboardRoute: Route$6.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => Route$14
	}),
	DonateRoute: Route$5.update({
		id: "/donate",
		path: "/donate",
		getParentRoute: () => Route$14
	}),
	EventsRoute: Route$4.update({
		id: "/events",
		path: "/events",
		getParentRoute: () => Route$14
	}),
	LibraryRoute: Route$3.update({
		id: "/library",
		path: "/library",
		getParentRoute: () => Route$14
	}),
	NoticesRoute: Route$2.update({
		id: "/notices",
		path: "/notices",
		getParentRoute: () => Route$14
	}),
	PlannerRoute: Route$1.update({
		id: "/planner",
		path: "/planner",
		getParentRoute: () => Route$14
	}),
	QuizzesRoute: Route.update({
		id: "/quizzes",
		path: "/quizzes",
		getParentRoute: () => Route$14
	})
};
var routeTree = Route$14._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { useGaceb as a, DEFAULT_NUMS as c, GACEB_CONFIG as d, UNEB_BRIEFING as f, PageIntro as i, DEFAULT_PACKS as l, Route$3 as n, callRpc as o, WHATSAPP_URL as p, Crest as r, getDb as s, router_exports as t, DEFAULT_PLANS as u };
