import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Creating Super Admin user...");
  const email = 'contato@kngflow.com';
  const password = 'A7x510682';
  const role = 'superadmin';

  const { data: authData, error: authError } = await supabase.auth.signUp({ 
    email, 
    password 
  });
  
  if (authError) {
    if (authError.message.includes('User already registered') || authError.message.includes('already exists')) {
      console.log('User already exists in auth. Trying to update roles instead.');
      // Proceed to update user table if needed
    } else {
      console.error('Auth Error:', authError);
      return;
    }
  }

  // We need the ID
  let userId;
  if (authData?.user?.id) {
    userId = authData.user.id;
  } else {
    // try to login to get id
    const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
    if (loginData?.user) userId = loginData.user.id;
  }

  if (userId) {
    const { error: dbError } = await supabase.from('users').upsert({
      id: userId,
      name: 'Super Admin - KNG Flow',
      email: email,
      role: role,
    });
    
    if (dbError) {
      console.error('DB Error:', dbError);
    } else {
      console.log('Super Admin user created and updated successfully!');
    }
  } else {
    console.error('Could not get user ID');
  }
}
run();
