import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

Remember: You're helping users navigate and understand their Discord community better!`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, channelContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from channel messages
    let contextPrompt = "";
    if (channelContext) {
      contextPrompt = `\n\n**CURRENT CONTEXT:**
- Channel: #${channelContext.channelName}
- Server: ${channelContext.serverName || "Unknown Server"}
- Message Count: ${channelContext.messages?.length || 0} recent messages

**RECENT CHANNEL MESSAGES:**
${channelContext.messages?.slice(-30).map((msg: any) => 
  `[${msg.time}] ${msg.user}: ${msg.content}`
).join('\n') || "No messages available"}`;
    }

    const systemMessage = ROVER_SYSTEM_PROMPT + contextPrompt;

    console.log("Calling Lovable AI gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please check your Lovable workspace credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("rover-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
