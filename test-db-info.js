import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.log("No URL");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: users, error: errU } = await supabase.from('users').select('id, name, "departmentid", "departmentId", "department_id"').limit(3);
  console.log('Users error:', errU);
  console.log('Users data:', users);

  const { data: cities, error: errC } = await supabase.from('cities').select('*').limit(3);
  console.log('Cities error:', errC);
  console.log('Cities data:', cities);
}
run();
