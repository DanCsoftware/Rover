import { SearchQuery, SearchResult, ThreadResult, performSearch, findHistoricalThreads, suggestChannels, findSimilarServers } from './searchEngine';

// Export the types so they can be imported elsewhere
export type { SearchResult, ThreadResult };

export interface ProcessedQuery {
  intent: 'search' | 'navigate' | 'find_threads' | 'find_servers' | 'find_channels' | 'summary_search';
  searchQuery: SearchQuery;
  additionalContext?: string;
  suggestions?: string[];
}

export interface SearchResponse {
  type: 'search_results' | 'navigation' | 'threads' | 'servers' | 'channels' | 'error';
  results?: SearchResult[];
  threads?: ThreadResult[];
  message: string;
  suggestions?: string[];
  navigationTarget?: {
    type: 'server' | 'channel';
    id: string;
    name: string;
  };
}

export class QueryProcessor {
  private searchPatterns = {
    messages: [
      /find.*messages?.*about/i,
      /search.*for.*messages?/i,
      /show.*discussions?.*about/i,
      /what.*said.*about/i,
      /messages?.*containing/i,
      /discussions?.*about/i,
      /conversations?.*about/i
    ],
    threads: [
      /find.*threads?.*about/i,
      /show.*threads?/i,
      /thread.*about/i,
      /conversations?.*threads?/i,
      /discussion.*threads?/i,
      /recall.*thread/i,
      /remember.*discussion/i
    ],
    servers: [
      /find.*servers?.*with/i,
      /show.*servers?.*for/i,
      /servers?.*about/i,
      /servers?.*focused.*on/i,
      /servers?.*similar.*to/i,
      /gaming.*servers?/i,
      /music.*servers?/i,
      /servers?.*like/i
    ],
    channels: [
      /find.*channels?.*for/i,
      /show.*channels?.*about/i,
      /channels?.*for/i,
      /navigate.*to.*channel/i,
      /channel.*about/i,
      /find.*channel.*where/i,
      /channels?.*discussing/i
    ],
    navigation: [
      /navigate.*to/i,
      /go.*to/i,
      /take.*me.*to/i,
      /switch.*to/i,
      /open.*channel/i,
      /join.*channel/i
    ],
    timeFilters: [
      /past.*hour/i,
      /last.*hour/i,
      /past.*day/i,
      /today/i,
      /yesterday/i,
      /past.*week/i,
      /last.*week/i,
      /this.*week/i,
      /past.*month/i,
      /last.*month/i,
      /this.*month/i
    ],
    userFilters: [
      /from.*user/i,
      /by.*user/i,
      /what.*(\w+).*said/i,
      /messages.*from.*(\w+)/i,
      /(\w+).*discussed/i,
      /(\w+)'s.*messages/i
    ]
  };

  processQuery(query: string, currentServer?: string, currentChannel?: string): ProcessedQuery {
    const lowerQuery = query.toLowerCase();
    
    // Determine intent
    let intent: ProcessedQuery['intent'] = 'search';
    
    if (this.matchesPatterns(lowerQuery, this.searchPatterns.threads)) {
      intent = 'find_threads';
    } else if (this.matchesPatterns(lowerQuery, this.searchPatterns.servers)) {
      intent = 'find_servers';
    } else if (this.matchesPatterns(lowerQuery, this.searchPatterns.channels)) {
      intent = 'find_channels';
    } else if (this.matchesPatterns(lowerQuery, this.searchPatterns.navigation)) {
      intent = 'navigate';
    }

    // Extract search parameters
    const searchQuery: SearchQuery = {
      query: this.extractSearchTerms(query),
      type: this.determineSearchType(lowerQuery),
      timeRange: this.extractTimeRange(lowerQuery),
      user: this.extractUserFilter(lowerQuery),
      server: currentServer,
      channel: currentChannel
    };

    // Generate suggestions
    const suggestions = this.generateSuggestions(intent, searchQuery);

    return {
      intent,
      searchQuery,
      suggestions,
      additionalContext: `Current context: ${currentServer || 'No server'} > ${currentChannel || 'No channel'}`
    };
  }

