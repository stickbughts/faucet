import { createClient } from "@supabase/supabase-js";
import * as config from "./config.js"

const supabaseServiceKey = config.SUPABASE_SERVICE_KEY;
const supabaseUrl = config.SUPABASE_URL;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);