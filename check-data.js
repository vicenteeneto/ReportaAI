import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'http://localhost:54321', // Dummy if not present
  process.env.VITE_SUPABASE_ANON_KEY || 'DUMMY'
);

async function run() {
  const { data: users, error: ue } = await supabase.from('users').select('id, name, cityId, departmentId, city_id').limit(3);
  console.log('USERS:', users, ue);
  
  const { data: cities, error: ce } = await supabase.from('cities').select('*').limit(3);
  console.log('CITIES:', cities, ce);
}

run();
