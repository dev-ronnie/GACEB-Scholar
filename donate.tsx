import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { PayPanel } from "@/components/pay-panel";
import { PageIntro } from "@/components/shell";
import { GACEB_CONFIG } from "@/lib/config";
import { dupMsg, ugx } from "@/lib/format";
import { callRpc } from "@/lib/supabase";

const CHIPS = [5000, 10000, 20000, 50000, 100000];

export const Route = createFileRoute("/donate")({
  head: () => ({ meta: [{ title: "Donate | GACEB Scholar" }] }),
  component: DonatePage,
});

function DonatePage() {
  const [step, setStep] = useState<"choose" | "pay" | "done">("choose");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  function go(e: React.FormEvent) {
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
    if (amt > 100000000) {
      setErr("Please contact GACEB for gifts above UGX 100,000,000.");
      return;
    }
    setErr("");
    setStep("pay");
  }

  const donor = name.trim() || "Anonymous";

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <PageIntro kicker="Support learning" title="Donate to GACEB" lede="Give any amount you can. Every shilling helps a student learn." />
      <article className="rounded-card bg-forest p-6 text-paper">
        <Heart className="size-6 text-gold" />
        <h2 className="mt-2 font-display text-3xl text-balance">Thank you, from the whole GACEB family</h2>
        <p className="mt-3 text-pretty leading-relaxed text-paper/90">
          Behind every note shared is a young person who refuses to give up. Whatever you give tells that student someone believes in them. We will use it carefully.
        </p>
        <p className="mt-3 font-display text-xl">With gratitude, Sr. Gauge and the GACEB family</p>
      </article>
      {step === "choose" ? (
        <form className="grid gap-3 rounded-card border border-line bg-paper p-5" onSubmit={go}>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((n) => (
              <button key={n} type="button" className={`btn ${amount === String(n) ? "btn-primary" : "btn-outline"}`} onClick={() => { setAmount(String(n)); setErr(""); }}>
                {n.toLocaleString("en-UG")}
              </button>
            ))}
          </div>
          <label className="grid gap-1 text-sm font-medium">Amount in UGX<input className="field" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 7500" required /></label>
          <label className="grid gap-1 text-sm font-medium">Your name (optional)<input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></label>
          <label className="grid gap-1 text-sm font-medium">A message (optional)<textarea className="field min-h-24" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} /></label>
          <p className="text-sm text-burgundy">{err}</p>
          <button className="btn btn-gold">Continue</button>
          <p className="text-sm text-muted">The smallest gift is UGX 500. A donation is recorded only after GACEB confirms the payment.</p>
        </form>
      ) : null}
      {step === "pay" ? (
        <div className="rounded-card border border-line bg-paper p-5">
          <PayPanel
            amount={Number(amount)}
            label="Donation to GACEB"
            onSubmit={async (ref, phone) => {
              const r = await callRpc("submit_donation", {
                p_name: donor,
                p_amount: Number(amount),
                p_ref: ref,
                p_phone: phone,
                p_message: message.trim(),
              });
              if (r.error) return dupMsg(r.error.message);
              setStep("done");
              return true;
            }}
          />
          {GACEB_CONFIG.DONATION_URL ? (
            <a className="btn btn-outline mt-3" href={GACEB_CONFIG.DONATION_URL} rel="noreferrer">Pay online instead</a>
          ) : null}
          <button type="button" className="btn btn-outline mt-3" onClick={() => setStep("choose")}>Change amount</button>
        </div>
      ) : null}
      {step === "done" ? (
        <div className="rounded-card bg-gold-soft p-6 text-center">
          <h2 className="font-display text-3xl">Thank you, {donor === "Anonymous" ? "dear friend" : donor}</h2>
          <p className="mt-3 text-pretty">Your gift of <b>{ugx(Number(amount))}</b> has reached us. We will confirm the payment and put it to work with care.</p>
          <p className="mt-3 font-display text-xl">May God bless you abundantly.</p>
          <Link to="/" className="btn btn-primary mt-4">Back to home</Link>
        </div>
      ) : null}
    </div>
  );
}
