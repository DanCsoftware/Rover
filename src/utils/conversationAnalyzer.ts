
import { Message } from "@/data/discordData";

export interface SummaryRequest {
  timeRange?: string;
  targetUser?: string;
  summaryType: 'brief' | 'detailed' | 'user-focused' | 'topic' | 'timeline';
  topic?: string;
}

export interface ConversationSummary {
  summary: string;
  messageCount: number;
  timeRange: string;
  participants: string[];
  keyTopics: string[];
  metadata: {
    startTime: string;
    endTime: string;
    duration: string;
  };
}

// Parse time expressions from user input
export const parseTimeExpression = (input: string): number => {
  const timeRegex = /(\d+)\s*(minute|hour|day)s?/i;
  const match = input.match(timeRegex);
  
  if (!match) {
    // Default fallback patterns
    if (input.includes('morning')) return 8 * 60; // 8 hours
    if (input.includes('afternoon')) return 4 * 60; // 4 hours
    if (input.includes('today')) return 24 * 60; // 24 hours
    if (input.includes('yesterday')) return 48 * 60; // 48 hours
    return 20; // Default 20 minutes
  }
  
  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  switch (unit) {
    case 'minute': return amount;
    case 'hour': return amount * 60;
    case 'day': return amount * 24 * 60;
    default: return 20;
  }
};

// Filter messages by time range
export const filterMessagesByTime = (messages: Message[], minutes: number): Message[] => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - minutes * 60 * 1000);
  
  return messages.filter(msg => {
    if (!msg.time) return true; // Include messages without time
    
    // Parse time format "HH:MM" and assume it's from today
    const [hours, mins] = msg.time.split(':').map(Number);
    const msgDate = new Date();
    msgDate.setHours(hours, mins, 0, 0);
    
    // If message time is in the future, assume it's from yesterday
    if (msgDate > now) {
      msgDate.setDate(msgDate.getDate() - 1);
    }
    
    return msgDate >= cutoff;
  });
};

// Filter messages by specific user
export const filterMessagesByUser = (messages: Message[], username: string): Message[] => {
  return messages.filter(msg => 
    msg.user.toLowerCase().includes(username.toLowerCase())
  );
};

// Extract key topics from messages
export const extractKeyTopics = (messages: Message[]): string[] => {
  const topics: { [key: string]: number } = {};
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'a', 'an'];
  
  messages.forEach(msg => {
    const words = msg.content.toLowerCase().split(/\s+/);
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !commonWords.includes(cleanWord)) {
        topics[cleanWord] = (topics[cleanWord] || 0) + 1;
      }
    });
  });
  
  return Object.entries(topics)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, _]) => topic);
};

// Generate different types of summaries
export const generateSummary = (messages: Message[], request: SummaryRequest): ConversationSummary => {
  const participants = [...new Set(messages.map(msg => msg.user))];
  const keyTopics = extractKeyTopics(messages);
  
  let summary = '';
  const messageCount = messages.length;
  
  switch (request.summaryType) {
    case 'brief':
      summary = generateBriefSummary(messages, participants, keyTopics);
      break;
    case 'detailed':
      summary = generateDetailedSummary(messages, participants);
      break;
    case 'user-focused':
      summary = generateUserFocusedSummary(messages, request.targetUser || '');
      break;
    case 'topic':
      summary = generateTopicSummary(messages, request.topic || '');
      break;
    case 'timeline':
      summary = generateTimelineSummary(messages);
      break;
  }
  
  const timeRange = request.timeRange || 'recent conversation';
  const startTime = messages[0]?.time || 'unknown';
  const endTime = messages[messages.length - 1]?.time || 'unknown';
  
  return {
    summary,
    messageCount,
    timeRange,
    participants,
    keyTopics,
    metadata: {
      startTime,
      endTime,
      duration: calculateDuration(startTime, endTime)
    }
  };
};

const generateBriefSummary = (messages: Message[], participants: string[], keyTopics: string[]): string => {
  const mainPoints = messages.filter(msg => msg.content.length > 50).slice(0, 3);
  
  return `**📋 Brief Summary**
  
**Participants:** ${participants.join(', ')}
**Key Topics:** ${keyTopics.length > 0 ? keyTopics.join(', ') : 'General discussion'}
**Message Count:** ${messages.length}

**Main Points:**
${mainPoints.map((msg, i) => `${i + 1}. **${msg.user}:** ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`).join('\n')}`;
};

