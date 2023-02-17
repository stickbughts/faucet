import cron from "node-cron";
import { supabase } from "./db.js";

export const clearTableEvery24Hours = () => {
  // Generate cron expression @ https://crontab.cronhub.io/
  cron.schedule("0 0 * * *", async () => {
    console.log(`Table cleared at: ${Math.floor((new Date().getTime() / 1000))}`)
    // Workaround since supabase doesn't have method for table truncation (for safety reasons)
    await supabase.from("prayers").delete().neq("accountId", 0);
  }, {
    scheduled: true,
    timezone: "Atlantic/St_Helena",
  });
};
