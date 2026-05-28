import type { APIRoute } from "astro";
import { getSupabaseServiceRole } from "../../../../lib/supabase";
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const serverKey = import.meta.env.MIDTRANS_SERVER_KEY;
    
    // 1. Verify Signature
    const signatureKey = body.signature_key;
    const orderId = body.order_id;
    const statusCode = body.status_code;
    const grossAmount = body.gross_amount;
    
    const hash = crypto.createHash('sha512').update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest('hex');
    
    if (hash !== signatureKey) {
      return new Response('Invalid signature', { status: 403 });
    }

    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    let finalStatus = 'pending';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        finalStatus = 'challenge';
      } else if (fraudStatus == 'accept') {
        finalStatus = 'settlement';
      }
    } else if (transactionStatus == 'settlement') {
      finalStatus = 'settlement';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      finalStatus = 'expire';
    } else if (transactionStatus == 'pending') {
      finalStatus = 'pending';
    }

    const supabaseAdmin = getSupabaseServiceRole();

    // 2. Fetch transaction
    const { data: trx, error: trxError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (trxError || !trx) {
      console.error('Transaction not found', trxError);
      return new Response('Transaction not found', { status: 404 });
    }

    // 3. Prevent double processing
    if (trx.status === 'settlement' || trx.status === 'expire') {
      return new Response('Already processed', { status: 200 });
    }

    // 4. Update transaction status
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({ status: finalStatus, updated_at: new Date().toISOString() })
      .eq('order_id', orderId);

    if (updateError) throw updateError;

    // 5. If settlement, give credits
    if (finalStatus === 'settlement') {
      const { error: rpcError } = await supabaseAdmin.rpc('add_credits', {
        p_user_id: trx.user_id,
        p_credit_added: trx.credit_added
      });
      
      if (rpcError) {
        console.error('RPC Error adding credits:', rpcError);
        throw rpcError;
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error);
    return new Response('Server Error', { status: 500 });
  }
};