  private matchesPatterns(query: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(query));
  }

  private extractSearchTerms(query: string): string {
    // Remove command words and keep content
    const commandWords = ['find', 'search', 'show', 'get', 'display', 'about', 'for', 'with', 'from', 'by', 'navigate', 'go', 'to'];
    const words = query.toLowerCase().split(/\s+/);
    const contentWords = words.filter(word => 
      !commandWords.includes(word) && 
      word.length > 2 &&
      !this.isTimeWord(word) &&
      !this.isUserWord(word, query)
    );
    
    return contentWords.join(' ');
  }

  private determineSearchType(query: string): SearchQuery['type'] {
    if (this.matchesPatterns(query, this.searchPatterns.messages)) return 'message';
    if (this.matchesPatterns(query, this.searchPatterns.servers)) return 'server';
    if (this.matchesPatterns(query, this.searchPatterns.channels)) return 'channel';
    return 'all';
  }

  private extractTimeRange(query: string): SearchQuery['timeRange'] {
    if (/hour/i.test(query)) return 'hour';
    if (/day|today|yesterday/i.test(query)) return 'day';
    if (/week/i.test(query)) return 'week';
    if (/month/i.test(query)) return 'month';
    return 'all';
  }

  private extractUserFilter(query: string): string | undefined {
    const userMatches = query.match(/(?:from|by|what|messages from)\s+(\w+)/i);
    if (userMatches) return userMatches[1];
    
    const discussionMatches = query.match(/(\w+)\s+(?:said|discussed|talked)/i);
    if (discussionMatches) return discussionMatches[1];
    
    return undefined;
  }

  private isTimeWord(word: string): boolean {
    const timeWords = ['hour', 'day', 'week', 'month', 'today', 'yesterday', 'past', 'last', 'this'];
    return timeWords.includes(word);
  }

  private isUserWord(word: string, fullQuery: string): boolean {
    return /(?:from|by|what|messages from)\s+\w+/i.test(fullQuery) && 
           fullQuery.toLowerCase().includes(word);
  }

  private generateSuggestions(intent: ProcessedQuery['intent'], searchQuery: SearchQuery): string[] {
    const suggestions: string[] = [];
    
    switch (intent) {
      case 'search':
        suggestions.push(
          `Try: "find messages about ${searchQuery.query} from last week"`,
          `Try: "show discussions about ${searchQuery.query} by specific user"`,
          `Try: "find threads about ${searchQuery.query}"`
        );
        break;
      case 'find_threads':
        suggestions.push(
          `Try: "find all threads about ${searchQuery.query}"`,
          `Try: "show conversation threads from past month"`,
          `Try: "recall discussions about ${searchQuery.query}"`
        );
        break;
      case 'find_servers':
        suggestions.push(
          `Try: "find gaming servers with active players"`,
          `Try: "show music servers similar to this one"`,
          `Try: "servers focused on ${searchQuery.query}"`
        );
        break;
      case 'find_channels':
        suggestions.push(
          `Try: "find channels for ${searchQuery.query}"`,
          `Try: "show channels about ${searchQuery.query}"`,
          `Try: "navigate to ${searchQuery.query} channel"`
        );
        break;
    }
    
    return suggestions.slice(0, 3);
  }

  async executeSearch(processedQuery: ProcessedQuery, currentServer?: string): Promise<SearchResponse> {
    const { intent, searchQuery } = processedQuery;
    
    try {
      switch (intent) {
        case 'find_threads':
          const threads = findHistoricalThreads(searchQuery.query, searchQuery.timeRange);
          return {
            type: 'threads',
            threads,
            message: threads.length > 0 
              ? `Found ${threads.length} conversation thread(s) about "${searchQuery.query}"`
              : `No threads found about "${searchQuery.query}". Try broadening your search terms.`,
            suggestions: processedQuery.suggestions
          };

        case 'find_servers':
          const servers = performSearch({ ...searchQuery, type: 'server' });
          return {
            type: 'servers',
            results: servers,
            message: servers.length > 0
              ? `Found ${servers.length} server(s) matching "${searchQuery.query}"`
              : `No servers found matching "${searchQuery.query}". Try different keywords.`,
            suggestions: processedQuery.suggestions
          };

        case 'find_channels':
          const channels = suggestChannels(searchQuery.query, currentServer);
          return {
            type: 'channels',
            results: channels,
            message: channels.length > 0
              ? `Found ${channels.length} channel(s) for "${searchQuery.query}"`
              : `No channels found for "${searchQuery.query}". Try different terms.`,
            suggestions: processedQuery.suggestions
          };

        case 'navigate':
          const navChannels = suggestChannels(searchQuery.query, currentServer);
          if (navChannels.length > 0) {
            return {
              type: 'navigation',
              results: navChannels,
              message: `Here are channels you can navigate to for "${searchQuery.query}":`,
              navigationTarget: {
                type: 'channel',
                id: navChannels[0].id,
                name: navChannels[0].title
              },
              suggestions: ['Click on any channel to navigate there']
            };
          }
          return {
            type: 'error',
            message: `Couldn't find channels to navigate to for "${searchQuery.query}". Try being more specific.`,
            suggestions: processedQuery.suggestions
          };

        case 'search':
        default:
          const results = performSearch(searchQuery);
          return {
            type: 'search_results',
            results,
            message: results.length > 0
              ? `Found ${results.length} result(s) for "${searchQuery.query}"`
              : `No results found for "${searchQuery.query}". Try different keywords.`,
            suggestions: processedQuery.suggestions
          };
      }
    } catch (error) {
      return {
        type: 'error',
        message: `Search error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestions: ['Try simplifying your search query', 'Check for typos', 'Use different keywords']
      };
    }
  }
}

export const queryProcessor = new QueryProcessor();
