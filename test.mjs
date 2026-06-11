import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: selData, error: selErr } = await supabase.from('inquiries').select('*').limit(1);
  console.log('Select:', { selData, selErr });

  const { data: insData, error: insErr } = await supabase.from('inquiries').insert([{
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    nickname: 'test',
    inquiry_code: 'TEST-1',
    status: 'open'
  }]);
  console.log('Insert:', { insData, insErr });
}

run();
