// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hoplageissupabase.duckdns.org";
const SUPABASE_PUBLISHABLE_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1MDE5MzU4MCwiZXhwIjo0OTA1ODY3MTgwLCJyb2xlIjoiYW5vbiJ9.1qA4Icv4Ss67Ak4FGvRzlxLUNhGCtHoNDWqECcKk-Wc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
