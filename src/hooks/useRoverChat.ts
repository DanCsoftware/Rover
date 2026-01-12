import { useState, useCallback } from 'react';
import { Message } from '@/data/discordData';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChannelContext {
  channelName: string;
  serverName?: string;
  messages: Message[];
}

interface UseRoverChatReturn {
  streamingResponse: string;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (userMessage: string, context: ChannelContext) => Promise<string>;
}

export const useRoverChat = (): UseRoverChatReturn => {
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string, context: ChannelContext): Promise<string> => {
    setIsStreaming(true);
    setStreamingResponse('');
    setError(null);

    // External Supabase project for ROVER
    const EXTERNAL_SUPABASE_URL = 'https://zmwtueuwvbqrvppbsmyl.supabase.co';
    const EXTERNAL_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptd3R1ZXV3dmJxcnZwcGJzbXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNzg0NTgsImV4cCI6MjA4Mzc1NDQ1OH0.k132RAxzhH1OLBd5RirZVo8GN9qJyTPhcLtWH93yRtw';

    const cleanMessage = userMessage.replace(/@rover/gi, '').trim();
    
    const messages: ChatMessage[] = [
      { role: 'user', content: cleanMessage }
    ];

    const CHAT_URL = `${EXTERNAL_SUPABASE_URL}/functions/v1/discord-rover`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${EXTERNAL_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          messages,
          channelContext: {
            channelName: context.channelName,
            serverName: context.serverName,
            messages: context.messages.slice(-50).map(msg => ({
              user: msg.user,
              content: msg.content,
              time: msg.time
            }))
          }
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        let errorMessage = errorData.error || 'Failed to get AI response';
        
        // Provide specific, helpful error messages based on status code
        if (resp.status === 402) {
          errorMessage = 'AI credits exhausted. Please check your workspace credits.';
        } else if (resp.status === 429) {
          errorMessage = 'Rate limited. Please wait a moment and try again.';
        } else if (resp.status === 404) {
          errorMessage = 'ROVER service unavailable. Backend may need redeployment.';
        } else if (resp.status >= 500) {
          errorMessage = 'Server error. Please try again in a moment.';
        }
        
        setError(errorMessage);
        setIsStreaming(false);
        throw new Error(errorMessage);
      }

      if (!resp.body) {
        throw new Error('No response body');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullResponse = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        // DEBUG: Log raw chunks
        console.log('📥 Raw chunk received:', textBuffer.substring(0, 200));
        
        // Gemini streams JSON array: [{...},\n{...},\n...]
        // Remove leading [ or , from array structure
        let cleanBuffer = textBuffer.replace(/^\s*[\[,]\s*/, '');
        
        // Try to find complete JSON objects
        let braceDepth = 0;
        let objectStart = -1;
        let i = 0;
        
        while (i < cleanBuffer.length) {
          const char = cleanBuffer[i];
          
          if (char === '{') {
            if (braceDepth === 0) objectStart = i;
            braceDepth++;
          } else if (char === '}') {
            braceDepth--;
            if (braceDepth === 0 && objectStart !== -1) {
              // Found complete object
              const jsonStr = cleanBuffer.slice(objectStart, i + 1);
              console.log('🔍 Parsing JSON object:', jsonStr.substring(0, 150));
              
              try {
                const parsed = JSON.parse(jsonStr);
                console.log('✅ Parsed successfully:', JSON.stringify(parsed).substring(0, 200));
                
                const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
                console.log('📝 Extracted text:', content);
                
                if (content) {
                  fullResponse += content;
                  setStreamingResponse(fullResponse);
                }
                
                // Check if stream is done
                if (parsed.candidates?.[0]?.finishReason === 'STOP') {
                  console.log('🏁 Stream finished (STOP received)');
                  streamDone = true;
                }
              } catch (parseError) {
                console.error('❌ Parse error:', parseError, 'for:', jsonStr.substring(0, 100));
              }
              
              // Move past this object
              cleanBuffer = cleanBuffer.slice(i + 1);
              i = -1; // Reset to start of remaining buffer
              objectStart = -1;
            }
          }
          i++;
        }
        
        // Keep unprocessed data for next iteration
        textBuffer = cleanBuffer;
      }

      // Log any remaining buffer
      if (textBuffer.trim() && textBuffer.trim() !== ']') {
        console.log('⚠️ Remaining buffer after stream:', textBuffer.substring(0, 100));
      }

      setIsStreaming(false);
      return fullResponse;
    } catch (e) {
      console.error('ROVER chat error:', e);
      setIsStreaming(false);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setError(errorMessage);
      throw e;
    }
  }, []);

  return {
    streamingResponse,
    isStreaming,
    error,
    sendMessage,
  };
};
