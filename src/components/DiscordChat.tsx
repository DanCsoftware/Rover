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
    // Simulate AI processing
    setTimeout(async () => {
      const cleanMessage = userMessage.replace('@rover', '').trim();
      let response = "I'm ROVER, your AI assistant! I'm here to help you with various tasks.";
      
      // Prioritize search queries first
      if (isSearchQuery(cleanMessage)) {
        try {
          const processedQuery = queryProcessor.processQuery(cleanMessage, activeUser.name, channelName);
          const searchResponse = await queryProcessor.executeSearch(processedQuery, activeUser.name);
          setSearchResults(searchResponse);
          response = generateSearchResponse(searchResponse);
        } catch (error) {
          response = "I encountered an error processing your search request. Please try again with different terms.";
        }
      } else if (isSummaryQuery(cleanMessage)) {
        response = generateConversationSummaryResponse(userMessage);
      } else if (isSmartLinkQuery(cleanMessage)) {
        const foundLinks = scanRecentMessagesForLinks();
        response = generateSmartLinkResponse(cleanMessage, foundLinks);
      } else if (isLinkSafetyQuery(cleanMessage)) {
        const foundLinks = scanRecentMessagesForLinks();
        const safetyReport = generateSafetyReport(foundLinks);
        response = generateLinkSafetyResponse(safetyReport);
      } else if (cleanMessage.includes('help')) {
        response = `Here are some things I can help you with:
• **🔍 Enhanced Search:** "find messages about Valorant from last week", "search for servers about gaming"
• **🧵 Thread Discovery:** "find threads about React development", "show discussions about music production"
• **🧭 Smart Navigation:** "navigate to gaming channels", "find channels for beginners"
• **🗄️ Server Discovery:** "find gaming servers with active players", "show music servers similar to this one"
• **📋 Conversation Summaries:** "summarize the past 20 minutes", "recap today's discussion"
• **🔗 Link Safety:** "are these links safe?", "check link security"
• **👤 User Activity:** "what did Sarah say?", "summarize Mike's activity"

**Search Examples:**
• "@rover find all discussions about Valorant from the past week"
• "@rover show me gaming servers with active streamers"
• "@rover navigate to the channel for music production"
• "@rover find threads about React development across all servers"
• "@rover search for messages from TechGuru about AI"`;
      } else if (cleanMessage.includes('hello') || cleanMessage.includes('hi')) {
        response = "Hello there! How can I assist you today? I can help you search messages, find servers, navigate channels, summarize conversations, check link safety, and much more! Try asking me to find something specific.";
      } else if (cleanMessage.includes('what') || cleanMessage.includes('how')) {
        response = "That's a great question! I can help you with advanced search, navigation, and analysis. Try asking me to find messages, threads, servers, or channels. I can also summarize conversations and analyze links!";
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
    }, 1500);
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
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat Header */}
        <DiscordChannelHeader 
          channelName={channelName}
          channelType={channelType}
          onToggleUserList={() => setShowUserList(!showUserList)}
          showUserList={showUserList}
        />

        {/* Messages - Now using ScrollArea */}
        <div className="flex-1">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
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

      {/* User List - only show for text channels when showUserList is true */}
      {channelType === 'text' && showUserList && (
        <DiscordUserList users={channelUsers} className="w-60 flex-shrink-0" />
      )}
    </div>
  );
};

export default DiscordChat;
