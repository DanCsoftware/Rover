import { servers, dmUsers, dmMessages, Message, Server, User } from '@/data/discordData';

export interface SearchResult {
  type: 'message' | 'channel' | 'server' | 'user';
  id: string;
  title: string;
  content: string;
  server?: string;
  channel?: string;
  user?: string;
  timestamp?: string;
  relevanceScore: number;
  context?: string;
}

export interface SearchQuery {
  query: string;
  type?: 'message' | 'channel' | 'server' | 'user' | 'all';
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'all';
  server?: string;
  channel?: string;
  user?: string;
}

export interface ThreadResult {
  topic: string;
  messages: Message[];
  participants: string[];
  startTime: string;
  endTime: string;
  server: string;
  channel: string;
  relevanceScore: number;
}

// Search indexing system
class SearchIndex {
  private messageIndex: Map<string, Message[]> = new Map();
  private serverIndex: Map<string, Server> = new Map();
  private channelIndex: Map<string, any> = new Map();
  private userIndex: Map<string, User> = new Map();

  constructor() {
    this.buildIndex();
  }

  private buildIndex() {
    // Index servers
    servers.forEach(server => {
      this.serverIndex.set(server.id.toString(), server);
      
      // Index channels and messages
      server.textChannels.forEach(channel => {
        const channelKey = `${server.id}-${channel.id}`;
        this.channelIndex.set(channelKey, {
          ...channel,
          serverId: server.id,
          serverName: server.name,
          type: 'text'
        });

        // Index messages
        if (channel.messages) {
          channel.messages.forEach(message => {
            const keywords = this.extractKeywords(message.content);
            keywords.forEach(keyword => {
              if (!this.messageIndex.has(keyword)) {
                this.messageIndex.set(keyword, []);
              }
              this.messageIndex.get(keyword)!.push({
                ...message,
                serverId: server.id,
                serverName: server.name,
                channelId: channel.id,
                channelName: channel.name
              } as any);
            });
          });
        }
      });

      // Index voice channels
      server.voiceChannels.forEach(channel => {
        const channelKey = `${server.id}-${channel.name}`;
        this.channelIndex.set(channelKey, {
          id: channel.name,
          name: channel.name,
          serverId: server.id,
          serverName: server.name,
          type: 'voice'
        });
      });
    });

    // Index DM users
    dmUsers.forEach(user => {
      this.userIndex.set(user.id, user);
    });
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Add bigrams for better context matching
    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
    
    return [...words, ...bigrams];
  }

  private calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    let score = 0;
    queryWords.forEach(qWord => {
      contentWords.forEach(cWord => {
        if (cWord.includes(qWord) || qWord.includes(cWord)) {
          score += qWord === cWord ? 2 : 1;
        }
      });
    });
    
