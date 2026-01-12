import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse Discord interaction
    const body = await req.json()
    
    // Initialize Supabascleare client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create a run record
    const { data: run, error: runError } = await supabase
      .from('rover_runs')
      .insert({
        guild_id: body.guild_id || 'unknown',
        channel_id: body.channel_id || 'unknown',
        invoked_by: body.member?.user?.id,
        command_type: 'test',
      })
      .select()
      .single()

    if (runError) throw runError

    console.log('✅ Created run:', run.id)

    // TODO: Add your Gemini logic here
    // For now, just respond with success
    
    // Mark run as complete
    await supabase
      .from('rover_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', run.id)

    return new Response(
      JSON.stringify({
        type: 4, // Discord message response
        data: {
          content: `✅ ROVER run ${run.id} recorded successfully!`
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})