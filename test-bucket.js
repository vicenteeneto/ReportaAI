import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.storage.getBucket('tickets');
  console.log(error ? error : "Bucket tickets exists!");
  
  if (error) {
    const res = await supabase.storage.createBucket('tickets', { public: true });
    console.log("Bucket creation:", res);
  }
}
run();
