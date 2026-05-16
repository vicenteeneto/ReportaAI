import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const insertPayload = {
      id: "12345678-1234-1234-1234-123456789012",
      protocol: "123",
      userId: "12345678-1234-1234-1234-123456789012",
      categoryId: "cat-buraco",
      departmentId: "dep-infra",
      title: "test",
      description: "test",
      status: "pending",
      priority: "medium",
      latitude: 0,
      longitude: 0,
      address: "test",
      neighborhood: "test",
      photoUrl: "test",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

  const { error, data } = await supabase.from('tickets').insert(insertPayload).select().single();
  console.log('Insert Error:', error);
  console.log('Insert Data:', data);
}
run();
