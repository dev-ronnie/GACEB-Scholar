export function assistantReply(t: string) {
  const s = t.toLowerCase();
  if (/stress|anxious|nervous|tired|overwhelm/.test(s))
    return "Pressure before exams is normal. Take a short break, drink water, sleep well, and study in small blocks. Pick one topic for the next 25 minutes and start there. Talk to a teacher or a trusted adult if the worry stays heavy.";
  if (/essay|composition|writing/.test(s))
    return "Plan before you write: list 3 to 5 main points, write a clear opening, give one idea per paragraph with evidence, and end with a short conclusion. Leave 5 minutes to check spelling and grammar.";
  if (/physics|chemistry|biology|science/.test(s))
    return "For science topics: learn the key terms, draw and label diagrams, memorise formulas with their units, and practise structured questions. Tell me the exact topic and your level for a focused plan.";
  if (/timetable|revision plan|schedule/.test(s))
    return "Start by listing your subjects and exam dates. Schedule 25–45 minute sessions, alternate demanding subjects, include breaks, and reserve time each week for past-paper practice. What class and subjects are you revising?";
  if (/remember|memor|forget|read/.test(s))
    return "Use active recall: close the book and explain the idea from memory. Review it after one day, three days and a week. Mix short written answers with practice questions instead of only rereading.";
  if (/past paper|exam|answer|uneb|brief/.test(s))
    return "Read the command word first, underline key terms, plan longer answers briefly, and watch the marks available. After marking, write down why each mistake happened and practise that skill again. UNEB briefing begins 6 November 2026 — keep your documents together.";
  if (/math|equation|calculate/.test(s))
    return "Write down what is given and what you need to find, choose the relevant rule, show each step, include units where needed, and check whether your answer is reasonable. Share the exact question for more targeted guidance.";
  if (/pdf|resource|notes/.test(s))
    return "Open the PDF Library and filter by level, category and resource type. Only approved materials appear for download.";
  if (/coin|referral|premium|payment/.test(s))
    return "Premium plans and GACEB coin packs are on the Coins & Premium page. You pay by Mobile Money, send your transaction ID, and GACEB adds your purchase after confirming the payment. Never share your PIN.";
  return "Break the topic into small ideas: read one section, write a summary from memory, answer a few questions, then explain the concept in your own words. Tell me your class, subject and exact topic and I can suggest a study approach.";
}
