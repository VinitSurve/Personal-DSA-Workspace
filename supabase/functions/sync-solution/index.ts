import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const syncToken = Deno.env.get('SYNC_SECRET_TOKEN')
    
    if (!syncToken) {
      throw new Error('SYNC_SECRET_TOKEN is not configured on the server')
    }

    if (!authHeader || authHeader !== `Bearer ${syncToken}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { path, code, commit_sha, commit_message, language } = await req.json()

    if (!path || !code || !commit_sha || !commit_message || !language) {
      return new Response(JSON.stringify({ error: 'Missing required payload fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Extract slug and topic from path: e.g., solutions/patterns/pattern-01.py
    const parts = path.split('/')
    if (parts.length < 3 || parts[0] !== 'solutions') {
      return new Response(JSON.stringify({ error: 'Path must be in format solutions/topic/slug.ext' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    const topic = parts[1]
    const filename = parts[parts.length - 1]
    const slug = filename.replace(/\.[^/.]+$/, "")

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Use the explicitly configured SYNC_USER_ID from Edge Function secrets
    const userId = Deno.env.get('SYNC_USER_ID')
    if (!userId) {
      throw new Error('SYNC_USER_ID is not configured. Please set it in your Supabase Edge Function secrets.')
    }

    // Find or create problem
    let { data: problem, error: problemError } = await supabaseAdmin
      .from('problems')
      .select('id')
      .eq('slug', slug)
      .single()

    if (problemError && problemError.code !== 'PGRST116') {
      throw problemError
    }

    if (!problem) {
      // Auto-create minimal problem
      const { data: newProblem, error: insertError } = await supabaseAdmin
        .from('problems')
        .insert({
          slug: slug,
          title: slug.replace(/-/g, ' '),
          topic: topic,
          difficulty: 'Medium' // Default
        })
        .select('id')
        .single()
      
      if (insertError) throw insertError
      problem = newProblem
    }

    // Find existing solution
    let { data: solution, error: solError } = await supabaseAdmin
      .from('solutions')
      .select('id, latest_commit_sha')
      .eq('problem_id', problem.id)
      .eq('user_id', userId)
      .eq('language', language)
      .single()

    if (solError && solError.code !== 'PGRST116') {
      throw solError
    }

    let solutionId;

    if (!solution) {
      // Create new solution
      const { data: newSol, error: insertSolError } = await supabaseAdmin
        .from('solutions')
        .insert({
          problem_id: problem.id,
          user_id: userId,
          language: language,
          github_path: path,
          current_code: code,
          latest_commit_sha: commit_sha,
          is_active: true
        })
        .select('id')
        .single()
        
      if (insertSolError) throw insertSolError
      solutionId = newSol.id
    } else {
      solutionId = solution.id
      
      // If same commit, it's idempotent, do nothing.
      if (solution.latest_commit_sha === commit_sha) {
        return new Response(JSON.stringify({ message: 'Idempotent: Commit already synced' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update existing solution
      const { error: updateError } = await supabaseAdmin
        .from('solutions')
        .update({
          current_code: code,
          latest_commit_sha: commit_sha,
          github_path: path,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', solutionId)
        
      if (updateError) throw updateError
    }

    // Insert revision (idempotency handled by UNIQUE constraint on solution_id, commit_sha)
    const { error: revError } = await supabaseAdmin
      .from('solution_revisions')
      .insert({
        solution_id: solutionId,
        commit_sha: commit_sha,
        code: code,
        commit_message: commit_message
      })
      
    if (revError && revError.code !== '23505') { // 23505 is unique violation
      throw revError
    }

    return new Response(JSON.stringify({ success: true, message: 'Sync successful' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
