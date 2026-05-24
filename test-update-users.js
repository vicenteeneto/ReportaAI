import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const userId = '1f71bd37-be97-425f-bc1b-5f815890dc37'; // Prefeitura
  const cityId = 'cfe55b8b-fbe3-4133-a371-75c3c458abf5'; // Itajai
  console.log('updating user', userId, 'to city', cityId);
  const { error } = await supabase.from('users').update({ cityId }).eq('id', userId);
  console.log('error cityId:', error);

  const { data } = await supabase.from('users').select('name, "cityId"').eq('id', userId);
  console.log(data);
}
run();
