import { createClient } from "@supabase/supabase-js";
import * as config from "../../config.js";

const supabaseServiceKey = config.SUPABASE_SERVICE_KEY;
const supabaseUrl = config.SUPABASE_URL;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

supabase
  .from("serials")
  .delete()
  .neq("serial", 0)
  .then((response) => {
    if (response.error) {
      console.error("Error deleting data:", response.error);
    } else {
      console.log("Deleted data:", response.data);
    }
  })
  .catch((error) => console.error("Error:", error));
