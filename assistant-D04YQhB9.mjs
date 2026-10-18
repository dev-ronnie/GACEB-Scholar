import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as useGaceb, i as PageIntro, s as getDb } from "./router-DQr0i1j2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assistant-D04YQhB9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function assistantReply(t) {
	const s = t.toLowerCase();
	if (/stress|anxious|nervous|tired|overwhelm/.test(s)) return "Pressure before exams is normal. Take a short break, drink water, sleep well, and study in small blocks. Pick one topic for the next 25 minutes and start there. Talk to a teacher or a trusted adult if the worry stays heavy.";
	if (/essay|composition|writing/.test(s)) return "Plan before you write: list 3 to 5 main points, write a clear opening, give one idea per paragraph with evidence, and end with a short conclusion. Leave 5 minutes to check spelling and grammar.";
	if (/physics|chemistry|biology|science/.test(s)) return "For science topics: learn the key terms, draw and label diagrams, memorise formulas with their units, and practise structured questions. Tell me the exact topic and your level for a focused plan.";
	if (/timetable|revision plan|schedule/.test(s)) return "Start by listing your subjects and exam dates. Schedule 25–45 minute sessions, alternate demanding subjects, include breaks, and reserve time each week for past-paper practice. What class and subjects are you revising?";
	if (/remember|memor|forget|read/.test(s)) return "Use active recall: close the book and explain the idea from memory. Review it after one day, three days and a week. Mix short written answers with practice questions instead of only rereading.";
	if (/past paper|exam|answer|uneb|brief/.test(s)) return "Read the command word first, underline key terms, plan longer answers briefly, and watch the marks available. After marking, write down why each mistake happened and practise that skill again. UNEB briefing begins 6 November 2026 — keep your documents together.";
	if (/math|equation|calculate/.test(s)) return "Write down what is given and what you need to find, choose the relevant rule, show each step, include units where needed, and check whether your answer is reasonable. Share the exact question for more targeted guidance.";
	if (/pdf|resource|notes/.test(s)) return "Open the PDF Library and filter by level, category and resource type. Only approved materials appear for download.";
	if (/coin|referral|premium|payment/.test(s)) return "Premium plans and GACEB coin packs are on the Coins & Premium page. You pay by Mobile Money, send your transaction ID, and GACEB adds your purchase after confirming the payment. Never share your PIN.";
	return "Break the topic into small ideas: read one section, write a summary from memory, answer a few questions, then explain the concept in your own words. Tell me your class, subject and exact topic and I can suggest a study approach.";
}
var PROMPTS = [
	"Help me make a revision timetable",
	"How do I remember what I read?",
	"How should I answer past papers?",
	"Help me understand a difficult topic"
];
async function ask(history, text, signedIn) {
	await new Promise((r) => setTimeout(r, 400));
	if (!signedIn) return assistantReply(text) + " Log in if you want the connected Gauge chat.";
	const db = getDb();
	if (!db) return assistantReply(text);
	const next = [...history, {
		role: "user",
		content: text
	}].slice(-8);
	try {
		const reply = (await db.functions.invoke("gauge-assistant", { body: { messages: next } })).data?.reply;
		if (reply) return reply;
		return assistantReply(text);
	} catch {
		return assistantReply(text);
	}
}
function AssistantPage() {
	const { session } = useGaceb();
	const [messages, setMessages] = (0, import_react.useState)([{
		role: "bot",
		text: "Hello. Tell me your class, subject and topic. I can offer study strategies and help you plan revision."
	}]);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)("");
	async function send(text) {
		const t = text.trim();
		if (!t || busy) return;
		setMessages((m) => [...m, {
			role: "user",
			text: t
		}]);
		setDraft("");
		setBusy(true);
		const reply = await ask(history, t, Boolean(session));
		setHistory((h) => [
			...h,
			{
				role: "user",
				content: t
			},
			{
				role: "assistant",
				content: reply
			}
		].slice(-8));
		setMessages((m) => [...m, {
			role: "bot",
			text: reply
		}]);
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[0.8fr_1.2fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
				kicker: "Your study companion",
				title: "Gauge",
				lede: "Ask for a study plan, a way to remember, or how to face a past paper."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: PROMPTS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-2xl border border-line bg-paper px-4 py-3 text-left font-medium hover:border-forest",
					onClick: () => setDraft(p),
					children: p
				}, p))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Guidance works on this device. A signed-in chat uses Gauge when that service is connected."
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex min-h-[28rem] flex-col rounded-card border border-line bg-paper",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-3 overflow-y-auto p-4",
					children: [messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `max-w-[90%] rounded-2xl px-4 py-3 text-pretty leading-relaxed ${m.role === "user" ? "ml-auto bg-forest text-paper" : "bg-cream text-ink"}`,
						children: m.text
					}, i)), busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Gauge is thinking…"
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex gap-2 border-t border-line p-3",
					onSubmit: (e) => {
						e.preventDefault();
						send(draft);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						placeholder: "Ask a study question…",
						required: true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						children: "Send"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-outline m-3 mt-0",
					onClick: () => {
						setHistory([]);
						setMessages([{
							role: "bot",
							text: "Chat cleared. What would you like to study?"
						}]);
					},
					children: "Clear chat"
				})
			]
		})]
	});
}
//#endregion
export { AssistantPage as component };