const generateDetailedSummary = (messages: Message[], participants: string[]): string => {
  const conversationFlow = messages.slice(0, 10).map(msg => 
    `**${msg.user}** (${msg.time}): ${msg.content}`
  ).join('\n\n');
  
  return `**📖 Detailed Summary**
  
**Participants:** ${participants.join(', ')}
**Total Messages:** ${messages.length}

**Conversation Flow:**
${conversationFlow}

${messages.length > 10 ? `\n*...and ${messages.length - 10} more messages*` : ''}`;
};

const generateUserFocusedSummary = (messages: Message[], targetUser: string): string => {
  const userMessages = messages.filter(msg => 
    msg.user.toLowerCase().includes(targetUser.toLowerCase())
  );
  
  if (userMessages.length === 0) {
    return `**👤 User Summary**\n\nNo messages found from users matching "${targetUser}" in the analyzed timeframe.`;
  }
  
  return `**👤 User Summary for "${targetUser}"**
  
**Messages:** ${userMessages.length}
**Activity:** ${userMessages.length > 5 ? 'Very Active' : userMessages.length > 2 ? 'Active' : 'Light Activity'}

**Recent Messages:**
${userMessages.slice(0, 5).map(msg => `• **${msg.time}:** ${msg.content.substring(0, 80)}${msg.content.length > 80 ? '...' : ''}`).join('\n')}`;
};

const generateTopicSummary = (messages: Message[], topic: string): string => {
  const relevantMessages = messages.filter(msg => 
    msg.content.toLowerCase().includes(topic.toLowerCase())
  );
  
  if (relevantMessages.length === 0) {
    return `**🎯 Topic Summary**\n\nNo messages found discussing "${topic}" in the analyzed timeframe.`;
  }
  
  return `**🎯 Topic Summary: "${topic}"**
  
**Relevant Messages:** ${relevantMessages.length}
**Participants:** ${[...new Set(relevantMessages.map(msg => msg.user))].join(', ')}

**Discussion Points:**
${relevantMessages.slice(0, 5).map(msg => `• **${msg.user}:** ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`).join('\n')}`;
};

const generateTimelineSummary = (messages: Message[]): string => {
  const timeline = messages.slice(0, 8).map(msg => 
    `**${msg.time}** - **${msg.user}:** ${msg.content.substring(0, 60)}${msg.content.length > 60 ? '...' : ''}`
  ).join('\n');
  
  return `**⏰ Timeline Summary**
  
**Chronological Flow:**
${timeline}

${messages.length > 8 ? `\n*...and ${messages.length - 8} more messages in timeline*` : ''}`;
};

const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime || startTime === 'unknown' || endTime === 'unknown') {
    return 'unknown';
  }
  
  const [startHours, startMins] = startTime.split(':').map(Number);
  const [endHours, endMins] = endTime.split(':').map(Number);
  
  const startMinutes = startHours * 60 + startMins;
  const endMinutes = endHours * 60 + endMins;
  
  const diffMinutes = Math.abs(endMinutes - startMinutes);
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes`;
  } else {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours}h ${mins}m`;
  }
};

// Parse summary request from user input
export const parseSummaryRequest = (input: string): SummaryRequest => {
  const lowerInput = input.toLowerCase();
  
  // Determine summary type
  let summaryType: SummaryRequest['summaryType'] = 'brief';
  if (lowerInput.includes('detailed') || lowerInput.includes('full')) {
    summaryType = 'detailed';
  } else if (lowerInput.includes('user') || lowerInput.includes('what did') || lowerInput.includes('activity')) {
    summaryType = 'user-focused';
  } else if (lowerInput.includes('timeline') || lowerInput.includes('chronological')) {
    summaryType = 'timeline';
  } else if (lowerInput.includes('about') || lowerInput.includes('regarding')) {
    summaryType = 'topic';
  }
  
  // Extract time range
  const timeRange = parseTimeExpression(input);
  
  // Extract target user
  const userMatch = input.match(/(?:what did|user|activity of|from)\s+([A-Za-z0-9_]+)/i);
  const targetUser = userMatch ? userMatch[1] : undefined;
  
  // Extract topic
  const topicMatch = input.match(/(?:about|regarding|discussion on)\s+([A-Za-z0-9\s]+)/i);
  const topic = topicMatch ? topicMatch[1].trim() : undefined;
  
  return {
    timeRange: `past ${timeRange} minutes`,
    targetUser,
    summaryType,
    topic
  };
};
