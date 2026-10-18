import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { GACEB_CONFIG } from "@/lib/config";

let client: SupabaseClient | null = null;

export function getDb(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!client) {
    client = createClient(GACEB_CONFIG.SUPABASE_URL, GACEB_CONFIG.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

type RpcResult = { data: unknown; error: { message: string } | null };

export async function callRpc(fn: string, args: Record<string, unknown>): Promise<RpcResult> {
  const db = getDb();
  if (!db) return { data: null, error: { message: "Sign-in is not available right now." } };
  const rpc = db.rpc as unknown as (
    name: string,
    params: Record<string, unknown>,
  ) => Promise<RpcResult>;
  return rpc(fn, args);
}
