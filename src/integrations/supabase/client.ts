// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://apjxtxlprromyurhuhkd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwanh0eGxwcnJvbXl1cmh1aGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODk0MzIsImV4cCI6MjA2NDI2NTQzMn0.KFONHWOqARZ6FTe-oGK86YIOlsaN4HPl1ZOX69Eq-FQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);