const { createClient } = require('@supabase/supabase-js');

// SUPABASE_SERVICE_ROLE_KEY is a secret key that bypasses Row Level Security.
// It must ONLY ever be used here, in server-side code — never sent to the browser.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
