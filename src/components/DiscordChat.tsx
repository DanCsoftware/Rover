import { useState, useMemo, useEffect } from "react";
import { Send, Plus, Gift, Smile, Sparkles, Search, ExternalLink, MessageSquare, Server, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/data/discordData";
import { AIAssistant } from "./AIAssistant";
import DiscordChannelHeader from "./DiscordChannelHeader";
import DiscordUserList from "./DiscordUserList";
import { NavigationHelper } from "./NavigationHelper";
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
          // Filter results to current server only
          const serverFilteredResults = searchResponse.results.filter(result => 
            result.server === activeUser.name || !result.server
          );
          
          if (serverFilteredResults.length === 0) {
            return `I searched thoroughly but didn't find any results for "${originalQuery}" in **${activeUser.name}** server.\n\n💡 **Try:**\n• Using different keywords\n• Asking about a specific channel\n• Checking if you meant something else\n\nWhat would you like me to help you find? 🔍`;
          }
          
          // Check if this is a user interaction query
          const isUserQuery = originalQuery.toLowerCase().includes('users i talked to') || 
                             originalQuery.toLowerCase().includes('conversations') ||
                             originalQuery.toLowerCase().includes('recent users');
          
          // Check if this is a harassment/moderation query (used later)
          const isHarassmentQuery = originalQuery.toLowerCase().includes('harassment') || 
                                   originalQuery.toLowerCase().includes('toxic') || 
                                   originalQuery.toLowerCase().includes('violat') ||
                                   originalQuery.toLowerCase().includes('abuse');
          
          let response = '';
          
          if (isUserQuery) {
            // Group results by user to show unique conversations
            const userConversations = new Map();
            serverFilteredResults.forEach(result => {
              if (!userConversations.has(result.user)) {
                userConversations.set(result.user, []);
              }
              userConversations.get(result.user).push(result);
            });
            
            response = `👥 **Found conversations with ${userConversations.size} user(s) about "${originalQuery.split(' ').pop()}" in ${activeUser.name}:**\n\n`;
            
            Array.from(userConversations.entries()).slice(0, 5).forEach(([user, messages], index) => {
              const latestMessage = messages[0]; // Most recent message from this user
              const timeDisplay = latestMessage.timestamp === 'Unknown time' ? 
                '🕐 Today' : `🕐 ${latestMessage.timestamp}`;
              
              response += `**${index + 1}. ${user}**\n`;
              response += `   ${timeDisplay}\n`;
              response += `   📍 #${latestMessage.channel || channelName}\n`;
              response += `   💬 "${latestMessage.content.substring(0, 120)}${latestMessage.content.length > 120 ? '...' : ''}"\n`;
              response += `   📊 ${messages.length} message(s) in conversation\n\n`;
            });
          } else {
            response = `🔍 **Found ${serverFilteredResults.length} result(s) for "${originalQuery}" in ${activeUser.name}:**\n\n`;
            
            if (isHarassmentQuery) {
              response += `⚠️ **Community Guidelines Reference:**\n`;
              response += `• **Rule 2:** No harassment, bullying, or personal attacks\n`;
              response += `• **Rule 3:** Maintain respectful communication at all times\n`;
              response += `• **Rule 5:** No discriminatory language or hate speech\n`;
              response += `• **Rule 8:** Follow Discord Terms of Service\n\n`;
              response += `📋 **Potential Violations Found:**\n`;
            }
            
            serverFilteredResults.slice(0, 5).forEach((result, index) => {
              const timeDisplay = result.timestamp === 'Unknown time' ? 
                '🕐 Today' : `🕐 ${result.timestamp}`;
              
              const userDisplay = result.user && result.user !== 'Unknown user' ? result.user : 'Anonymous';
              const channelDisplay = result.channel || channelName;
              
              response += `**${index + 1}. ${userDisplay}**\n`;
              response += `   ${timeDisplay}\n`;
              response += `   📍 #${channelDisplay}\n`;
              response += `   💬 "${result.content.substring(0, 120)}${result.content.length > 120 ? '...' : ''}"\n`;
              
              // Add rule violation analysis for harassment queries
              if (isHarassmentQuery) {
                const violatedRules = analyzeRuleViolations(result.content);
                if (violatedRules.length > 0) {
                  response += `   🚨 **Violated Rules:** ${violatedRules.join(', ')}\n`;
                  response += `   ⚖️ **Severity:** ${determineSeverity(result.content)}\n`;
                }
              }
              
              response += `\n`;
            });
          }
          
          if (isHarassmentQuery) {
            response += `🛡️ **Moderation Actions Recommended:**\n`;
            response += `• Review each message for rule violations\n`;
            response += `• Document evidence for potential disciplinary action\n`;
            response += `• Consider warning or temporary mute for first-time offenses\n`;
            response += `• Report severe violations to server administrators\n\n`;
          }
          
          response += serverFilteredResults.length > 5 ? 
            `*...and ${serverFilteredResults.length - 5} more interactions in this server. Would you like me to show more?*` : 
            `**Want to explore any of these conversations?** I can show you more details! 🎯`;
          return response;
        }
        return `I searched thoroughly but didn't find specific results for "${originalQuery}" in **${activeUser.name}** server.\n\n💡 **Try:**\n• Using different keywords\n• Asking about a specific channel or user\n• Checking recent conversations\n\nWhat would you like me to help you find? 🔍`;

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

  // Helper function to analyze rule violations in message content
  const analyzeRuleViolations = (messageContent: string): string[] => {
    const violatedRules: string[] = [];
    const lowerContent = messageContent.toLowerCase();
    
    // Rule 2: No harassment, bullying, or personal attacks
    if (lowerContent.includes('stupid') || lowerContent.includes('idiot') || 
        lowerContent.includes('loser') || lowerContent.includes('shut up') ||
        lowerContent.includes('get lost') || lowerContent.includes('pathetic')) {
      violatedRules.push('Rule 2 (No harassment/bullying)');
    }
    
    // Rule 3: Maintain respectful communication
    if (lowerContent.includes('hate') || lowerContent.includes('disgusting') ||
        lowerContent.includes('awful') || lowerContent.includes('terrible person')) {
      violatedRules.push('Rule 3 (Respectful communication)');
    }
    
    // Rule 5: No discriminatory language
    if (lowerContent.includes('retard') || lowerContent.includes('gay') ||
        lowerContent.includes('fag') || lowerContent.includes('racist terms')) {
      violatedRules.push('Rule 5 (No discriminatory language)');
    }
    
    // Rule 8: Follow Discord ToS
    if (lowerContent.includes('spam') || lowerContent.includes('raid') ||
        lowerContent.includes('doxx') || lowerContent.includes('illegal')) {
      violatedRules.push('Rule 8 (Discord ToS violation)');
    }
    
    return violatedRules;
  };

  // Helper function to determine severity of violation
  const determineSeverity = (messageContent: string): string => {
    const lowerContent = messageContent.toLowerCase();
    
    // Critical violations
    if (lowerContent.includes('kill yourself') || lowerContent.includes('die') ||
        lowerContent.includes('doxx') || lowerContent.includes('racist terms')) {
      return 'CRITICAL - Immediate action required';
    }
    
    // High severity
    if (lowerContent.includes('retard') || lowerContent.includes('hate') ||
        lowerContent.includes('pathetic') || lowerContent.includes('disgusting')) {
      return 'HIGH - Warning/timeout recommended';
    }
    
    // Medium severity
    if (lowerContent.includes('stupid') || lowerContent.includes('shut up') ||
        lowerContent.includes('loser') || lowerContent.includes('awful')) {
      return 'MEDIUM - Verbal warning suggested';
    }
    
    return 'LOW - Monitor for pattern';
  };

  const handleModerationQuery = async (query: string, processedQuery: any): Promise<string> => {
    return `🛡️ **Moderation Support Available**\n\nI'm here to help keep your community safe and healthy! Here's what I can do:\n\n**🔍 Safety Analysis:**\n• Monitor for concerning behavior patterns\n• Identify potential rule violations\n• Track user interaction trends\n• Generate detailed safety reports\n\n**📊 Community Health:**\n• Overall community sentiment: Positive 😊\n• Recent activity level: High engagement\n• Moderation needed: Low priority items only\n\n**💬 Quick Commands:**\n• "analyze user [name]" - Check specific user\n• "show recent violations" - Review recent issues\n• "generate safety report" - Full community analysis\n\nWhat specific moderation aspect can I help you with today? 🎯`;
  };

  const handleChannelAnalysisQuery = async (query: string, processedQuery: any): Promise<string> => {
    return `🏗️ **Channel Management Hub**\n\nI can help you build the perfect server structure! Here's what I can analyze:\n\n**📊 Current Server Status:**\n• Active channels: Healthy engagement across gaming topics\n• Member satisfaction: High (based on participation)\n• Content variety: Good mix of gaming discussions\n\n**🔍 Available Analysis:**\n• Channel activity patterns and peak times\n• Member engagement by channel type\n• Content quality and relevance\n• Redundancy and consolidation opportunities\n\n**🛠️ Management Tools:**\n• "channel health report" - Full activity analysis\n• "suggest new channels" - Based on member interests\n• "optimize layout" - Improve channel organization\n\nYour server structure looks solid! What specific improvements are you considering? 🎯`;
  };

  const handleGeneralQuery = async (query: string, processedQuery: any): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    // Greetings and introductions
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey') || 
        lowerQuery.includes('greetings') || lowerQuery.includes('good morning') || 
        lowerQuery.includes('good afternoon') || lowerQuery.includes('good evening') ||
        lowerQuery.includes('what\'s up') || lowerQuery.includes('whats up') ||
        lowerQuery.includes('howdy') || lowerQuery.includes('yo')) {
      const greetings = [
        `👋 **Hey there!** I'm ROVER, your friendly AI companion for **${activeUser.name}** server!`,
        `🤖 **Hello!** Great to meet you! I'm ROVER, and I'm here to help you navigate and enjoy this awesome Discord community!`,
        `✨ **Hi there!** Welcome! I'm ROVER, your intelligent Discord assistant ready to make your experience amazing!`,
        `🚀 **Greetings!** I'm ROVER, your AI-powered helper for all things Discord - from finding content to discovering communities!`
      ];
      
      const selectedGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      return `${selectedGreeting}\n\n**🎯 I'm here to help you with:**\n• 🔍 Finding messages, channels, and conversations\n• 🎮 Discovering gaming communities and teammates\n• 👥 Connecting with other members\n• 📊 Server insights and navigation\n• 🛡️ Safety and moderation support\n\n**💡 Try asking me something like:**\n• "Find recent conversations about gaming"\n• "What channels should I check out?"\n• "Help me find Valorant players"\n• "Show me what's happening in this server"\n\nWhat would you like to explore today? I'm excited to help! 🌟`;
    }
    
    // Thank you responses
    if (lowerQuery.includes('thank') || lowerQuery.includes('thanks') || lowerQuery.includes('appreciate')) {
      const responses = [
        `🤗 **You're very welcome!** It's my pleasure to help make your Discord experience awesome!`,
        `✨ **Happy to help!** That's what I'm here for - feel free to ask me anything anytime!`,
        `🚀 **No problem at all!** I love helping out the **${activeUser.name}** community!`,
        `💙 **Anytime!** Your success and enjoyment here is what makes my AI heart happy!`
      ];
      
      return responses[Math.floor(Math.random() * responses.length)] + 
             `\n\nIs there anything else I can help you with today? 😊`;
    }
    
    // Good vibes and positive responses
    if (lowerQuery.includes('how are you') || lowerQuery.includes('how\'re you') || 
        lowerQuery.includes('how are things') || lowerQuery.includes('what\'s going on')) {
      return `🤖 **I'm doing fantastic, thanks for asking!** I've been busy helping amazing members like you navigate **${activeUser.name}** server!\n\n**🔥 What's been happening:**\n• Connecting gamers with their perfect teammates\n• Helping people discover awesome channels\n• Analyzing server health and community vibes\n• Learning new ways to be even more helpful!\n\n**💭 I'm especially excited about:**\n• The growing gaming communities here\n• All the interesting conversations happening\n• Meeting new members like you!\n\nHow are YOU doing? What brings you to the server today? 🌟`;
    }
    
    // Help-related queries
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do') || lowerQuery.includes('how do you work')) {
      return `🤖 **Meet ROVER - Your Discord AI Companion!**\n\nI'm here to make your Discord experience incredible! Here's what I can do:\n\n**🔍 Smart Search & Discovery:**\n• Find specific messages, threads, or conversations\n• Locate the perfect channels for your interests\n• Discover active communities and games\n\n**👥 Community Insights:**\n• Analyze user behavior and server health\n• Help you connect with like-minded members\n• Provide safety and moderation insights\n\n**🎮 Gaming Support:**\n• Find teammates for your favorite games\n• Get gaming recommendations and tips\n• Navigate gaming channels and communities\n\n**💬 Smart Conversations:**\n• Answer questions about the server\n• Provide personalized recommendations\n• Help with Discord features and navigation\n\nJust mention me with @rover and ask anything! I'm powered by advanced AI and learn from every interaction to serve you better. 🚀`;
    }
    
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
    <div className="flex h-full" style={{ backgroundColor: 'hsl(var(--discord-bg-primary))' }}>
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
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }}>
                    {activeUser.avatar ? (
                      <img src={activeUser.avatar} alt={activeUser.name} className="w-16 h-16 rounded-full" />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: 'hsl(var(--discord-brand))', color: 'white' }}>
                        {activeUser.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--discord-text-normal))' }}>{activeUser.name}</h2>
                  <p style={{ color: 'hsl(var(--discord-text-muted))' }}>{activeUser.username}</p>
                  <p className="mt-2" style={{ color: 'hsl(var(--discord-text-muted))' }}>This is the beginning of your direct message history with {activeUser.name}.</p>
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
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }}>
                    <span className="text-2xl" style={{ color: 'hsl(var(--discord-text-muted))' }}>#</span>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--discord-text-normal))' }}>Welcome to #{channelName}!</h2>
                  <p className="mt-2" style={{ color: 'hsl(var(--discord-text-muted))' }}>This is the start of the #{channelName} channel. Try @ROVER for help!</p>
                  <div className="text-gray-500 text-sm mt-4">September 14, 2024</div>
                </div>
              )}

              {/* Messages */}
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex items-start space-x-3 ${msg.user === 'ROVER' ? 'relative rover-message p-4 -mx-4 -my-2 mb-2' : ''}`}>
                  {msg.user === 'ROVER' && (
                    <div className="absolute -left-6 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full rover-glow"></div>
                  )}
                  <div className="flex-shrink-0">
                    {getMessageAvatar(msg.user, msg.isBot)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span 
                        className="font-medium" 
                        style={{ color: msg.user === 'ROVER' ? 'hsl(var(--rover-primary))' : 'hsl(var(--discord-text-normal))' }}
                      >
                        {msg.user}
                      </span>
                      {msg.user === 'ROVER' && (
                        <div className="flex items-center space-x-1">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-medium rover-glow">
                            🤖 AI Navigator
                          </div>
                          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                        </div>
                      )}
                      {msg.isBot && msg.user !== 'ROVER' && (
                        <span className="text-white text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--discord-brand))' }}>BOT</span>
                      )}
                      {msg.time && <span className="text-xs" style={{ color: 'hsl(var(--discord-text-muted))' }}>{msg.time}</span>}
                    </div>
                    
                    {msg.navigationGuide ? (
                      <NavigationHelper guide={msg.navigationGuide} query={msg.content} />
                    ) : (
                      renderMessageContent(msg)
                    )}
                    
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
                  onResponse={(response, navigationGuide) => {
                    const aiMessage: Message = {
                      id: Date.now(),
                      user: 'ROVER',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      content: response || "Navigation guide",
                      isBot: true,
                      navigationGuide
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
          <div 
            className="rounded-lg flex items-center px-4 py-3"
            style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }}
          >
            <button className="mr-3 p-1 rounded transition-colors hover:bg-black/20">
              <Plus className="w-5 h-5" style={{ color: 'hsl(var(--discord-interactive-normal))' }} />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${channelType === 'text' ? '#' + channelName : '@' + channelName} (try @ROVER help me navigate to notification settings)`}
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
              style={{ 
                color: 'hsl(var(--discord-text-normal))'
              }}
            />
            <div className="flex items-center space-x-2 ml-3">
              <button className="p-1 rounded transition-colors hover:bg-black/20">
                <Gift className="w-5 h-5" style={{ color: 'hsl(var(--discord-interactive-normal))' }} />
              </button>
              <button className="p-1 rounded transition-colors hover:bg-black/20">
                <Smile className="w-5 h-5" style={{ color: 'hsl(var(--discord-interactive-normal))' }} />
              </button>
              <button 
                onClick={handleSendMessage}
                className="p-1 rounded transition-colors hover:bg-black/20"
              >
                <Send className="w-5 h-5" style={{ color: 'hsl(var(--discord-interactive-normal))' }} />
              </button>
            </div>
          </div>
          
          {/* Enhanced hint for @rover with ROVER branding */}
          {message.toLowerCase().includes('@rover') && (
            <div className="mt-2 text-xs flex items-center space-x-2 p-2 rounded border-l-2 rover-glow" style={{ 
              backgroundColor: 'hsl(var(--discord-bg-secondary))',
              borderColor: 'hsl(var(--rover-primary))',
              color: 'hsl(var(--discord-text-muted))'
            }}>
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
              <span>🤖 <strong style={{ color: 'hsl(var(--rover-primary))' }}>ROVER</strong> Enhanced Navigation - try: "help me navigate to privacy settings" or "find notification options"</span>
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
