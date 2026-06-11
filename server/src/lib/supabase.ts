import { createClient } from "@supabase/supabase-js";
import { config, hasSupabase } from "../config";

export const supabase = hasSupabase
  ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
