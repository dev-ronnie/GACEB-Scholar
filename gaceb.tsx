import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getDb } from "@/lib/supabase";

export type Profile = {
  id: string;
  full_name?: string | null;
  school?: string | null;
  level?: string | null;
  coins?: number | null;
  role?: string | null;
  referral_code?: string | null;
  email?: string | null;
  gender?: string | null;
  phone?: string | null;
};

type Ctx = {
  session: Session | null;
  profile: Profile | null;
  ready: boolean;
  isAdmin: boolean;
  notify: (msg: string) => void;
  refresh: () => Promise<void>;
  openDialog: (node: ReactNode) => void;
  closeDialog: () => void;
  openAuth: (mode?: "login" | "signup") => void;
};

const GacebContext = createContext<Ctx | null>(null);

export function useGaceb() {
  const ctx = useContext(GacebContext);
  if (!ctx) throw new Error("useGaceb outside provider");
  return ctx;
}

export function GacebProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dialog, setDialog] = useState<ReactNode | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const timer = useRef<number | null>(null);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 3800);
  }, []);

  const refresh = useCallback(async () => {
    const db = getDb();
    if (!db) {
      setReady(true);
      return;
    }
    try {
      const r = await db.auth.getSession();
      const s = r.data.session;
      setSession(s);
      if (s) {
        const p = await db.from("profiles").select("*").eq("id", s.user.id).maybeSingle();
        setProfile((p.data as Profile | null) ?? null);
      } else {
        setProfile(null);
      }
    } catch {
      /* keep the last known session */
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) sessionStorage.setItem("gaceb-ref", ref);
    const db = getDb();
    void refresh();
    if (!db) return;
    const sub = db.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refresh(), 0);
    });
    return () => sub.data.subscription.unsubscribe();
  }, [refresh]);

  useEffect(() => {
    if (!dialog && !authMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDialog(null);
        setAuthMode(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, authMode]);

  const closeDialog = useCallback(() => {
    setDialog(null);
    setAuthMode(null);
  }, []);

  const openDialog = useCallback((node: ReactNode) => {
    setAuthMode(null);
    setDialog(node);
  }, []);

  const openAuth = useCallback((mode: "login" | "signup" = "login") => {
    setDialog(null);
    setAuthMode(mode);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      session,
      profile,
      ready,
      isAdmin: profile?.role === "admin",
      notify,
      refresh,
      openDialog,
      closeDialog,
      openAuth,
    }),
    [session, profile, ready, notify, refresh, openDialog, closeDialog, openAuth],
  );

  return (
    <GacebContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-paper shadow-lg"
        >
          {toast}
        </div>
      ) : null}
      {dialog || authMode ? (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-ink/50 p-0 sm:place-items-center sm:p-4"
          onClick={closeDialog}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper p-5 shadow-2xl sm:rounded-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-3 flex justify-end">
              <button type="button" className="btn btn-outline min-h-10 px-3" onClick={closeDialog} aria-label="Close">
                Close
              </button>
            </div>
            {authMode ? <AuthPanel mode={authMode} onMode={setAuthMode} /> : dialog}
          </div>
        </div>
      ) : null}
    </GacebContext.Provider>
  );
}

function AuthPanel({
  mode,
  onMode,
}: {
  mode: "login" | "signup";
  onMode: (m: "login" | "signup") => void;
}) {
  const { notify, closeDialog, refresh } = useGaceb();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const refCode = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("gaceb-ref") || "" : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
          options: {
            data: {
              full_name: fd.get("full_name"),
              school: fd.get("school"),
              level: fd.get("level"),
              referral_code: fd.get("referral_code"),
            },
          },
        });
        if (result.error) throw result.error;
        setStatus("Account created. Check your email if confirmation is on.");
      } else {
        const result = await db.auth.signInWithPassword({
          email: String(fd.get("email") || ""),
          password: String(fd.get("password") || ""),
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

  return (
    <div>
      <h2 className="font-display text-3xl text-balance">
        {mode === "signup" ? "Create your account" : "Log in to GACEB Scholar"}
      </h2>
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <>
            <label className="grid gap-1 text-sm font-medium">
              Full name
              <input className="field" name="full_name" required maxLength={100} />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              School
              <input className="field" name="school" maxLength={150} />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Study level
              <select className="field" name="level" defaultValue="O-Level">
                <option>O-Level</option>
                <option>A-Level</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Referral code (optional)
              <input className="field" name="referral_code" defaultValue={refCode} />
            </label>
          </>
        ) : null}
        <label className="grid gap-1 text-sm font-medium">
          Email
          <input className="field" name="email" type="email" required autoComplete="email" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Password
          <input className="field" name="password" type="password" required minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
        </label>
        <button className="btn btn-primary" disabled={busy}>
          {mode === "signup" ? "Create account" : "Log in"}
        </button>
        <p className="text-sm text-muted" role="status">{status}</p>
      </form>
      <button
        type="button"
        className="btn btn-outline mt-2 w-full"
        onClick={() => onMode(mode === "signup" ? "login" : "signup")}
      >
        {mode === "signup" ? "I already have an account" : "Create a new account"}
      </button>
    </div>
  );
}
