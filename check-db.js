import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log("Missing Supabase credentials in env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCols() {
  const { data, error } = await supabase.from('tickets').select('*').limit(1);
  if (error) {
    console.error("Error fetching tickets:", error);
  } else {
    console.log("Tickets columns:", data.length > 0 ? Object.keys(data[0]) : "No data, but query succeeded");
  }

  const { data: colsData, error: colsErr } = await supabase.rpc('get_ticket_cols');
  // Just try inserting a dummy to see the error
  const { error: insErr } = await supabase.from('tickets').insert({ id: "test", foo: "bar" });
  console.log("Insertion error:", insErr);
}

checkCols();
