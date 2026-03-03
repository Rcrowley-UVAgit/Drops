// Supabase Edge Function: daily-rotation
// Runs as a cron job at midnight UTC.
// Advances the cycle_index, handles streak logic, and identifies today's dropper.
// 
// To schedule: In Supabase Dashboard > Edge Functions > daily-rotation > Cron Schedule
// Set cron expression: 0 0 * * * (midnight UTC daily)
// Adjust per group timezone in production.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active groups
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("*, group_members(user_id)");

    if (groupsError) throw groupsError;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    for (const group of groups || []) {
      const cycleOrder = group.cycle_order || [];
      const memberCount = cycleOrder.length;

      if (memberCount < 2) continue; // skip groups with < 2 members

      // Check if yesterday's drop was submitted (for streak logic)
      const { data: yesterdayDrop } = await supabase
        .from("drops")
        .select("id")
        .eq("group_id", group.id)
        .eq("drop_date", yesterday)
        .single();

      // Update streak
      let newStreak = group.streak_count;
      let newStreakDate = group.streak_last_date;

      if (yesterdayDrop) {
        // Yesterday's drop was made — check if streak continues
        if (group.streak_last_date === yesterday) {
          // Already counted
        } else {
          newStreak = group.streak_count + 1;
          newStreakDate = yesterday;
        }
      } else if (group.streak_last_date === yesterday) {
        // Already handled
      } else {
        // Missed day — reset streak
        newStreak = 0;
        newStreakDate = null;
      }

      // Advance cycle index
      let newCycleIndex = group.cycle_index + 1;

      // If we've gone through everyone, reshuffle
      if (newCycleIndex >= memberCount) {
        // Fisher-Yates shuffle
        const shuffled = [...cycleOrder];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        await supabase
          .from("groups")
          .update({
            cycle_order: shuffled,
            cycle_index: 0,
            streak_count: newStreak,
            streak_last_date: newStreakDate,
          })
          .eq("id", group.id);

        newCycleIndex = 0;
      } else {
        await supabase
          .from("groups")
          .update({
            cycle_index: newCycleIndex,
            streak_count: newStreak,
            streak_last_date: newStreakDate,
          })
          .eq("id", group.id);
      }

      // Log today's selected user
      const selectedUserId = (group.cycle_order || [])[newCycleIndex];
      console.log(`Group "${group.name}": Today's dropper is user ${selectedUserId}`);

      // TODO: Send email notification via Resend here
      // const { data: profile } = await supabase
      //   .from('profiles')
      //   .select('display_name')
      //   .eq('id', selectedUserId)
      //   .single();
    }

    return new Response(
      JSON.stringify({ success: true, groups_processed: groups?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
