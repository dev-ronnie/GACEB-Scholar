// Paste into Supabase → Edge Functions → gauge-assistant.
// The website already calls this name. It does not need a code change.
// Gauge then uses gauge_reply: study, about GACEB, and greetings, 20 a day.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: auth } } },
    );
    const body = await req.json().catch(() => ({ messages: [] }));
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const last = [...messages].reverse().find((m) => m && m.role === "user");
    const text = typeof last?.content === "string" ? last.content : "";
    const { data, error } = await supabase.rpc("gauge_reply", { p_text: text });
    if (error) {
      return new Response(
        JSON.stringify({ reply: "Gauge is resting. Ask a study question again in a moment." }),
        { headers: cors },
      );
    }
    return new Response(JSON.stringify({ reply: data }), { headers: cors });
  } catch {
    return new Response(
      JSON.stringify({ reply: "Gauge is resting. Ask a study question again in a moment." }),
      { headers: cors },
    );
  }
});
