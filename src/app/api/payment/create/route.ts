import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseServiceRole } from '@/lib/supabase';
import midtransClient from 'midtrans-client';

export async function POST(request: Request) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { packageId } = await request.json();

    // Starter pack logic
    if (packageId !== 'starter') {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const amount = 10000;
    const credit_added = 10;
    const order_id = `TRX-${crypto.randomUUID()}`;
    const user_id = user.id;

    // 1. Insert into supabase transactions (pending)
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
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    });

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: amount
      },
      customer_details: {
        email: user.email,
        first_name: user.user_metadata?.full_name || 'User',
      },
      item_details: [{
        id: "starter_pack",
        price: amount,
        quantity: 1,
        name: "10 AI Generations (CareerGen)"
      }]
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({ token: transaction.token }, { status: 200 });

  } catch (error: any) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
