import type { APIRoute } from "astro";
import { getSupabase } from "../../../../lib/supabase";
import midtransClient from 'midtrans-client';
import { v4 as uuidv4 } from 'uuid';

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = getSupabase(cookies);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { packageId } = await request.json();

    // Starter pack logic
    if (packageId !== 'starter') {
      return new Response(JSON.stringify({ error: 'Invalid package' }), { status: 400 });
    }

    const amount = 10000;
    const credit_added = 10;
    const order_id = `TRX-${uuidv4()}`;
    const user_id = session.user.id;

    // 1. Insert into supabase transactions (pending)
    // We use the authenticated client since RLS is likely bypassed for insert, wait, RLS for insert on transactions might be restricted.
    // Let's use the service role client for this.
    const { getSupabaseServiceRole } = await import('../../../../lib/supabase');
    const supabaseAdmin = getSupabaseServiceRole();

    const { error: dbError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id,
        order_id,
        amount,
        credit_added,
        status: 'pending'
      });

    if (dbError) throw dbError;

    // 2. Initialize Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: import.meta.env.MIDTRANS_SERVER_KEY,
      clientKey: import.meta.env.PUBLIC_MIDTRANS_CLIENT_KEY
    });

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: amount
      },
      customer_details: {
        email: session.user.email,
        first_name: session.user.user_metadata?.full_name || 'User',
      },
      item_details: [{
        id: "starter_pack",
        price: amount,
        quantity: 1,
        name: "10 AI Generations (CareerGen)"
      }]
    };

    const transaction = await snap.createTransaction(parameter);

    return new Response(JSON.stringify({ token: transaction.token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Payment Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
};
