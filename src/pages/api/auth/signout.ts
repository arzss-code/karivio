import type { APIRoute } from "astro";
import { getSupabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const supabase = getSupabase(cookies);

  await supabase.auth.signOut();

  return redirect("/");
};

export const GET: APIRoute = POST;