    return score / Math.max(queryWords.length, 1);
  }

  searchMessages(query: string, filters: Partial<SearchQuery> = {}): SearchResult[] {
    const results: SearchResult[] = [];
    const queryKeywords = this.extractKeywords(query);
    
    // Search through indexed messages
    queryKeywords.forEach(keyword => {
      const messages = this.messageIndex.get(keyword) || [];
      messages.forEach(message => {
        const relevance = this.calculateRelevance(query, message.content);
        if (relevance > 0.1) {
          results.push({
            type: 'message',
            id: message.id.toString(),
            title: `Message from ${message.user}`,
            content: message.content,
            server: (message as any).serverName,
            channel: (message as any).channelName,
            user: message.user,
            timestamp: message.time,
            relevanceScore: relevance,
            context: `In #${(message as any).channelName} on ${(message as any).serverName}`
          });
        }
      });
    });

    // Remove duplicates and sort by relevance
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.id === result.id)
    );
    
    return uniqueResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  searchServers(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    
    Array.from(this.serverIndex.values()).forEach(server => {
      // Create a fallback description if none exists
      const serverDescription = (server as any).description || `${server.name} Discord Server`;
      const relevance = this.calculateRelevance(query, `${server.name} ${serverDescription}`);
      if (relevance > 0.1) {
        results.push({
          type: 'server',
          id: server.id.toString(),
          title: server.name,
          content: serverDescription,
          relevanceScore: relevance,
          context: `${server.textChannels.length} text channels, ${server.voiceChannels.length} voice channels`
        });
      }
    });

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  searchChannels(query: string, serverId?: string): SearchResult[] {
    const results: SearchResult[] = [];
    
    Array.from(this.channelIndex.values()).forEach(channel => {
      if (serverId && channel.serverId.toString() !== serverId) return;
      
      const relevance = this.calculateRelevance(query, `${channel.name} ${channel.type}`);
      if (relevance > 0.1) {
        results.push({
          type: 'channel',
          id: channel.id,
          title: `#${channel.name}`,
          content: `${channel.type} channel`,
          server: channel.serverName,
          relevanceScore: relevance,
          context: `In ${channel.serverName}`
        });
      }
    });

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  findThreads(query: string, timeRange?: string): ThreadResult[] {
    const allMessages = this.getAllMessages();
    const threads: ThreadResult[] = [];
    
    // Group messages by topic similarity
    const topicGroups = this.groupMessagesByTopic(allMessages, query);
    
    topicGroups.forEach(group => {
      if (group.messages.length >= 2) { // At least 2 messages to form a thread
        const participants = [...new Set(group.messages.map(m => m.user))];
        threads.push({
          topic: group.topic,
          messages: group.messages,
          participants,
          startTime: group.messages[0].time || '',
          endTime: group.messages[group.messages.length - 1].time || '',
          server: (group.messages[0] as any).serverName || '',
          channel: (group.messages[0] as any).channelName || '',
          relevanceScore: group.relevanceScore
        });
      }
    });

    return threads.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private getAllMessages(): any[] {
    const allMessages: any[] = [];
    
    Array.from(this.messageIndex.values()).forEach(messages => {
      messages.forEach(message => {
        if (!allMessages.find(m => m.id === message.id)) {
          allMessages.push(message);
        }
      });
    });
    
    return allMessages;
  }

  private groupMessagesByTopic(messages: any[], query: string): Array<{
    topic: string;
    messages: any[];
    relevanceScore: number;
  }> {
    const groups: Array<{ topic: string; messages: any[]; relevanceScore: number }> = [];
    const queryKeywords = this.extractKeywords(query);
    
    // Simple topic grouping based on keyword overlap
    const topicMap = new Map<string, any[]>();
    
    messages.forEach(message => {
      const messageKeywords = this.extractKeywords(message.content);
      const overlap = queryKeywords.filter(qk => 
        messageKeywords.some(mk => mk.includes(qk) || qk.includes(mk))
      );
      
      if (overlap.length > 0) {
        const topicKey = overlap.join(' ');
        if (!topicMap.has(topicKey)) {
          topicMap.set(topicKey, []);
        }
        topicMap.get(topicKey)!.push(message);
      }
    });
    
    Array.from(topicMap.entries()).forEach(([topic, msgs]) => {
      const relevanceScore = this.calculateRelevance(query, topic);
      groups.push({
        topic,
        messages: msgs.sort((a, b) => 
          new Date(a.time || '').getTime() - new Date(b.time || '').getTime()
        ),
        relevanceScore
      });
    });
    
    return groups;
  }
}

// Export singleton instance
export const searchEngine = new SearchIndex();

// Main search function
export const performSearch = (searchQuery: SearchQuery): SearchResult[] => {
  const { query, type = 'all' } = searchQuery;
  let results: SearchResult[] = [];

  switch (type) {
    case 'message':
      results = searchEngine.searchMessages(query, searchQuery);
      break;
    case 'server':
      results = searchEngine.searchServers(query);
      break;
    case 'channel':
      results = searchEngine.searchChannels(query, searchQuery.server);
      break;
    case 'all':
    default:
      results = [
        ...searchEngine.searchMessages(query, searchQuery),
        ...searchEngine.searchServers(query),
        ...searchEngine.searchChannels(query, searchQuery.server)
      ];
      break;
  }

  return results.slice(0, 50); // Limit results
};

export const findHistoricalThreads = (query: string, timeRange?: string): ThreadResult[] => {
  return searchEngine.findThreads(query, timeRange);
};

// Smart navigation helpers
export const findSimilarServers = (currentServerId: string, criteria: string): SearchResult[] => {
  const currentServer = servers.find(s => s.id.toString() === currentServerId);
  if (!currentServer) return [];

  // Create a fallback description if none exists
  const serverDescription = (currentServer as any).description || `${currentServer.name} Discord Server`;
  const searchQuery = `${criteria} ${currentServer.name} ${serverDescription}`;
  return searchEngine.searchServers(searchQuery).filter(s => s.id !== currentServerId);
};

export const suggestChannels = (description: string, serverId?: string): SearchResult[] => {
  return searchEngine.searchChannels(description, serverId).slice(0, 10);
};
