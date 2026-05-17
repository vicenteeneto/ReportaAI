import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function loginUser(email, password) {
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginData?.user) {
    console.log('Login success -> updating role for: ', email);
    const userId = loginData.user.id;
    const { error: dbError } = await supabase.from('users').update({
      role: email.includes('superuser') ? 'superadmin' : 'admin'
    }).eq('id', userId);
    
    if (dbError) {
      console.error('DB Error:', dbError);
    } else {
      console.log('Updated user in database successfully:', email);
    }
  } else {
    console.error('Login error for', email, loginError.message);
  }
}

async function run() {
  await loginUser('superuser@rondonopolis.mt.gov.br', 'A7x510682');
  await loginUser('prefeituraroo@rondonopolis.mt.gov.br', 'testando2026');
  console.log('Done');
}
run();
