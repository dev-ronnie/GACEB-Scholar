import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PayPanel } from "@/components/pay-panel";
import { PageIntro } from "@/components/shell";
import { DEFAULT_PACKS, DEFAULT_PLANS } from "@/lib/config";
import { dupMsg, planLen, ugx } from "@/lib/format";
import { useGaceb } from "@/lib/gaceb";
import { callRpc, getDb } from "@/lib/supabase";

type Pack = { coins: number; amount_ugx: number; label?: string | null };
type Plan = { code: string; name: string; hours: number; amount_ugx: number };

export const Route = createFileRoute("/coins")({
  head: () => ({ meta: [{ title: "Coins & Premium | GACEB Scholar" }] }),
  component: CoinsPage,
});

function CoinsPage() {
  const { session, profile, openAuth, notify, refresh, openDialog, closeDialog } = useGaceb();
  const [packs, setPacks] = useState<Pack[]>([...DEFAULT_PACKS]);
  const [plans, setPlans] = useState<Plan[]>([...DEFAULT_PLANS]);
  const [referral, setReferral] = useState("");

  useEffect(() => {
    const db = getDb();
    if (!db) return;
    void db.from("coin_packs").select("coins,amount_ugx,label").order("sort").then((r) => {
      if (r.data?.length) setPacks(r.data as Pack[]);
    });
    void db.from("premium_plans").select("code,name,hours,amount_ugx").eq("active", true).order("sort").then((r) => {
      if (r.data?.length) setPlans(r.data as Plan[]);
    });
  }, []);

  function requireLogin() {
    openAuth("login");
    notify("Log in first");
    return false;
  }

  function buy(pack: Pack) {
    if (!session) return requireLogin();
    openDialog(
      <div>
        <h2 className="mb-3 font-display text-3xl">Buy {pack.coins} GACEB coins</h2>
        <PayPanel
          amount={Number(pack.amount_ugx)}
          label={`${pack.coins} GACEB coins`}
          onSubmit={async (ref, phone) => {
            const r = await callRpc("request_coin_purchase", { p_coins: pack.coins, p_ref: ref, p_phone: phone });
            if (r.error) return dupMsg(r.error.message);
            void refresh();
            return true;
          }}
        />
      </div>,
    );
  }

  function choose(plan: Plan) {
    if (!session) return requireLogin();
    openDialog(
      <div>
        <h2 className="mb-3 font-display text-3xl">{plan.name} Premium</h2>
        <PayPanel
          amount={Number(plan.amount_ugx)}
          label={`${plan.name} Premium plan`}
          onSubmit={async (ref, phone) => {
            const r = await callRpc("request_premium", { p_plan: plan.code, p_ref: ref, p_phone: phone });
            if (r.error) return dupMsg(r.error.message);
            void refresh();
            return true;
          }}
        />
      </div>,
    );
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

  return (
    <div className="grid gap-8">
      <PageIntro
        kicker="Learn · Contribute · Earn"
        title="GACEB coins & Premium"
        lede="You need an account to buy coins or subscribe. Coins and Premium start only after GACEB confirms your Mobile Money payment."
      />
      <section>
        <h2 className="font-display text-3xl">Buy coins</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {packs.map((p, i) => (
            <article key={`${p.coins}-${i}`} className={`rounded-card border bg-paper p-5 ${i === packs.length - 1 ? "border-gold" : "border-line"}`}>
              {p.label ? <p className="text-xs font-bold tracking-widest text-gold-deep uppercase">{p.label}</p> : null}
              <p className="mt-2 font-display text-4xl">{p.coins} <span className="text-lg text-muted">coins</span></p>
              <p className="text-xl font-semibold">{ugx(Number(p.amount_ugx))}</p>
              <p className="text-sm text-muted">Sh. {Math.round(Number(p.amount_ugx) / Number(p.coins))} per coin</p>
              <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => buy(p)}>Buy {p.coins}</button>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-display text-3xl">Premium</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <article key={p.code} className={`rounded-card border bg-paper p-5 ${p.code === "yearly" ? "border-gold bg-gold-soft" : "border-line"}`}>
              <h3 className="font-display text-2xl">{p.name}</h3>
              <p className="mt-1 text-2xl font-semibold">{ugx(Number(p.amount_ugx))}</p>
              <p className="text-sm text-muted">{planLen(Number(p.hours))} of Premium</p>
              <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => choose(p)}>Choose</button>
            </article>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">A new Premium purchase replaces the current plan and starts a fresh timer. Premium opens documents marked Premium as they are published.</p>
      </section>
      <section className="grid gap-3">
        <article className="rounded-card border border-line bg-paper p-5">
          <h2 className="font-display text-2xl">Earn</h2>
          <p className="mt-1"><b>5 coins</b> when an administrator approves your PDF.</p>
          <p><b>5 coins</b> when an administrator verifies a genuine referral.</p>
          <Link to="/dashboard" className="btn btn-outline mt-3" onClick={(e) => { if (!session) { e.preventDefault(); closeDialog(); openAuth("login"); } }}>View my account</Link>
        </article>
        <article className="rounded-card border border-line bg-paper p-5">
          <h2 className="font-display text-2xl">Invite a classmate</h2>
          <button type="button" className="btn btn-outline mt-3" onClick={() => void invite()}>Create my invite link</button>
          {referral ? <input className="field mt-3" readOnly value={referral} onFocus={(e) => e.currentTarget.select()} /> : null}
        </article>
        <article className="rounded-card border border-line bg-paper p-5">
          <h2 className="font-display text-2xl">Donate</h2>
          <p className="text-muted">Every gift is checked before it is recorded.</p>
          <Link to="/donate" className="btn btn-gold mt-3">Donate to GACEB</Link>
        </article>
      </section>
      <p className="rounded-2xl bg-gold-soft px-4 py-3 text-sm">Never share your Mobile Money PIN.</p>
    </div>
  );
}
