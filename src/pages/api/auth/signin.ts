import type { APIRoute } from "astro";
import { getSupabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = getSupabase(cookies);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${new URL(request.url).origin}/api/auth/callback`,
    },
  });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect(data.url);
};

// Handle GET requests as well, in case of direct visits or redirects
export const GET: APIRoute = POST;
