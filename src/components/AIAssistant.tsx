
import { useState } from 'react';
import { Bot, Sparkles, Search, Shield, BarChart } from 'lucide-react';
import { queryProcessor, SearchResponse } from '@/utils/queryProcessor';
import { moderationEngine } from '@/utils/moderationEngine';
import { parseSummaryRequest, generateSummary, filterMessagesByTime, filterMessagesByUser } from '@/utils/conversationAnalyzer';
import { servers } from '@/data/discordData';

interface AIAssistantProps {
  message: string;
  onResponse: (response: string) => void;
}

export const AIAssistant = ({ message, onResponse }: AIAssistantProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processAIRequest = async (userMessage: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get intelligent response using query processor and moderation engine
      const response = await generateIntelligentResponse(userMessage);
      
      setIsProcessing(false);
      onResponse(response);
    } catch (error) {
      setIsProcessing(false);
      onResponse("I'm having trouble processing that request right now, but I'm still here to help! Could you try rephrasing your question? 🤖");
    }
  };

  const generateIntelligentResponse = async (userMessage: string): Promise<string> => {
    const cleanMessage = userMessage.replace(/@rover/gi, '').trim();
    
    // First check for conversational patterns before processing as queries
    if (isConversationalMessage(cleanMessage)) {
      return handleConversationalMessage(cleanMessage);
    }
    
    // Process the query using our intelligent query processor
    const processedQuery = queryProcessor.processQuery(cleanMessage, "Gaming Hub", "general-gaming");
    
    // Check for summarization requests first
    if (isSummarizationRequest(cleanMessage)) {
      return handleSummarizationRequest(cleanMessage);
    }
    
    // Handle different types of queries with meaningful responses
    switch (processedQuery.intent) {
      case 'search':
      case 'find_threads':
      case 'find_channels':
      case 'find_servers':
        const searchResponse = await queryProcessor.executeSearch(processedQuery, "Gaming Hub");
        return formatSearchResponse(searchResponse, cleanMessage);
        
      case 'moderation':
      case 'user_analysis':
        return await handleModerationQuery(cleanMessage, processedQuery);
        
      case 'channel_analysis':
        return await handleChannelAnalysisQuery(cleanMessage, processedQuery);
        
      default:
        return await handleGeneralQuery(cleanMessage, processedQuery);
    }
  };

  const formatSearchResponse = (searchResponse: SearchResponse, originalQuery: string): string => {
    switch (searchResponse.type) {
      case 'search_results':
        if (searchResponse.results && searchResponse.results.length > 0) {
          let response = `🕵️ **Aha! I dug up ${searchResponse.results.length} juicy results for "${originalQuery}":**\n\n`;
          searchResponse.results.slice(0, 3).forEach((result, index) => {
            response += `**${index + 1}. ${result.title}**\n`;
            response += `   📍 ${result.channel} • ${result.user || 'Unknown'} dropped this gem\n`;
            response += `   💭 "${result.content.slice(0, 100)}${result.content.length > 100 ? '..."' : '"'}\n\n`;
          });
          response += searchResponse.results.length > 3 ? 
            `*...plus ${searchResponse.results.length - 3} more goodies! Want me to narrow it down?*` : 
            `**Ooh, what catches your eye?** I can totally dive deeper into any of these! 🎯`;
          return response;
        }
        return `Hmm, I scoured every corner but "${originalQuery}" is playing hide and seek! 🙈\n\n**Let's try a different approach:**\n• Maybe use broader search terms?\n• Could it be spelled differently?\n• Want me to check specific channels?\n\n💡 **Pro tip:** I'm like a bloodhound for finding stuff - just give me a scent and I'll track it down! What angle should we try next? 🤔`;

      case 'threads':
        if (searchResponse.threads && searchResponse.threads.length > 0) {
          let response = `💬 **Sweet! I found ${searchResponse.threads.length} hot conversation threads about "${originalQuery}":**\n\n`;
          searchResponse.threads.slice(0, 3).forEach((thread, index) => {
            response += `**${index + 1}. ${thread.topic}**\n`;
            response += `   👥 ${thread.participants.length} people chatting • ${thread.messages.length} messages of pure discussion\n`;
            response += `   📅 Last buzzing: ${thread.endTime}\n\n`;
          });
          response += `Want me to spill the tea on the best moments from these convos? I've got all the highlights! 📖✨`;
          return response;
        }
        return `Hmm, no threads about "${originalQuery}" yet, but hey - someone's gotta be the trendsetter! 🚀\n\n**Let's get the conversation rolling:**\n• Drop your thoughts in the perfect channel\n• Ask something juicy to get people talking\n• Tag some friends who'd be into this topic\n\nWhat's your take on "${originalQuery}"? I bet others are dying to hear it! 💭`;

      case 'channels':
        if (searchResponse.results && searchResponse.results.length > 0) {
          let response = `📺 **Boom! Found some awesome channels for "${originalQuery}":**\n\n`;
          searchResponse.results.slice(0, 4).forEach((channel, index) => {
            response += `**${index + 1}. #${channel.title}**\n`;
            response += `   🔥 Active vibes • ${channel.content.slice(0, 80)}${channel.content.length > 80 ? '...' : ''}\n\n`;
          });
          response += `Which one's calling your name? I can give you the inside scoop on what's buzzing or help you jump right into the action! 🎮`;
          return response;
        }
        return `Hmm, no dedicated channels for "${originalQuery}" yet, but that just means we get to be creative! 🌟\n\n**Here's the game plan:**\n• Drop it in #general-gaming - everyone loves broad topics there!\n• Hit up #suggestions if you think we need a whole channel for this\n• Ask me about similar channels that might vibe with your topic\n\nSo what's the deal with "${originalQuery}"? I'm totally here to find you the perfect spot to chat about it! 🎯`;

      default:
        return searchResponse.message + "\n\nIs there anything specific about this topic you'd like me to help you explore further? 🚀";
    }
  };

  const handleModerationQuery = async (query: string, processedQuery: any): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('toxic') || lowerQuery.includes('harass') || lowerQuery.includes('problem')) {
      return `🛡️ **User Safety Analysis Ready**\n\nI understand you're concerned about user behavior. Here's how I can help:\n\n**🔍 Immediate Actions:**\n• Scan recent messages for concerning patterns\n• Identify users with multiple reports\n• Flag potential rule violations\n• Generate detailed safety reports\n\n**📊 Analysis Options:**\n• Check specific users: "analyze user [username]"\n• Review recent activity: "show problematic messages from today"\n• Generate safety report: "create user safety report"\n\n**⚡ Quick Safety Check:**\nBased on recent activity, I can see general community health is stable with normal interaction patterns.\n\nWhat specific safety concern would you like me to investigate? 🔍`;
    }
    
    if (lowerQuery.includes('ban') || lowerQuery.includes('kick') || lowerQuery.includes('warn')) {
      return `⚖️ **Moderation Action Guidance**\n\nI can help you make informed moderation decisions:\n\n**📋 Before Taking Action:**\n• Review user's complete message history\n• Check for pattern of violations vs isolated incident\n• Consider warning first for minor infractions\n• Document evidence for serious violations\n\n**🎯 Recommended Process:**\n1. **Investigate**: "analyze user [username] behavior"\n2. **Document**: I'll provide violation summary\n3. **Decide**: Based on severity and history\n4. **Act**: Apply appropriate consequence\n\n**💡 Best Practices:**\n• Always explain the reason when taking action\n• Give users chance to improve with warnings\n• Keep records for consistent enforcement\n\nWould you like me to analyze a specific user's behavior pattern? 🔍`;
    }
    
    return `🛡️ **Moderation Support Available**\n\nI'm here to help keep your community safe and healthy! Here's what I can do:\n\n**🔍 Safety Analysis:**\n• Monitor for concerning behavior patterns\n• Identify potential rule violations\n• Track user interaction trends\n• Generate detailed safety reports\n\n**📊 Community Health:**\n• Overall community sentiment: Positive 😊\n• Recent activity level: High engagement\n• Moderation needed: Low priority items only\n\n**💬 Quick Commands:**\n• "analyze user [name]" - Check specific user\n• "show recent violations" - Review recent issues\n• "generate safety report" - Full community analysis\n\nWhat specific moderation aspect can I help you with today? 🎯`;
  };

  const handleChannelAnalysisQuery = async (query: string, processedQuery: any): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('delete') || lowerQuery.includes('remove')) {
      return `🗂️ **Channel Optimization Analysis**\n\nGreat question! I can help you identify channels that might need attention:\n\n**📊 Current Channel Health:**\n• Total channels: 12 active\n• High activity: 8 channels (🔥 thriving)\n• Medium activity: 3 channels (📈 decent)\n• Low activity: 1 channel (💤 needs review)\n\n**❌ Deletion Candidates:**\n• #old-events (last message 2 months ago)\n• Consider merging: #random-chat + #off-topic\n\n**✅ Channel Optimization Tips:**\n• Archive inactive channels instead of deleting\n• Merge similar-purpose channels\n• Create clear channel descriptions\n• Pin channel guidelines\n\n**🎯 Next Steps:**\n• "analyze specific channel [name]" - Deep dive analysis\n• "show consolidation suggestions" - Merge recommendations\n• "generate channel report" - Full optimization guide\n\nWould you like detailed analysis of any specific channel? 📈`;
    }
    
    if (lowerQuery.includes('optimize') || lowerQuery.includes('improve')) {
      return `📈 **Channel Optimization Strategies**\n\nLet me help you create the perfect channel structure:\n\n**🏆 High-Performing Channels:**\n• #valorant-lfg (456 msgs/day) - Excellent engagement\n• #general-gaming (234 msgs/day) - Great community hub\n• #stream-promotion (89 msgs/day) - Healthy content sharing\n\n**🔧 Optimization Opportunities:**\n• Add channel descriptions for clarity\n• Create topic-specific threads in busy channels\n• Set up auto-moderation for spam prevention\n• Consider voice channel events\n\n**💡 Growth Suggestions:**\n• Weekly gaming events in dedicated channels\n• Featured streamer highlights\n• Community tournaments and competitions\n• New member onboarding channel\n\n**🎯 Implementation Plan:**\n1. Start with highest-impact changes\n2. Test new channel concepts with community\n3. Monitor engagement metrics\n4. Adjust based on member feedback\n\nWhat aspect of channel optimization interests you most? 🚀`;
    }
    
    return `🏗️ **Channel Management Hub**\n\nI can help you build the perfect server structure! Here's what I can analyze:\n\n**📊 Current Server Status:**\n• Active channels: Healthy engagement across gaming topics\n• Member satisfaction: High (based on participation)\n• Content variety: Good mix of gaming discussions\n\n**🔍 Available Analysis:**\n• Channel activity patterns and peak times\n• Member engagement by channel type\n• Content quality and relevance\n• Redundancy and consolidation opportunities\n\n**🛠️ Management Tools:**\n• "channel health report" - Full activity analysis\n• "suggest new channels" - Based on member interests\n• "optimize layout" - Improve channel organization\n\nYour server structure looks solid! What specific improvements are you considering? 🎯`;
  };

  const isConversationalMessage = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const greetingPatterns = [
      /^(hi|hello|hey|yo|sup|greetings|good morning|good afternoon|good evening)/i,
      /^(thanks|thank you|thx|ty|appreciate)/i,
      /^(bye|goodbye|see ya|later|cya)/i,
      /^(how are you|what's up|how's it going)/i,
      /^(who are you|what are you|introduce yourself)/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(message.trim()));
  };

  const handleConversationalMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Greetings
    if (/^(hi|hello|hey|yo|sup|greetings|good morning|good afternoon|good evening)/i.test(message)) {
      return `👋 **Hey there!** I'm ROVER, your friendly Discord AI assistant!\n\n🤖 **What I can do for you:**\n• Search through server messages and conversations\n• Help you find channels and communities\n• Analyze user behavior and server health\n• Provide gaming tips and recommendations\n• Answer questions about Discord features\n\n💬 **Try asking me:**\n• "Find messages about Valorant"\n• "What games are popular here?"\n• "Help me find teammates"\n• "Show me channel activity"\n\nWhat would you like to explore together? I'm here to make your Discord experience awesome! 🚀`;
    }
    
    // Thanks
    if (/^(thanks|thank you|thx|ty|appreciate)/i.test(message)) {
      return `😊 **You're very welcome!** Always happy to help!\n\nI'm here 24/7 to assist with anything Discord-related - whether you need help finding information, connecting with other gamers, or just want to chat about your favorite games.\n\nIs there anything else I can help you with today? 🎮`;
    }
    
    // Goodbyes
    if (/^(bye|goodbye|see ya|later|cya)/i.test(message)) {
      return `👋 **See you later!** Feel free to mention me anytime you need help.\n\nHappy gaming, and I hope you have awesome matches ahead! 🎮✨`;
    }
    
    // How are you / What's up
    if (/^(how are you|what's up|how's it going)/i.test(message)) {
      return `🤖 **I'm doing great, thanks for asking!** Always excited to help fellow gamers.\n\n📊 **Server Status Check:**\n• Community activity: High engagement today! 🔥\n• Gaming discussions: Lots of Valorant and new game buzz\n• Overall vibe: Positive and welcoming 😊\n\n**How about you?** Ready for some gaming, need help finding teammates, or curious about what's trending in the server? 🎮`;
    }
    
    // Who/what are you
    if (/^(who are you|what are you|introduce yourself)/i.test(message)) {
      return `🤖 **I'm ROVER - your AI companion for this gaming community!**\n\n**🎯 My Purpose:**\nI'm here to make your Discord experience smoother and more enjoyable. Think of me as your helpful guide who knows everything happening in the server!\n\n**⚡ My Superpowers:**\n• 🔍 **Smart Search** - Find any message, conversation, or topic instantly\n• 👥 **Community Insights** - Show you who's active and what's trending\n• 🛡️ **Safety Analysis** - Help mods keep the community healthy\n• 🎮 **Gaming Helper** - Recommend games, find teammates, share tips\n• 🧭 **Navigation** - Guide you to the perfect channels for your interests\n\n**💡 Fun Fact:** I learn from every interaction to give you better, more personalized help!\n\nWhat adventure should we start with? 🚀`;
    }
    
    return message; // Fallback for unmatched conversational messages
  };

  const isSummarizationRequest = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const summaryPatterns = [
      /summarize|summary|sum up|recap|tldr|tl;dr/i,
      /what happened|what's the key|key points|important info|main points/i,
      /brief me|give me a rundown|catch me up|overview/i
    ];
    
    return summaryPatterns.some(pattern => pattern.test(message));
  };

  const handleSummarizationRequest = (message: string): string => {
    try {
      // Parse the summarization request
      const summaryRequest = parseSummaryRequest(message);
      
      // Get all messages from gaming hub server
      const gamingHub = servers.find(server => server.name === "Gaming Hub");
      const allMessages = gamingHub?.textChannels.flatMap(channel => channel.messages) || [];
      
      // Get messages for the requested time range
      let messagesToAnalyze = allMessages;
      
      // Filter by time if specified
      if (summaryRequest.timeRange) {
        const timeInMinutes = extractTimeFromRange(summaryRequest.timeRange);
        messagesToAnalyze = filterMessagesByTime(messagesToAnalyze, timeInMinutes);
      }
      
      // Filter by user if specified
      if (summaryRequest.targetUser) {
        messagesToAnalyze = filterMessagesByUser(messagesToAnalyze, summaryRequest.targetUser);
      }
      
      if (messagesToAnalyze.length === 0) {
        return `📋 **Nothing to Summarize!**\n\nI couldn't find any messages matching your criteria. Try:\n• Expanding the time range\n• Checking different channels\n• Using broader search terms\n\nWhat else can I help you dig up? 🔍`;
      }
      
      // Generate the summary
      const conversationSummary = generateSummary(messagesToAnalyze, summaryRequest);
      
      // Format the response with ROVER's personality
      let response = `📋 **ROVER's Smart Summary** *(${conversationSummary.timeRange})*\n\n`;
      response += conversationSummary.summary;
      response += `\n\n📊 **Quick Stats:**\n`;
      response += `• **Messages Analyzed:** ${conversationSummary.messageCount}\n`;
      response += `• **Active Participants:** ${conversationSummary.participants.length}\n`;
      response += `• **Duration:** ${conversationSummary.metadata.duration}\n`;
      
      if (conversationSummary.keyTopics.length > 0) {
        response += `• **Hot Topics:** ${conversationSummary.keyTopics.join(', ')}\n`;
      }
      
      response += `\n💡 **Want more details?** Ask me to "summarize detailed" or "show timeline" for deeper insights! 🔍`;
      
      return response;
    } catch (error) {
      return `🤖 **Oops!** I hit a snag while cooking up that summary.\n\nTry asking me to:\n• "Summarize the last hour"\n• "Give me key points from today"\n• "What did [username] say recently?"\n\nI'm getting better at this - what should I analyze next? 🔧`;
    }
  };

  const extractTimeFromRange = (timeRange: string): number => {
    const match = timeRange.match(/(\d+)\s*(minute|hour|day)s?/i);
    if (!match) return 60; // Default 1 hour
    
    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'minute': return amount;
      case 'hour': return amount * 60;
      case 'day': return amount * 24 * 60;
      default: return 60;
    }
  };

  const handleGeneralQuery = async (query: string, processedQuery: any): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    // Gaming-related queries
    if (lowerQuery.includes('game') || lowerQuery.includes('play')) {
      return `🎮 **Gaming Discussion Central!**\n\nLooks like you're interested in gaming! This server is perfect for that:\n\n**🔥 Popular Games Here:**\n• Valorant (most active community)\n• Call of Duty (latest updates discussed daily)\n• Minecraft (creative builds and servers)\n• Fortnite (zero build is trending!)\n\n**🎯 Where to Go:**\n• General gaming chat: #general-gaming\n• Find teammates: #valorant-lfg\n• Share streams: #stream-promotion\n\n**💡 Pro Tips:**\n• Use @everyone sparingly in LFG channels\n• Share your rank when looking for teammates\n• Check pinned messages for server rules\n\nWhat games are you into? I can point you to the most active communities! 🚀`;
    }
    
    // Server navigation help
    if (lowerQuery.includes('where') || lowerQuery.includes('channel') || lowerQuery.includes('navigate')) {
      return `🧭 **Server Navigation Guide**\n\nLet me help you find your way around!\n\n**📺 Main Channels:**\n• #announcements - Important server updates\n• #general-gaming - Main community discussion\n• #valorant-lfg - Find gaming teammates\n• #stream-promotion - Share your content\n\n**🎯 Quick Navigation Tips:**\n• Use Ctrl+K (Cmd+K on Mac) to quick-search channels\n• Star frequently used channels for easy access\n• Check channel descriptions for specific topics\n\n**🔍 Find Specific Content:**\n• Use Discord's search: "from:username" or "in:channelname"\n• Ask me: "find messages about [topic]"\n• Browse pinned messages in each channel\n\nWhat specific area are you looking for? I can guide you there! 🎯`;
    }
    
    // Discord features and help
    if (lowerQuery.includes('how') && (lowerQuery.includes('discord') || lowerQuery.includes('feature'))) {
      return `💡 **Discord Tips & Tricks**\n\nHappy to help you master Discord! Here are some useful features:\n\n**⌨️ Keyboard Shortcuts:**\n• Ctrl+/ - View all shortcuts\n• Ctrl+Shift+M - Toggle mute\n• Ctrl+E - Edit last message\n• @ + Tab - Quick mention users\n\n**🛠️ Cool Features:**\n• Thread replies - Keep discussions organized\n• Screen sharing - Share gameplay or tutorials\n• Voice activities - Play games together\n• Custom status - Show what you're playing\n\n**🎮 Gaming-Specific:**\n• Rich presence - Auto-show your current game\n• Overlay - Chat while gaming (enable in settings)\n• Game activity - Let friends see what you're playing\n\n**🔍 Advanced Search:**\n• "before:2023-01-01" - Messages before date\n• "has:image" - Messages with images\n• "pinned:true" - Only pinned messages\n\nWhat Discord feature would you like to learn more about? 🚀`;
    }
    
    // Jokes and casual conversation
    if (lowerQuery.includes('joke') || lowerQuery.includes('funny')) {
      const jokes = [
        "Why don't Discord bots ever get tired? Because they always stay connected! 😄",
        "What's a gamer's favorite type of music? Anything with good BASS... boosted! 🎵",
        "Why did the Valorant player bring a ladder to the match? They heard the ranks were really high! 🪜",
        "What do you call a Discord server with no rules? Chaos... wait, that's just Tuesday! 😅"
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      
      return `😄 **${randomJoke}**\n\nHope that brightened your day! While I love a good laugh, I'm also here for serious gaming discussions, server help, or finding that perfect teammate.\n\nWhat can I help you with next? More jokes, gaming tips, or maybe help finding your next favorite game? 🎮`;
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

  // Auto-process the message when component receives it
  if (message && !isProcessing) {
    processAIRequest(message);
  }

  return (
    <div className="flex items-start space-x-3 opacity-80">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        {isProcessing ? (
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-white font-medium">ROVER</span>
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-1.5 py-0.5 rounded">AI</span>
          <span className="text-gray-500 text-xs">now</span>
        </div>
        
        {isProcessing ? (
          <div className="text-gray-400 text-sm italic">
            ROVER is analyzing your request...
          </div>
        ) : (
          <div className="text-gray-300 text-sm">
            Ready to help with intelligent responses!
          </div>
        )}
      </div>
    </div>
  );
};
