import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { clearPayCache } from "@/components/pay-panel";
import { PageIntro } from "@/components/shell";
import { ugx } from "@/lib/format";
import { useGaceb, type Profile } from "@/lib/gaceb";
import { callRpc, getDb } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | GACEB Scholar" }] }),
  component: DashboardPage,
});

const TIERS: [string, number][] = [
  ["New Scholar", 0],
  ["Bronze Scholar", 20],
  ["Silver Scholar", 100],
  ["Gold Scholar", 500],
];

const WHY: Record<string, string> = {
  approved_upload: "PDF approved",
  verified_referral: "Referral verified",
  coin_purchase: "Coins purchased",
  admin_adjustment: "Adjustment",
  premium_reward: "Reward",
};

type Row = Record<string, unknown>;

function DashboardPage() {
  const { session, profile, ready, isAdmin, openAuth, notify, refresh } = useGaceb();
  const [data, setData] = useState<{
    ups: Row[];
    tx: Row[];
    buys: Row[];
    prem: Row | null;
    subs: Row[];
  } | null>(null);

  useEffect(() => {
    if (!session) {
      setData(null);
      return;
    }
    const db = getDb();
    if (!db) return;
    let cancel = false;
    void (async () => {
      const [ups, tx, buys, prem, subs] = await Promise.all([
        db.from("resources").select("title,subject,status,created_at").eq("uploaded_by", session.user.id).order("created_at", { ascending: false }).limit(20),
        db.from("coin_transactions").select("amount,reason,created_at").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(8),
        db.from("coin_purchases").select("coins,amount_ugx,status,created_at").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(8),
        callRpc("my_premium", {}),
        db.from("premium_requests").select("plan,amount_ugx,status,created_at").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(8),
      ]);
      if (cancel) return;
      const premRow = Array.isArray(prem.data) ? (prem.data[0] as Row | undefined) ?? null : (prem.data as Row | null);
      setData({
        ups: (ups.data as Row[]) ?? [],
        tx: (tx.data as Row[]) ?? [],
        buys: (buys.data as Row[]) ?? [],
        prem: premRow,
        subs: subs.error ? [] : ((subs.data as Row[]) ?? []),
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
  const pct = next ? Math.min(100, Math.round(((coins - tier[1]) / (next[1] - tier[1])) * 100)) : 100;
  const title = greetingTitle(profile);

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <PageIntro kicker="Your learning space" title="Dashboard" lede="Your account, from top to bottom." />
      <section className="rounded-card border border-line bg-paper p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl">{session ? `Welcome back, ${title}` : "Welcome, learner"}</h2>
          {session ? (
            <button
              type="button"
              className="btn btn-outline"
              onClick={async () => {
                await getDb()?.auth.signOut();
                notify("Logged out");
                await refresh();
              }}
            >
              Log out
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => openAuth("login")}>Log in / Create account</button>
          )}
        </div>
        {!session && ready ? <p className="mt-4 text-muted">Sign in to see your coins, payments and progress in one column.</p> : null}
      </section>

      {session && data ? (
        <>
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-paper">
            <Line k="Name" v={name} />
            <Line k="School" v={profile?.school || "—"} />
            <Line k="Level" v={profile?.level || "—"} />
            <Line k="Coins" v={String(coins)} />
            <Line k="Standing" v={tier[0]} />
            <li className="px-4 py-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>Progress to {next ? next[0] : "the top"}</span>
                <b className="tabular-nums">{pct}%</b>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sage">
                <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
              </div>
            </li>
            <Line k="Premium" v={premiumText(data.prem)} />
            <Line k="Referral code" v={profile?.referral_code || "Not ready yet"} />
          </ul>

          <Block title="Coin activity">
            {data.tx.length === 0 ? <p className="text-muted">No coin activity yet.</p> : null}
            {data.tx.map((x, i) => (
              <RowLine key={i} title={`${Number(x.amount) > 0 ? "+" : ""}${x.amount} · ${WHY[String(x.reason)] || String(x.reason || "Update")}`} meta={String(x.created_at || "").slice(0, 10)} />
            ))}
          </Block>
          <Block title="Coin payments">
            {data.buys.length === 0 ? <p className="text-muted">No coin payments yet.</p> : null}
            {data.buys.map((x, i) => (
              <RowLine key={i} title={`${x.coins} coins · ${ugx(Number(x.amount_ugx || 0))}`} meta={String(x.status || "")} />
            ))}
          </Block>
          <Block title="Premium history">
            {data.subs.length === 0 ? <p className="text-muted">No Premium requests yet.</p> : null}
            {data.subs.map((x, i) => (
              <RowLine key={i} title={`${x.plan} · ${ugx(Number(x.amount_ugx || 0))}`} meta={String(x.status || "")} />
            ))}
          </Block>
          <Block title="Your uploads">
            {data.ups.length === 0 ? <p className="text-muted">No uploads yet.</p> : null}
            {data.ups.map((x, i) => (
              <RowLine key={i} title={String(x.title || "PDF")} meta={`${x.subject || ""} · ${x.status || ""}`} />
            ))}
          </Block>
        </>
      ) : null}

      {session && isAdmin ? <AdminStack onChange={refresh} /> : null}
    </div>
  );
}

function greetingTitle(profile: Profile | null) {
  const raw = profile?.full_name?.trim() || "";
  const first = raw.split(" ")[0] || "learner";
  const gender = (profile?.gender || "").toLowerCase();
  if (gender.startsWith("f")) return `Ms. ${first}`;
  if (gender.startsWith("m")) return `Mr. ${first}`;
  return first;
}

function premiumText(row: Row | null) {
  if (!row) return "No active Premium";
  const plan = row.plan || row.name || row.code || "Premium";
  const until = row.ends_at || row.expires_at || row.premium_until || row.valid_until;
  return until ? `${plan} until ${String(until).slice(0, 10)}` : String(plan);
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-4">
      <span className="text-muted">{k}</span>
      <b className="text-right">{v}</b>
    </li>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-paper p-5">
      <h3 className="font-display text-2xl">{title}</h3>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}

function RowLine({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0">
      <span>{title}</span>
      <small className="text-muted">{meta}</small>
    </div>
  );
}

function AdminStack({ onChange }: { onChange: () => Promise<void> }) {
  const { notify } = useGaceb();
  const [resources, setResources] = useState<Row[]>([]);
  const [donations, setDonations] = useState<Row[]>([]);
  const [premium, setPremium] = useState<Row[]>([]);
  const [purchases, setPurchases] = useState<Row[]>([]);
  const [students, setStudents] = useState<Row[]>([]);
  const [referrals, setReferrals] = useState<Row[]>([]);
  const [settings, setSettings] = useState({ network: "", number: "", name: "", email: "" });

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
      db.from("site_settings").select("key,value"),
    ]);
    setResources((res.data as Row[]) ?? []);
    setDonations((don.data as Row[]) ?? []);
    setPremium((prem.data as Row[]) ?? []);
    setPurchases((buy.data as Row[]) ?? []);
    setStudents((stu.data as Row[]) ?? []);
    setReferrals((ref.data as Row[]) ?? []);
    const next = { network: "", number: "", name: "", email: "" };
    for (const row of (set.data ?? []) as { key: string; value: string }[]) {
      if (row.key === "payment_network") next.network = row.value;
      if (row.key === "payment_number") next.number = row.value;
      if (row.key === "payment_name") next.name = row.value;
      if (row.key === "support_email") next.email = row.value;
    }
    setSettings(next);
  }

  useEffect(() => {
    void load();
  }, []);

  async function act(fn: string, id: string, ok: string) {
    const r = await callRpc(fn, fn === "approve_resource" || fn === "verify_referral" ? (fn === "approve_resource" ? { resource_id: id } : { referral_id: id }) : { p_id: id });
    notify(r.error ? r.error.message : ok);
    await load();
    await onChange();
  }

  return (
    <section className="grid gap-4 rounded-card border border-gold bg-gold-soft p-4">
      <h2 className="font-display text-3xl">Admin</h2>
      <Block title="PDFs waiting">
        {resources.length === 0 ? <p className="text-muted">No pending PDFs.</p> : null}
        {resources.map((x) => (
          <div key={String(x.id)} className="flex items-center justify-between gap-2">
            <span><b>{String(x.title)}</b><small className="block text-muted">{String(x.subject || "")} · {String(x.level || "")}</small></span>
            <button type="button" className="btn btn-primary" onClick={() => act("approve_resource", String(x.id), "PDF approved.")}>Approve</button>
          </div>
        ))}
      </Block>
      <form
        className="grid gap-3 rounded-card bg-paper p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const db = getDb();
          if (!db) return;
          const fd = new FormData(e.currentTarget);
          const rows = [
            ["payment_network", fd.get("network")],
            ["payment_number", fd.get("number")],
            ["payment_name", fd.get("pname")],
            ["support_email", fd.get("email")],
          ].map(([key, value]) => ({ key, value: String(value || "").trim() }));
          const r = await db.from("site_settings").upsert(rows);
          clearPayCache();
          notify(r.error ? r.error.message : "Payment settings saved.");
        }}
      >
        <h3 className="font-display text-2xl">Payment settings</h3>
        <p className="text-sm text-muted">Students see these details when they pay. Never enter a PIN.</p>
        <input className="field" name="network" defaultValue={settings.network} key={`n-${settings.network}`} placeholder="Network" maxLength={60} />
        <input className="field" name="number" defaultValue={settings.number} key={`num-${settings.number}`} placeholder="Mobile money number" maxLength={40} />
        <input className="field" name="pname" defaultValue={settings.name} key={`p-${settings.name}`} placeholder="Name on the account" maxLength={60} />
        <input className="field" name="email" type="email" defaultValue={settings.email} key={`e-${settings.email}`} placeholder="Support email" maxLength={80} />
        <button className="btn btn-primary">Save payment settings</button>
      </form>
      <Queue title="Donations" rows={donations} line={(x) => `${ugx(Number(x.amount_ugx))} · ${x.donor_name}`} sub={(x) => String(x.provider_ref || "")} ok="confirm_donation" no="reject_donation" onAct={act} />
      <Queue title="Premium requests" rows={premium} line={(x) => `${x.plan} · ${ugx(Number(x.amount_ugx))}`} sub={(x) => String(x.provider_ref || "")} ok="approve_premium" no="reject_premium" onAct={act} />
      <Queue title="Coin purchases" rows={purchases} line={(x) => `${x.coins} coins · ${ugx(Number(x.amount_ugx))}`} sub={(x) => String(x.provider_ref || "")} ok="approve_coin_purchase" no="reject_coin_purchase" onAct={act} />
      <Block title="Students">
        {students.length === 0 ? <p className="text-muted">No students found.</p> : null}
        {students.map((x, i) => (
          <RowLine key={i} title={String(x.full_name || x.email || "Student")} meta={`${x.level || ""} · ${x.coins ?? 0} · ${x.role || ""}`} />
        ))}
      </Block>
      <Block title="Referrals waiting">
        {referrals.length === 0 ? <p className="text-muted">No pending referrals.</p> : null}
        {referrals.map((x) => (
          <div key={String(x.id)} className="flex items-center justify-between gap-2">
            <span><b>{String(x.referral_code)}</b><small className="block text-muted">{String(x.created_at || "").slice(0, 10)}</small></span>
            <button type="button" className="btn btn-primary" onClick={() => act("verify_referral", String(x.id), "Referral verified.")}>Verify</button>
          </div>
        ))}
      </Block>
    </section>
  );
}

function Queue({
  title, rows, line, sub, ok, no, onAct,
}: {
  title: string;
  rows: Row[];
  line: (x: Row) => string;
  sub: (x: Row) => string;
  ok: string;
  no: string;
  onAct: (fn: string, id: string, ok: string) => Promise<void>;
}) {
  return (
    <Block title={title}>
      {rows.length === 0 ? <p className="text-muted">Nothing waiting.</p> : null}
      {rows.map((x) => (
        <div key={String(x.id)} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
          <span><b>{line(x)}</b><small className="block text-muted">{sub(x)}</small></span>
          <span className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={() => onAct(ok, String(x.id), "Confirmed.")}>Confirm</button>
            <button type="button" className="btn btn-outline" onClick={() => onAct(no, String(x.id), "Rejected.")}>Reject</button>
          </span>
        </div>
      ))}
    </Block>
  );
}
