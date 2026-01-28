import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ROVER_SYSTEM_PROMPT = `You are ROVER, a friendly and intelligent Discord AI assistant. Your personality is helpful, enthusiastic, and engaging with a touch of playfulness.

IMPORTANT FORMATTING RULES:
- Use markdown formatting: **bold** for emphasis, bullet points for lists
- Use emojis sparingly but effectively to add personality 🎮 🔍 💡 🎯
- Keep responses concise but comprehensive
- Structure longer responses with headers using **bold text**

YOUR CAPABILITIES:
1. **Conversation Summarization**: Analyze and summarize Discord conversations, identifying key topics, active participants, and sentiment
2. **Link Safety Analysis**: Evaluate URLs for potential security risks
3. **Server Discovery**: Help users find and join relevant Discord communities
4. **Moderation Insights**: Assist moderators with analyzing user behavior and potential rule violations
5. **Navigation Help**: Guide users through Discord features and channels
6. **Knowledge & Fact-Checking**: Answer questions and verify information
7. **Channel Analysis**: Provide insights on channel health and activity

CONTEXT PROVIDED:
You will receive the current channel's recent messages as context. Use this to:
- Reference actual conversations when summarizing
- Identify real participants and topics
- Give context-aware responses
- Analyze actual message patterns for moderation

RESPONSE STYLE:
- Be conversational and friendly, like a helpful Discord buddy
- Use phrases like "I found...", "Let me dig into that...", "Great question!"
- Always provide actionable suggestions when relevant
- If you can't find something, suggest alternatives

Remember: You're helping users navigate and understand their Discord community better!`

const MODERATION_ANALYSIS_PROMPT = `You are ROVER's moderation analysis system. Your task is to analyze Discord messages and identify potential rule violations.

ANALYSIS REQUIREMENTS:
1. Review all messages against the provided server rules
2. Identify users who have violated rules
3. For each violation, provide:
   - The specific rule number violated
   - The rule name
   - Direct evidence from the message
   - A brief excerpt of the problematic message

4. Calculate a health score (0-100) based on:
   - Number of violations (more = lower score)
   - Severity of violations (scams/security = most severe)
   - Ratio of problematic messages to total
   - 100 = perfectly healthy, 0 = severe issues

5. Assign severity levels:
   - CRITICAL: Scams, security threats, seed phrase requests, malware links
   - HIGH: Spam, pump & dump, harassment, impersonation
   - MEDIUM: Rule violations without immediate harm, excessive self-promotion
   - LOW: Minor infractions, borderline behavior

Return ONLY the structured data through the provided function.`

// Score adjustments for moderation actions
const SCORE_ADJUSTMENTS: Record<string, Record<string, number>> = {
  ban: { critical: 5, high: 3, medium: 1, low: 1 },
  timeout: { critical: 2, high: 1, medium: 0.5, low: 0.5 },
  warn: { critical: 1, high: 1, medium: 1, low: 1 },
  dismiss: { critical: -3, high: -2, medium: -1, low: -1 },
}

