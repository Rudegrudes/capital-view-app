// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rxnrdmooxznqujpxllqe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bnJkbW9veHpucXVqcHhsbHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Njg4NjEsImV4cCI6MjA2MjI0NDg2MX0.6HVBlv-Qn5e-cqHayUQZzTnAOM5vHF4c76axXBe9D0I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);