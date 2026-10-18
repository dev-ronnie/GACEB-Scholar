/** Public browser settings already used by GACEB Scholar. Do not rename these keys. */
export const GACEB_CONFIG = {
  SUPABASE_URL: "https://wwiedsnmkqjlhxlkfquj.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_OElqt_dsZWnkLxd-gykvjA_NO4AFJOT",
  DONATION_URL: "",
  WEEKLY_PAYMENT_URL: "",
  MONTHLY_PAYMENT_URL: "",
  SUPPORT_EMAIL: "gacebscholar@gmail.com",
} as const;

export const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=+256743766451";
export const UNEB_BRIEFING = new Date("2026-11-06T00:00:00+03:00");
export const DEFAULT_NUMS = ["0743766451", "0783165623"] as const;

export const DEFAULT_PACKS = [
  { coins: 150, amount_ugx: 10000, label: "Starter" },
  { coins: 500, amount_ugx: 25000, label: "Popular" },
  { coins: 1000, amount_ugx: 40000, label: "Best value" },
] as const;

export const DEFAULT_PLANS = [
  { code: "daily", name: "Daily", hours: 24, amount_ugx: 2000 },
  { code: "weekly", name: "Weekly", hours: 168, amount_ugx: 7000 },
  { code: "monthly", name: "Monthly", hours: 720, amount_ugx: 20000 },
  { code: "yearly", name: "Yearly", hours: 8760, amount_ugx: 150000 },
] as const;
