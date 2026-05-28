-- Function to consume 1 credit and save a generated document in a single transaction
CREATE OR REPLACE FUNCTION consume_credit_and_save_doc(
  p_user_id UUID,
  p_doc_type TEXT,
  p_content JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_current_credits INTEGER;
  v_inserted_doc_id UUID;
BEGIN
  -- 1. Lock the row to prevent concurrent race conditions
  SELECT credits_balance INTO v_current_credits
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF v_current_credits <= 0 THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- 2. Deduct credit
  UPDATE profiles
  SET credits_balance = credits_balance - 1
  WHERE id = p_user_id;

  -- 3. Save document
  INSERT INTO documents (user_id, document_type, content)
  VALUES (p_user_id, p_doc_type, p_content)
  RETURNING id INTO v_inserted_doc_id;

  -- Return success status
  RETURN jsonb_build_object(
    'success', true,
    'document_id', v_inserted_doc_id,
    'remaining_credits', v_current_credits - 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