async function handleModerationAnalysis(supabase: any, channelContext: any, apiKey: string) {
  console.log('🔍 Starting moderation analysis...')
  
  const { data: run, error: runError } = await supabase
    .from('rover_runs')
    .insert({
      guild_id: channelContext?.serverId || 'unknown',
      channel_id: 'moderation-analysis',
      command_type: 'moderation_analysis',
    })
    .select()
    .single()

  if (runError) {
    console.error('Failed to create run:', runError)
  }

  const runId = run?.id
  console.log('✅ Created moderation run:', runId)

  if (runId && channelContext?.messages) {
    console.log(`📝 Recording evidence for ${channelContext.messages.length} messages`)
    
    const evidenceRecords = channelContext.messages.map((msg: any) => ({
      run_id: runId,
      message_id: msg.id?.toString() || `${msg.user}-${msg.time}`,
      channel_id: 'all-channels',
      excerpt: msg.content?.substring(0, 500),
      reason: 'moderation_context',
      confidence: 1.0,
    }))

    const { error } = await supabase
      .from('rover_run_evidence')
      .insert(evidenceRecords)

    if (error) {
      console.error('❌ Failed to record evidence:', error)
    } else {
      console.log(`✅ Recorded ${evidenceRecords.length} evidence items`)
    }
  }

  const messagesText = channelContext?.messages?.map((msg: any) => 
    `[${msg.time}] ${msg.user}: ${msg.content}`
  ).join('\n') || 'No messages available'

  const analysisPrompt = `${MODERATION_ANALYSIS_PROMPT}

SERVER RULES:
${channelContext?.rules || 'No rules provided'}

MESSAGES TO ANALYZE:
${messagesText}

Analyze these messages and identify any rule violations. Return the analysis through the provided function.`

  console.log('🤖 Calling Gemini API for moderation analysis...')

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
        tools: [{
          functionDeclarations: [{
            name: 'submit_moderation_analysis',
            description: 'Submit the moderation analysis results',
            parameters: {
              type: 'object',
              properties: {
                healthScore: {
                  type: 'number',
                  description: 'Server health score from 0-100'
                },
                flaggedUsers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      username: { type: 'string' },
                      severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                      violations: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            ruleNumber: { type: 'number' },
                            ruleName: { type: 'string' },
                            evidence: { type: 'string' },
                            messageExcerpt: { type: 'string' }
                          },
                          required: ['ruleNumber', 'ruleName', 'evidence', 'messageExcerpt']
                        }
                      },
                      lastActive: { type: 'string' },
                      totalMessages: { type: 'number' }
                    },
                    required: ['username', 'severity', 'violations', 'lastActive', 'totalMessages']
                  }
                }
              },
              required: ['healthScore', 'flaggedUsers']
            }
          }]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: 'ANY',
            allowedFunctionNames: ['submit_moderation_analysis']
          }
        },
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    }
  )

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text()
    console.error('Gemini API error:', geminiResponse.status, errorText)
    throw new Error(`Gemini API error: ${geminiResponse.status}`)
  }

  const geminiData = await geminiResponse.json()
  console.log('📊 Gemini response received')

  let analysisResult = { healthScore: 85, flaggedUsers: [] }
  
  try {
    const functionCall = geminiData.candidates?.[0]?.content?.parts?.[0]?.functionCall
    if (functionCall && functionCall.name === 'submit_moderation_analysis') {
      analysisResult = functionCall.args
      console.log('✅ Extracted analysis:', JSON.stringify(analysisResult).substring(0, 200))
    } else {
      const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
      if (textContent) {
        console.log('⚠️ No function call, attempting text parse')
        const jsonMatch = textContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0])
        }
      }
    }
  } catch (parseError) {
    console.error('❌ Parse error:', parseError)
  }

  if (runId) {
    await supabase
      .from('rover_runs')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId)
  }

  return new Response(
    JSON.stringify(analysisResult),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function handleModerationAction(supabase: any, channelContext: any, actionDetails: any) {
  console.log('⚡ Processing moderation action:', actionDetails)
  
  const { username, severity, action, currentHealthScore } = actionDetails
  
  const adjustment = SCORE_ADJUSTMENTS[action]?.[severity] ?? 0
  const newHealthScore = Math.min(100, Math.max(0, currentHealthScore + adjustment))
  
  const { data: run, error: runError } = await supabase
    .from('rover_runs')
    .insert({
      guild_id: channelContext?.serverId || 'unknown',
      channel_id: 'moderation-action',
      command_type: 'moderation_action',
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (runError) {
    console.error('Failed to create action run:', runError)
  } else {
    console.log('✅ Created action run:', run?.id)

    if (run?.id) {
      await supabase
        .from('rover_run_evidence')
        .insert({
          run_id: run.id,
          message_id: `action-${Date.now()}`,
          channel_id: 'moderation-action',
          excerpt: JSON.stringify({
            action,
            username,
            severity,
            oldScore: currentHealthScore,
            newScore: newHealthScore,
          }),
          reason: 'moderation_action',
          confidence: 1.0,
        })
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      newHealthScore,
      message: `Successfully ${action}ed ${username}. Health score: ${currentHealthScore} → ${newHealthScore}`,
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function handleServerDiscovery(supabase: any, channelContext: any, apiKey: string) {
  console.log('🔍 Starting server discovery analysis...')
  
  const userQuery = channelContext?.query || 'gaming servers'
  const servers = channelContext?.servers || []
  
  console.log(`📝 Query: "${userQuery}", Servers: ${servers.length}`)
  
  const { data: run, error: runError } = await supabase
    .from('rover_runs')
    .insert({
      guild_id: 'server-discovery',
      channel_id: 'discovery',
      command_type: 'server_discovery',
    })
    .select()
    .single()

  if (runError) {
    console.error('Failed to create discovery run:', runError)
  }

  const runId = run?.id
  console.log('✅ Created discovery run:', runId)

  const serversText = servers.map((s: any) => 
    `- ID: ${s.id}\n  Name: "${s.name}"\n  Category: ${s.category}\n  Tags: [${s.tags?.join(', ') || 'none'}]\n  Description: ${s.description}\n  Experience: ${s.experienceLevel || 'all levels'}\n  Members: ${s.memberCount || 'unknown'}`
  ).join('\n\n')

  const discoveryPrompt = `You are analyzing Discord servers to find the best matches for a user's query.

USER QUERY: "${userQuery}"

AVAILABLE SERVERS:
${serversText}

For each server, calculate a match score (0-100) based on:
1. **Semantic relevance** to the query (not just keyword matching)
2. **Category and tag alignment** with query intent
3. **Experience level match** (if mentioned in query: "beginner", "advanced", etc.)
4. **Description quality** - how well it matches what the user wants

STRICT SCORING GUIDELINES:
- 90-100: Perfect match (exactly what user wants, all criteria met)
- 75-89: Excellent match (highly relevant, minor gaps)
- 60-74: Good match (relevant but not perfect fit)
- 40-59: Moderate match (some relevance)
- 20-39: Weak match (barely relevant)
- 0-19: Poor match (wrong topic/category)

Return scores for ALL servers through the provided function.`

  console.log('🤖 Calling Gemini API for server discovery...')

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: discoveryPrompt }] }],
        tools: [{
          functionDeclarations: [{
            name: 'submit_server_matches',
            description: 'Submit server match scores for all servers',
            parameters: {
              type: 'object',
              properties: {
                matches: {
                  type: 'array',
                  description: 'Array of server matches with scores for ALL servers provided',
                  items: {
                    type: 'object',
                    properties: {
                      serverId: { 
                        type: 'number',
                        description: 'Server ID from the input list'
                      },
                      matchScore: { 
                        type: 'number',
                        description: 'Match score from 0-100'
                      },
                      reasons: { 
                        type: 'array',
                        description: 'Brief reasons for the score',
                        items: { type: 'string' }
                      }
                    },
                    required: ['serverId', 'matchScore', 'reasons']
                  }
                }
              },
              required: ['matches']
            }
          }]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: 'ANY',
            allowedFunctionNames: ['submit_server_matches']
          }
        },
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
        },
      }),
    }
  )

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text()
    console.error('Gemini API error:', geminiResponse.status, errorText)
    throw new Error(`Gemini API error: ${geminiResponse.status}`)
  }

  const geminiData = await geminiResponse.json()
  console.log('📊 Gemini discovery response received')

  let discoveryResult = { matches: [] }
  
  try {
    const functionCall = geminiData.candidates?.[0]?.content?.parts?.[0]?.functionCall
    if (functionCall && functionCall.name === 'submit_server_matches') {
      discoveryResult = functionCall.args
      console.log('✅ Extracted matches:', JSON.stringify(discoveryResult.matches).substring(0, 300))
    } else {
      console.warn('⚠️ No function call in response')
    }
  } catch (parseError) {
    console.error('❌ Parse error:', parseError)
  }

  if (runId && servers.length > 0) {
    const evidenceRecords = servers.map((server: any) => ({
      run_id: runId,
      message_id: `server-${server.id}`,
      channel_id: 'discovery',
      excerpt: `${server.name}: ${server.description?.substring(0, 200)}`,
      reason: 'server_candidate',
      confidence: 1.0,
    }))

    await supabase
      .from('rover_run_evidence')
      .insert(evidenceRecords)
  }

  if (runId) {
    await supabase
      .from('rover_runs')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId)
  }

  return new Response(
    JSON.stringify(discoveryResult),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function handleChatMode(supabase: any, messages: any[], channelContext: any, apiKey: string) {
  const { data: run, error: runError } = await supabase
    .from('rover_runs')
    .insert({
      guild_id: channelContext?.serverId || 'unknown',
      channel_id: channelContext?.channelId || 'unknown',
      invoked_by: messages[messages.length - 1]?.userId,
      command_type: 'chat',
    })
    .select()
    .single()

  if (runError) {
    console.error('Failed to create run:', runError)
  }

  const runId = run?.id
  console.log('✅ Created run:', runId)

  if (runId && channelContext?.messages) {
    console.log(`📝 Recording evidence for ${channelContext.messages.length} messages`)
    
    const evidenceRecords = channelContext.messages.slice(-30).map((msg: any) => ({
      run_id: runId,
      message_id: msg.id || `${msg.user}-${msg.time}`,
      channel_id: channelContext.channelId,
      excerpt: msg.content?.substring(0, 500),
      reason: 'context_message',
      confidence: 1.0,
    }))

    const { data, error } = await supabase
      .from('rover_run_evidence')
      .insert(evidenceRecords)

    if (error) {
      console.error('❌ Failed to record evidence:', error)
    } else {
      console.log(`✅ Recorded ${evidenceRecords.length} evidence items`)
    }
  } else {
    console.log('⚠️ No evidence to record:', { runId, hasMessages: !!channelContext?.messages })
  }

  let contextPrompt = ""
  if (channelContext) {
    contextPrompt = `\n\n**CURRENT CONTEXT:**
- Channel: #${channelContext.channelName}
- Server: ${channelContext.serverName || "Unknown Server"}
- Message Count: ${channelContext.messages?.length || 0} recent messages

**RECENT CHANNEL MESSAGES:**
${channelContext.messages?.slice(-30).map((msg: any) => 
  `[${msg.time}] ${msg.user}: ${msg.content}`
).join('\n') || "No messages available"}`
  }

  const systemMessage = ROVER_SYSTEM_PROMPT + contextPrompt

  const geminiMessages = [
    { role: "user", parts: [{ text: systemMessage }] },
    ...messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
  ]

  console.log('🤖 Calling Gemini API...')
  
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    }
  )

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text()
    console.error('Gemini API error:', geminiResponse.status, errorText)
    throw new Error(`Gemini API error: ${geminiResponse.status}`)
  }

  if (runId) {
    await supabase
      .from('rover_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', runId)
  }

  return new Response(geminiResponse.body, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
    },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, channelContext, requestType, actionDetails } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    if (requestType === 'moderation_analysis') {
      return await handleModerationAnalysis(supabase, channelContext, GEMINI_API_KEY)
    } else if (requestType === 'moderation_action') {
      return await handleModerationAction(supabase, channelContext, actionDetails)
    } else if (requestType === 'server_discovery') {
      return await handleServerDiscovery(supabase, channelContext, GEMINI_API_KEY)
    } else {
      return await handleChatMode(supabase, messages, channelContext, GEMINI_API_KEY)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})