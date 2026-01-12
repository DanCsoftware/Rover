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

    // Validate configuration before making any request
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const configError = 'ROVER is not configured. Backend connection missing. Please check environment setup.';
      setError(configError);
      setIsStreaming(false);
      throw new Error(configError);
    }

    const cleanMessage = userMessage.replace(/@rover/gi, '').trim();
    
    const messages: ChatMessage[] = [
      { role: 'user', content: cleanMessage }
    ];

    const CHAT_URL = `${supabaseUrl}/functions/v1/discord-rover`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
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

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
            if (content) {
              fullResponse += content;
              setStreamingResponse(fullResponse);
            }
          } catch {
            // Incomplete JSON, put it back
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
            if (content) {
              fullResponse += content;
              setStreamingResponse(fullResponse);
            }
          } catch { /* ignore partial leftovers */ }
        }
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
