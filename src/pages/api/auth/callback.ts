import type { APIRoute } from "astro";
import { getSupabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  const supabase = getSupabase(cookies);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/app");
};
