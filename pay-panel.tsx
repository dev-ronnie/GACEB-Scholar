import { useEffect, useState } from "react";
import { Check, Copy, Phone } from "lucide-react";
import { DEFAULT_NUMS, GACEB_CONFIG } from "@/lib/config";
import { fmtNum, ugx } from "@/lib/format";
import { useGaceb } from "@/lib/gaceb";
import { getDb } from "@/lib/supabase";

type PayInfo = { network: string; name: string; email: string; numbers: string[] };

let cache: PayInfo | null = null;

export function clearPayCache() {
  cache = null;
}

async function loadPay(): Promise<PayInfo> {
  if (cache) return cache;
  const info: PayInfo = {
    network: "",
    name: "",
    email: GACEB_CONFIG.SUPPORT_EMAIL,
    numbers: [...DEFAULT_NUMS],
  };
  const db = getDb();
  if (db) {
    const r = await db.from("site_settings").select("key,value");
    const map: Record<string, "network" | "name" | "email" | "number"> = {
      payment_network: "network",
      payment_number: "number",
      payment_name: "name",
      support_email: "email",
    };
    let number = "";
    for (const row of (r.data ?? []) as { key: string; value: string }[]) {
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

export function PayPanel({
  amount,
  label,
  onSubmit,
}: {
  amount: number;
  label: string;
  onSubmit: (ref: string, phone: string) => Promise<true | string>;
}) {
  const { notify } = useGaceb();
  const [info, setInfo] = useState<PayInfo | null>(null);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadPay().then(setInfo);
  }, []);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify("Copied");
    } catch {
      notify("Press and hold to copy it");
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
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

  if (done) {
    return (
      <div className="rounded-2xl bg-sage p-5 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-forest text-paper">
          <Check className="size-6" />
        </div>
        <h3 className="mt-3 font-display text-2xl">Payment details received</h3>
        <p className="mt-2 text-muted">Status: pending confirmation. GACEB will check the payment and update your account.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-gold-soft p-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gold-deep">AMOUNT TO PAY</p>
          <b className="font-display text-3xl">{ugx(amount)}</b>
          <p className="text-sm text-muted">{label}</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => copy(String(amount))}>
          <Copy className="size-4" /> Copy
        </button>
      </div>
      <div className="rounded-2xl border border-line p-4">
        <p className="text-sm">
          Send exactly <b>{ugx(amount)}</b> by Mobile Money to:
        </p>
        <ul className="mt-3 grid gap-2">
          {numbers.map((n) => (
            <li key={n} className="flex flex-wrap items-center gap-2 rounded-xl bg-cream px-3 py-2">
              <b className="text-lg tabular-nums">{fmtNum(n)}</b>
              <a className="btn btn-outline min-h-10 px-3" href={`tel:${n}`} aria-label={`Call ${fmtNum(n)}`}>
                <Phone className="size-4" />
              </a>
              <button type="button" className="btn btn-outline min-h-10 px-3" onClick={() => copy(n)}>
                <Copy className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        {info?.name ? <p className="mt-2 text-sm text-muted">Account name: <b className="text-ink">{info.name}</b></p> : null}
        {info?.network ? <p className="text-sm text-muted">{info.network}</p> : null}
      </div>
      <form className="grid gap-3" onSubmit={submit}>
        <label className="grid gap-1 text-sm font-medium">
          Transaction ID
          <input className="field" name="ref" required minLength={6} maxLength={40} autoComplete="off" placeholder="From the confirmation message" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Phone you paid from
          <input className="field" name="phone" inputMode="tel" maxLength={20} placeholder="07xx xxx xxx" />
        </label>
        <button className="btn btn-gold" disabled={busy}>Submit payment details</button>
        <p className="text-sm text-burgundy" role="status">{msg}</p>
      </form>
      <p className="text-sm text-muted">Never share your Mobile Money PIN. GACEB will never ask for it. Your purchase is added only after the payment is confirmed.</p>
    </div>
  );
}
