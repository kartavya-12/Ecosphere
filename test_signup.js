import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function runTest() {
  const email = `test_ngo_${Date.now()}@test.com`;
  
  console.log("Signing up user...");
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: { data: { name: 'Test NGO', role: 'ngo' } }
  });

  if (error) {
    console.error("Signup failed:", error);
    return;
  }
  
  console.log("Signup success:", !!data.user, "Session exists:", !!data.session);

  console.log("Attempting to insert NGO profile with org_name...");
  const { error: insertErr1 } = await supabase.from('profiles').insert([
    { id: data.user.id, name: 'Test NGO', org_name: 'Test NGO Org', department: null, role: 'ngo' }
  ]);
  
  if (insertErr1) {
    console.error("First insert error:", insertErr1);
  } else {
    console.log("First insert succeeded.");
  }

  console.log("Attempting fallback profile insert...");
  const { error: insertErr2 } = await supabase.from('profiles').insert([
      {
          id: data.user.id,
          name: 'Test NGO Fallback',
          role: 'ngo',
          trees_planted: 0,
          cleanup_drives: 0,
          rank: 'Eco-Warrior'
        }
  ]);
  
  if (insertErr2) {
      console.error("Fallback insert error:", insertErr2);
  } else {
      console.log("Fallback insert succeeded.");
  }

  console.log("Fetching profile...");
  const { data: profileData, error: fetchErr } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
  if (fetchErr) {
    console.error("Fetch profile error:", fetchErr);
  } else {
    console.log("Fetch profile succeeded:", profileData);
  }
}

runTest();
