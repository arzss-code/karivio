-- Function to atomically add credits to a user profile
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_credit_added INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET credits_balance = credits_balance + p_credit_added
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
