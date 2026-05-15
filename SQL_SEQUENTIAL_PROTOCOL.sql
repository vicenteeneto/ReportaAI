-- Sequential Protocol Generator
-- 1. Create a sequence for the ticket numbers
CREATE SEQUENCE IF NOT EXISTS ticket_protocol_seq START WITH 1;

-- 2. Create a function to generate the protocol string
CREATE OR REPLACE FUNCTION generate_protocol()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_val INT;
BEGIN
  current_year := TO_CHAR(NOW(), 'YYYY');
  next_val := NEXTVAL('ticket_protocol_seq');
  RETURN 'RD-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. (Optional but recommended) Update existing tickets to have sequential protocols if needed, 
-- or just let new ones use it.
