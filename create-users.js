import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUser(email, password, role, name) {
  console.log('Creating:', email);
  const { data: authData, error: authError } = await supabase.auth.signUp({ 
    email, 
    password 
  });
  
  if (authError) {
    if (authError.message.includes('User already registered') || authError.message.includes('already exists')) {
      console.log('User already exists in auth. Trying to login to get ID.');
    } else {
      console.error('Auth Error for', email, ':', authError);
      return;
    }
  }

  let userId;
  if (authData?.user?.id) {
    userId = authData.user.id;
  } else {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginData?.user) {
        userId = loginData.user.id;
    } else {
        console.error('Login error for', email, loginError);
    }
  }

  if (userId) {
    const { error: dbError } = await supabase.from('users').upsert({
      id: userId,
      name: name,
      email: email,
      role: role,
    });
    
    if (dbError) {
      console.error('DB Error:', dbError);
    } else {
      console.log('Updated user in database successfully:', email);
    }
  } else {
    console.error('Could not get user ID for', email);
  }
}

async function run() {
  await createUser('superuser@rondonopolis.mt.gov.br', 'A7x510682', 'superadmin', 'Super User Rondonópolis');
  await createUser('prefeituraroo@rondonopolis.mt.gov.br', 'testando2026', 'admin', 'Prefeitura Rondonópolis');
  console.log('Done');
}
run();
