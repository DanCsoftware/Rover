import { useState, useMemo, useEffect } from "react";
import { Send, Plus, Gift, Smile, Sparkles, Search, ExternalLink, MessageSquare, Server, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/data/discordData";
import { AIAssistant } from "./AIAssistant";
import DiscordChannelHeader from "./DiscordChannelHeader";
import DiscordUserList from "./DiscordUserList";
import { extractLinksFromText, generateSafetyReport, LinkSafetyReport, generateSmartLinkResponse } from "@/utils/linkSafetyAnalyzer";
import { 
  parseSummaryRequest, 
  generateSummary, 
  filterMessagesByTime, 
  filterMessagesByUser, 
  parseTimeExpression,
  ConversationSummary 
} from "@/utils/conversationAnalyzer";
import { queryProcessor, SearchResponse, SearchResult, ThreadResult } from "@/utils/queryProcessor";

interface DiscordChatProps {
  channelName: string;
  messages: Message[];
  activeUser: any;
  channelType: 'text' | 'dm';
}

const DiscordChat = ({ channelName, messages, activeUser, channelType }: DiscordChatProps) => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showUserList, setShowUserList] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);

  // Update chatMessages when messages prop changes (channel switching)
  useEffect(() => {
    setChatMessages(messages);
  }, [messages]);

  // Extract users from messages and create user list with roles and status
  const channelUsers = useMemo(() => {
    const userMap = new Map();
    
    // Process all messages (both initial and new ones) to extract unique users
    const allMessages = [...messages, ...chatMessages.slice(messages.length)];
    
    allMessages.forEach((msg) => {
      if (!userMap.has(msg.user) && msg.user !== 'You') {
        let role: 'owner' | 'admin' | 'moderator' | 'member' = 'member';
        let status: 'online' | 'idle' | 'dnd' | 'offline' = 'online';
        let activity: string | undefined;

        // Assign roles based on user patterns
        if (msg.user.includes('Admin') || msg.user === 'ModeratorX') {
          role = 'admin';
        } else if (msg.user.includes('Moderator') || msg.user.includes('Mod')) {
          role = 'moderator';
        } else if (msg.user.includes('Guild') || msg.user.includes('Owner') || msg.user === 'GuildMaster') {
          role = 'owner';
        }

        // Assign activities based on user names/context
        if (msg.user.includes('Gamer') || msg.user.includes('Pro')) {
          activity = 'Playing games';
        } else if (msg.user.includes('DJ') || msg.user.includes('Music')) {
          activity = 'Listening to music';
        } else if (msg.user.includes('Artist') || msg.user.includes('Creative')) {
          activity = 'Creating art';
        } else if (msg.user.includes('Bot')) {
          activity = 'Bot activities';
          status = 'online';
        }

        // Add some variety to status - most users online, some idle/dnd
        const randomStatus = Math.random();
        if (randomStatus > 0.85) {
          status = 'idle';
        } else if (randomStatus > 0.95) {
          status = 'dnd';
        }

        userMap.set(msg.user, {
          id: msg.user.toLowerCase().replace(/\s+/g, '-'),
          name: msg.user,
          status,
          role,
          activity
        });
      }
    });

    // Add some additional users to make the list more realistic
    const additionalUsers = [
      { id: 'user1', name: 'ProGamer99', status: 'online' as const, role: 'member' as const, activity: 'Playing Valorant' },
      { id: 'user2', name: 'GamerGirl2024', status: 'online' as const, role: 'member' as const, activity: 'Streaming' },
      { id: 'user3', name: 'TacticalGenius', status: 'idle' as const, role: 'member' as const },
      { id: 'user4', name: 'BuildMaster', status: 'online' as const, role: 'member' as const, activity: 'Building' },
    ];

    additionalUsers.forEach(user => {
      if (!userMap.has(user.name)) {
        userMap.set(user.name, user);
      }
    });

    return Array.from(userMap.values());
  }, [messages, chatMessages]);

  const getMessageAvatar = (msgUser: string, isBot?: boolean) => {
    if (msgUser === 'ROVER') {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      );
    }
    if (msgUser === 'Midjourney Bot' || isBot) {
      return <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Bot" className="w-8 h-8 rounded-full" />;
    }
    return <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
      {msgUser.charAt(0)}
    </div>;
  };

  const isSearchQuery = (userMessage: string): boolean => {
    const lowerMessage = userMessage.toLowerCase();
    const searchKeywords = [
      'find', 'search', 'show', 'get', 'display', 'look for', 'where is',
      'navigate', 'go to', 'take me to', 'switch to', 'open',
      'threads', 'discussions', 'conversations', 'messages',
      'servers', 'channels', 'users'
    ];
    return searchKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const isSummaryQuery = (userMessage: string): boolean => {
    const lowerMessage = userMessage.toLowerCase();
    const summaryKeywords = [
      'summarize', 'summary', 'recap', 'overview', 'what happened', 
      'what did', 'conversation', 'discussion', 'timeline', 'key points',
      'brief', 'detailed', 'activity', 'past', 'last', 'recent'
    ];
    return summaryKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const isLinkSafetyQuery = (userMessage: string): boolean => {
    const lowerMessage = userMessage.toLowerCase();
    const keywords = ['safe', 'links', 'check', 'scan', 'secure', 'malicious', 'dangerous'];
    return keywords.some(keyword => lowerMessage.includes(keyword));
  };

  const isSmartLinkQuery = (userMessage: string): boolean => {
    const lowerMessage = userMessage.toLowerCase();
    const smartKeywords = [
      'which link', 'what link', 'where to', 'how to', 'register', 'signup', 
      'learn', 'tutorial', 'guide', 'product', 'features', 'about', 
      'support', 'help', 'pricing', 'cost', 'download', 'install', 
      'community', 'forum', 'go to', 'visit', 'click'
    ];
    return smartKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const generateSearchResponse = (searchResponse: SearchResponse): string => {
    let response = `🔍 **${searchResponse.message}**\n\n`;

    if (searchResponse.results && searchResponse.results.length > 0) {
      response += `📋 **Search Results:**\n`;
      searchResponse.results.slice(0, 10).forEach((result, index) => {
        const icon = result.type === 'message' ? '💬' : 
                    result.type === 'server' ? '🗄️' : 
                    result.type === 'channel' ? '#️⃣' : '👤';
        
        response += `${index + 1}. ${icon} **${result.title}**\n`;
        response += `   ${result.content.substring(0, 100)}${result.content.length > 100 ? '...' : ''}\n`;
        if (result.context) {
          response += `   📍 ${result.context}\n`;
        }
        response += `\n`;
      });
    }

    if (searchResponse.threads && searchResponse.threads.length > 0) {
      response += `🧵 **Conversation Threads:**\n`;
      searchResponse.threads.slice(0, 5).forEach((thread, index) => {
        response += `${index + 1}. **${thread.topic}**\n`;
        response += `   👥 ${thread.participants.join(', ')}\n`;
        response += `   📅 ${thread.startTime} - ${thread.endTime}\n`;
        response += `   📍 ${thread.server} > #${thread.channel}\n`;
        response += `   💬 ${thread.messages.length} messages\n\n`;
      });
    }

    if (searchResponse.navigationTarget) {
      response += `🧭 **Quick Navigation:**\n`;
      response += `Click to navigate to ${searchResponse.navigationTarget.name}\n\n`;
    }

    if (searchResponse.suggestions && searchResponse.suggestions.length > 0) {
      response += `💡 **Suggestions:**\n`;
      searchResponse.suggestions.forEach(suggestion => {
        response += `• ${suggestion}\n`;
      });
    }

    return response;
  };

  const scanRecentMessagesForLinks = (): string[] => {
    // Use the current channel's messages instead of chatMessages state
    const recentMessages = messages.slice(-15); // Last 15 messages from the actual channel
    const allLinks: string[] = [];

    recentMessages.forEach(msg => {
      // Extract links from message content
      const textLinks = extractLinksFromText(msg.content);
      allLinks.push(...textLinks);

      // Add existing links from message data
      if (msg.links) {
        allLinks.push(...msg.links);
      }
    });

    // Remove duplicates
    return [...new Set(allLinks)];
  };

  const generateLinkSafetyResponse = (report: LinkSafetyReport): string => {
    if (report.totalLinks === 0) {
      return "I didn't find any links in the recent messages to analyze. If you're seeing links, try asking me again or mention the specific links you'd like me to check.";
    }

    let response = `🔍 **Link Safety Analysis Complete**\n\n`;
    response += `📊 **Summary:** Found ${report.totalLinks} link(s)\n`;
    response += `✅ Safe: ${report.safeLinks} | ⚠️ Suspicious: ${report.suspiciousLinks} | 🚨 Dangerous: ${report.dangerousLinks}\n\n`;

    if (report.dangerousLinks > 0) {
      response += `🚨 **WARNING: ${report.dangerousLinks} dangerous link(s) detected!**\n\n`;
    }

    response += `📋 **Detailed Analysis:**\n`;
    
    report.results.forEach((result, index) => {
      const statusIcon = result.status === 'safe' ? '✅' : result.status === 'suspicious' ? '⚠️' : '🚨';
      response += `${index + 1}. ${statusIcon} ${result.url}\n`;
      response += `   Status: ${result.status.toUpperCase()}\n`;
      response += `   Reason: ${result.reasons.join(', ')}\n`;
      if (result.status === 'dangerous') {
        response += `   ⚠️ **DO NOT VISIT THIS LINK**\n`;
      }
      response += `\n`;
    });

    if (report.suspiciousLinks > 0 || report.dangerousLinks > 0) {
      response += `🛡️ **Safety Tip:** Always verify links before clicking, especially from unknown sources!`;
    }

    return response;
  };

  const generateConversationSummaryResponse = (userMessage: string): string => {
    const summaryRequest = parseSummaryRequest(userMessage);
    const allMessages = [...messages, ...chatMessages];
    
    // Filter messages based on request
    let filteredMessages = allMessages;
    
    if (summaryRequest.timeRange) {
      const minutes = parseTimeExpression(summaryRequest.timeRange);
      filteredMessages = filterMessagesByTime(filteredMessages, minutes);
    }
    
    if (summaryRequest.targetUser) {
      filteredMessages = filterMessagesByUser(filteredMessages, summaryRequest.targetUser);
    }
    
    if (filteredMessages.length === 0) {
      return "I couldn't find any messages matching your criteria. Try adjusting the time range or user specification.";
    }
    
    const summary = generateSummary(filteredMessages, summaryRequest);
    
    let response = summary.summary;
    
    // Add metadata footer
    response += `\n\n---\n📊 **Analysis Metadata:**\n`;
    response += `• **Duration:** ${summary.metadata.duration}\n`;
    response += `• **Time Range:** ${summary.timeRange}\n`;
    response += `• **Messages Analyzed:** ${summary.messageCount}\n`;
    
    if (summary.keyTopics.length > 0) {
      response += `• **Key Topics:** ${summary.keyTopics.join(', ')}\n`;
    }
    
    // Add helpful suggestions
    response += `\n💡 **Try asking:** "summarize the past hour" or "what did [username] say about [topic]"`;
    
    return response;
  };

  const renderMessageContent = (msg: Message) => {
    let content = msg.content;
    
    // Handle links in content
    if (msg.hasLinks && msg.links) {
      msg.links.forEach(link => {
        content = content.replace(link, `<a href="${link}" class="text-blue-400 hover:underline" target="_blank">${link}</a>`);
      });
    }
    
    // Special styling for ROVER messages
    if (msg.user === 'ROVER') {
      return (
        <div className="bg-gradient-to-r from-blue-50/10 to-purple-50/10 border border-blue-500/20 rounded-lg p-4 mt-2">
          <div 
            className="text-gray-200 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
          />
        </div>
      );
    }
    
    return (
      <div 
        className={`text-gray-300 text-sm leading-relaxed ${msg.isWelcome ? 'text-lg font-medium text-white' : ''}`}
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
      />
    );
  };

  const renderReactions = (reactions?: { emoji: string; count: number }[]) => {
    if (!reactions || reactions.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {reactions.map((reaction, index) => (
          <div key={index} className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded px-2 py-1 flex items-center space-x-1">
            <span className="text-sm">{reaction.emoji}</span>
            <span className="text-xs text-gray-400">{reaction.count}</span>
          </div>
        ))}
      </div>
    );
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      user: 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: message,
      isBot: false
    };

    setChatMessages(prev => [...prev, newMessage]);

    // Check if message mentions @rover
    if (message.toLowerCase().includes('@rover')) {
      setShowAIAssistant(true);
      // Process AI request after a short delay
      setTimeout(() => {
        handleAIResponse(message);
      }, 500);
    }

    setMessage("");
  };

  const handleAIResponse = async (userMessage: string) => {
    // Create AI Assistant component and get response
    const aiAssistant = document.createElement('div');
    
    // Use the enhanced AI Assistant for generating intelligent responses
    import('./AIAssistant').then(({ AIAssistant }) => {
      // Create a temporary component to generate the response
      const generateResponse = async () => {
        const cleanMessage = userMessage.replace('@rover', '').trim();
        
        try {
          // Process the query using our intelligent query processor with server filtering
          const processedQuery = queryProcessor.processQuery(cleanMessage, activeUser.name, channelName);
          // Ensure we only search within the current server
          processedQuery.searchQuery.server = activeUser.name;
          
          // Handle different types of queries with meaningful responses
          let response = "";
          
          switch (processedQuery.intent) {
            case 'search':
            case 'find_threads':
            case 'find_channels':
            case 'find_servers':
              const searchResponse = await queryProcessor.executeSearch(processedQuery, activeUser.name);
              response = formatSearchResponse(searchResponse, cleanMessage);
              break;
              
            case 'moderation':
            case 'user_analysis':
              response = await handleModerationQuery(cleanMessage, processedQuery);
              break;
              
            case 'channel_analysis':
              response = await handleChannelAnalysisQuery(cleanMessage, processedQuery);
              break;
              
            default:
              response = await handleGeneralQuery(cleanMessage, processedQuery);
          }
          
          const aiMessage: Message = {
            id: Date.now() + 1,
            user: 'ROVER',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: response,
            isBot: true
          };

          setChatMessages(prev => [...prev, aiMessage]);
          setShowAIAssistant(false);
        } catch (error) {
          const errorResponse = "I'm having trouble processing that request right now, but I'm still here to help! Could you try rephrasing your question? 🤖";
          
          const aiMessage: Message = {
            id: Date.now() + 1,
            user: 'ROVER', 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: errorResponse,
            isBot: true
          };

          setChatMessages(prev => [...prev, aiMessage]);
          setShowAIAssistant(false);
        }
      };
      
      // Add delay for realistic processing
      setTimeout(generateResponse, 1500);
    });
  };

  // Helper functions for AI response generation (moved from AIAssistant)
  const formatSearchResponse = (searchResponse: SearchResponse, originalQuery: string): string => {
    switch (searchResponse.type) {
      case 'search_results':
        if (searchResponse.results && searchResponse.results.length > 0) {
          let response = `🔍 **Found ${searchResponse.results.length} results for "${originalQuery}" in ${activeUser.name}:**\n\n`;
          searchResponse.results.slice(0, 5).forEach((result, index) => {
            response += `**${index + 1}. ${result.title}**\n`;
            response += `   🕐 ${result.timestamp || 'Unknown time'}\n`;
            response += `   📍 #${result.channel}\n`;
            response += `   👤 ${result.user}\n`;
            response += `   💬 "${result.content.slice(0, 120)}${result.content.length > 120 ? '...' : ''}"\n\n`;
          });
          response += searchResponse.results.length > 5 ? 
            `*...and ${searchResponse.results.length - 5} more results in this server. Would you like me to show more?*` : 
            `**What would you like to explore next?** I can help you dive deeper into any of these results! 🎯`;
          return response;
        }
        return `I searched thoroughly but didn't find specific results for "${originalQuery}" in ${activeUser.name}. Let me suggest some alternatives:\n\n• Try broader search terms\n• Check if you meant a different topic\n• Ask me to search in specific channels\n\n💡 **Tip:** I'm only searching within this server. What specific aspect interests you most? 🤔`;

      case 'threads':
        if (searchResponse.threads && searchResponse.threads.length > 0) {
          let response = `💬 **Found ${searchResponse.threads.length} conversation threads about "${originalQuery}" in ${activeUser.name}:**\n\n`;
          searchResponse.threads.slice(0, 3).forEach((thread, index) => {
            response += `**${index + 1}. ${thread.topic}**\n`;
            response += `   👥 ${thread.participants.join(', ')}\n`;
            response += `   📅 ${thread.startTime} - ${thread.endTime}\n`;
            response += `   📍 #${thread.channel}\n`;
            response += `   💬 ${thread.messages.length} messages\n\n`;
          });
          response += `Want me to show you the key highlights from any of these discussions? 📖`;
          return response;
        }
        return `No conversation threads found about "${originalQuery}" in ${activeUser.name}, but I can help you start one! 🚀\n\nHere's how:\n• Share your thoughts in the relevant channel\n• Ask specific questions to spark discussion\n• Tag people who might be interested\n\nWhat aspect of "${originalQuery}" would you like to discuss? 💭`;

      default:
        return searchResponse.message + "\n\nIs there anything specific about this topic you'd like me to help you explore further? 🚀";
    }
  };

  const handleModerationQuery = async (query: string, processedQuery: any): Promise<string> => {
    return `🛡️ **Moderation Support Available**\n\nI'm here to help keep your community safe and healthy! Here's what I can do:\n\n**🔍 Safety Analysis:**\n• Monitor for concerning behavior patterns\n• Identify potential rule violations\n• Track user interaction trends\n• Generate detailed safety reports\n\n**📊 Community Health:**\n• Overall community sentiment: Positive 😊\n• Recent activity level: High engagement\n• Moderation needed: Low priority items only\n\n**💬 Quick Commands:**\n• "analyze user [name]" - Check specific user\n• "show recent violations" - Review recent issues\n• "generate safety report" - Full community analysis\n\nWhat specific moderation aspect can I help you with today? 🎯`;
  };

  const handleChannelAnalysisQuery = async (query: string, processedQuery: any): Promise<string> => {
    return `🏗️ **Channel Management Hub**\n\nI can help you build the perfect server structure! Here's what I can analyze:\n\n**📊 Current Server Status:**\n• Active channels: Healthy engagement across gaming topics\n• Member satisfaction: High (based on participation)\n• Content variety: Good mix of gaming discussions\n\n**🔍 Available Analysis:**\n• Channel activity patterns and peak times\n• Member engagement by channel type\n• Content quality and relevance\n• Redundancy and consolidation opportunities\n\n**🛠️ Management Tools:**\n• "channel health report" - Full activity analysis\n• "suggest new channels" - Based on member interests\n• "optimize layout" - Improve channel organization\n\nYour server structure looks solid! What specific improvements are you considering? 🎯`;
  };

  const handleGeneralQuery = async (query: string, processedQuery: any): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    // Gaming-related queries
    if (lowerQuery.includes('game') || lowerQuery.includes('play')) {
      return `🎮 **Gaming Discussion Central!**\n\nLooks like you're interested in gaming! This server is perfect for that:\n\n**🔥 Popular Games Here:**\n• Valorant (most active community)\n• Call of Duty (latest updates discussed daily)\n• Minecraft (creative builds and servers)\n• Fortnite (zero build is trending!)\n\n**🎯 Where to Go:**\n• General gaming chat: #general-gaming\n• Find teammates: #valorant-lfg\n• Share streams: #stream-promotion\n\n**💡 Pro Tips:**\n• Use @everyone sparingly in LFG channels\n• Share your rank when looking for teammates\n• Check pinned messages for server rules\n\nWhat games are you into? I can point you to the most active communities! 🚀`;
    }

    // Announcements query (like in the screenshot)
    if (lowerQuery.includes('announcement') || lowerQuery.includes('since 2025')) {
      return `📢 **Announcements Summary Since 2025**\n\nI've analyzed all announcements from this year:\n\n**🎯 Key Announcements:**\n• **New Gaming Tournaments** - Weekly Valorant competitions starting March\n• **Server Rules Update** - Enhanced moderation guidelines implemented\n• **Community Events** - Monthly game nights and streaming showcases\n• **Channel Reorganization** - Optimized layout for better navigation\n\n**📊 Activity Highlights:**\n• 47 announcements posted across 3 channels\n• Most active: #announcements (23 posts)\n• Average engagement: 156 reactions per post\n• Top announcement: Tournament launch (342 reactions)\n\n**🔥 Recent Trending:**\n• Upcoming Spring gaming festival\n• New partnership with gaming creators\n• Server milestone celebrations (5000+ members!)\n\nWant me to dive deeper into any specific announcement category? 🎮`;
    }
    
    // Server navigation help
    if (lowerQuery.includes('where') || lowerQuery.includes('channel') || lowerQuery.includes('navigate')) {
      return `🧭 **Server Navigation Guide**\n\nLet me help you find your way around!\n\n**📺 Main Channels:**\n• #announcements - Important server updates\n• #general-gaming - Main community discussion\n• #valorant-lfg - Find gaming teammates\n• #stream-promotion - Share your content\n\n**🎯 Quick Navigation Tips:**\n• Use Ctrl+K (Cmd+K on Mac) to quick-search channels\n• Star frequently used channels for easy access\n• Check channel descriptions for specific topics\n\n**🔍 Find Specific Content:**\n• Use Discord's search: "from:username" or "in:channelname"\n• Ask me: "find messages about [topic]"\n• Browse pinned messages in each channel\n\nWhat specific area are you looking for? I can guide you there! 🎯`;
    }
    
    // Fallback with context-aware suggestions
    const suggestions = [
      "🔍 Search for messages: \"find messages about [topic]\"",
      "🎮 Gaming help: \"what games are popular here?\"",
      "👥 Find teammates: \"help me find Valorant players\"",
      "🛡️ Server safety: \"analyze user behavior\"",
      "📊 Channel insights: \"show channel activity\"",
      "🧭 Navigation: \"where should I post about [topic]?\""
    ];
    
    return `💭 **Great question!** I'm designed to be your helpful Discord companion.\n\n**🎯 I can help you with:**\n• Finding specific messages or conversations\n• Discovering the best channels for your interests\n• Connecting with other gamers and communities\n• Understanding server features and navigation\n• Analyzing community health and safety\n• Providing gaming tips and recommendations\n\n**💡 Try asking me:**\n${suggestions.slice(0, 3).map(s => `• ${s}`).join('\n')}\n\n**🤖 Fun fact:** I learn from every interaction to give you better, more personalized help!\n\nWhat would you like to explore together? I'm here to make your Discord experience awesome! 🚀`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-gray-700">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Chat Header */}
        <DiscordChannelHeader 
          channelName={channelName}
          channelType={channelType}
          onToggleUserList={() => setShowUserList(!showUserList)}
          showUserList={showUserList}
        />

        {/* Messages - Fixed ScrollArea implementation */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4 min-h-full">
              {/* Profile Section - only show for DMs */}
              {channelType === 'dm' && (
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center mb-4">
                    {activeUser.avatar ? (
                      <img src={activeUser.avatar} alt={activeUser.name} className="w-16 h-16 rounded-full" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                        {activeUser.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h2 className="text-white text-2xl font-bold">{activeUser.name}</h2>
                  <p className="text-gray-400">{activeUser.username}</p>
                  <p className="text-gray-400 mt-2">This is the beginning of your direct message history with {activeUser.name}.</p>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="destructive" size="sm">Mute</Button>
                    <Button variant="secondary" size="sm">View Profile</Button>
                    <Button variant="secondary" size="sm">Report</Button>
                  </div>
                  <div className="text-gray-500 text-sm mt-4">September 14, 2024</div>
                </div>
              )}

              {/* Channel Header - only show for text channels */}
              {channelType === 'text' && (
                <div className="flex flex-col items-start py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center mb-4">
                    <span className="text-gray-400 text-2xl">#</span>
                  </div>
                  <h2 className="text-white text-2xl font-bold">Welcome to #{channelName}!</h2>
                  <p className="text-gray-400 mt-2">This is the start of the #{channelName} channel.</p>
                  <div className="text-gray-500 text-sm mt-4">September 14, 2024</div>
                </div>
              )}

              {/* Messages */}
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex items-start space-x-3 ${msg.user === 'ROVER' ? 'relative' : ''}`}>
                  {msg.user === 'ROVER' && (
                    <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full opacity-60"></div>
                  )}
                  <div className="flex-shrink-0">
                    {getMessageAvatar(msg.user, msg.isBot)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-medium ${msg.user === 'ROVER' ? 'text-blue-300' : 'text-white'}`}>
                        {msg.user}
                      </span>
                      {msg.user === 'ROVER' && (
                        <div className="flex items-center space-x-1">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            AI Assistant
                          </div>
                          <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                        </div>
                      )}
                      {msg.isBot && msg.user !== 'ROVER' && (
                        <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded">BOT</span>
                      )}
                      {msg.time && <span className="text-gray-500 text-xs">{msg.time}</span>}
                    </div>
                    
                    {renderMessageContent(msg)}
                    
                    {msg.hasButton && (
                      <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white" size="sm">
                        {msg.buttonText}
                      </Button>
                    )}
                    
                    {msg.hasButtons && (
                      <div className="flex space-x-2 mt-2">
                        {msg.buttons?.map((button, index) => (
                          <Button 
                            key={index} 
                            className={index === 0 ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-500"} 
                            size="sm"
                          >
                            {button}
                          </Button>
                        ))}
                      </div>
                    )}

                    {msg.hasInvite && (
                      <div className="mt-3 bg-gray-800 rounded-lg p-4 max-w-md">
                        <div className="text-white text-sm mb-2">You've Been Invited To Join A Server</div>
                        <div className="flex items-center space-x-3">
                          <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Server" className="w-12 h-12 rounded-lg" />
                          <div className="flex-1">
                            <div className="text-white font-medium">Midjourney ✅</div>
                            <div className="text-gray-400 text-sm">🟢 858,103 Online ⚫ 20,943,714 Members</div>
                          </div>
                          <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                            Join
                          </Button>
                        </div>
                      </div>
                    )}

                    {renderReactions(msg.hasReactions ? msg.reactions : undefined)}
                  </div>
                </div>
              ))}

              {/* AI Assistant Processing */}
              {showAIAssistant && (
                <AIAssistant 
                  message={message} 
                  onResponse={(response) => {
                    const aiMessage: Message = {
                      id: Date.now(),
                      user: 'ROVER',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      content: response,
                      isBot: true
                    };
                    setChatMessages(prev => [...prev, aiMessage]);
                    setShowAIAssistant(false);
                  }} 
                />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className="p-4 flex-shrink-0">
          <div className="bg-gray-600 rounded-lg flex items-center px-4 py-3">
            <button className="mr-3 p-1 hover:bg-gray-500 rounded">
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${channelType === 'text' ? '#' + channelName : '@' + channelName} (try @rover find messages about gaming)`}
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            />
            <div className="flex items-center space-x-2 ml-3">
              <button className="p-1 hover:bg-gray-500 rounded">
                <Gift className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-1 hover:bg-gray-500 rounded">
                <Smile className="w-5 h-5 text-gray-400" />
              </button>
              <button 
                onClick={handleSendMessage}
                className="p-1 hover:bg-gray-500 rounded"
              >
                <Send className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Enhanced hint for @rover */}
          {message.toLowerCase().includes('@rover') && (
            <div className="mt-2 text-xs text-gray-400 flex items-center space-x-2">
              <Search className="w-3 h-3 text-blue-500 animate-pulse" />
              <span>ROVER Enhanced Search & Navigation - try: "find servers about gaming" or "navigate to music channels"</span>
            </div>
          )}
        </div>
      </div>

      {/* User List - also apply ScrollArea */}
      {channelType === 'text' && showUserList && (
        <DiscordUserList users={channelUsers} className="w-60 flex-shrink-0" />
      )}
    </div>
  );
};

export default DiscordChat;
