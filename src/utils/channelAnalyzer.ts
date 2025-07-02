import { Channel, Message, Server } from '@/data/discordData';

export interface ChannelHealth {
  channelId: string;
  channelName: string;
  serverId?: number;
  serverName?: string;
  healthScore: number; // 0-100
  activityLevel: 'dead' | 'low' | 'moderate' | 'high' | 'very_high';
  lastActivity: string;
  messageCount: number;
  uniqueUsers: number;
  averageMessageLength: number;
  engagementRate: number;
  peakActivityPeriods: string[];
  commonTopics: string[];
  recommendation: ChannelRecommendation;
  redundancyWith: string[];
  qualityMetrics: QualityMetrics;
}

export interface ChannelRecommendation {
  action: 'keep' | 'archive' | 'delete' | 'merge' | 'restructure';
  priority: 'low' | 'medium' | 'high';
  reason: string;
  mergeWith?: string[];
  expectedImpact: string;
  confidence: number; // 0-1
}

export interface QualityMetrics {
  averageDiscussionLength: number;
  ruleViolationsPerDay: number;
  spamRatio: number;
  positiveEngagement: number;
  offTopicRatio: number;
  moderationNeeded: boolean;
}

export interface ServerOptimization {
  serverId: number;
  serverName: string;
  totalChannels: number;
  activeChannels: number;
  redundantChannels: string[];
  underperformingChannels: string[];
  recommendations: ChannelRecommendation[];
  optimizationScore: number; // 0-100
  potentialImprovements: string[];
}

export class ChannelAnalyzer {
  private readonly ACTIVITY_THRESHOLD_DAYS = 7;
  private readonly LOW_MESSAGE_THRESHOLD = 10;
  private readonly REDUNDANCY_THRESHOLD = 0.7; // 70% content similarity

  analyzeChannel(channel: Channel, serverContext?: Server): ChannelHealth {
    const messages = channel.messages || [];
    const lastActivity = this.getLastActivity(messages);
    const uniqueUsers = this.getUniqueUsers(messages);
    const averageMessageLength = this.getAverageMessageLength(messages);
    const engagementRate = this.calculateEngagementRate(messages);
    const activityLevel = this.determineActivityLevel(messages, lastActivity);
    const healthScore = this.calculateHealthScore(messages, activityLevel, engagementRate);
    const commonTopics = this.extractCommonTopics(messages);
    const qualityMetrics = this.calculateQualityMetrics(messages);
    const recommendation = this.generateRecommendation(healthScore, activityLevel, qualityMetrics, messages);

    return {
      channelId: channel.id,
      channelName: channel.name,
      serverId: serverContext?.id,
      serverName: serverContext?.name,
      healthScore,
      activityLevel,
      lastActivity,
      messageCount: messages.length,
      uniqueUsers: uniqueUsers.length,
      averageMessageLength,
      engagementRate,
      peakActivityPeriods: this.findPeakActivityPeriods(messages),
      commonTopics,
      recommendation,
      redundancyWith: [], // Will be filled by server-wide analysis
      qualityMetrics
    };
  }

  analyzeServer(server: Server): ServerOptimization {
    const channelHealths = server.textChannels.map(channel => 
      this.analyzeChannel(channel, server)
    );

    // Find redundant channels
    const redundancyMap = this.findRedundantChannels(channelHealths, server.textChannels);
    
    // Update redundancy information
    channelHealths.forEach(health => {
      health.redundancyWith = redundancyMap[health.channelId] || [];
    });

    const activeChannels = channelHealths.filter(h => h.activityLevel !== 'dead').length;
    const underperformingChannels = channelHealths
      .filter(h => h.healthScore < 40)
      .map(h => h.channelName);
    
    const redundantChannels = Object.entries(redundancyMap)
      .filter(([, redundant]) => redundant.length > 0)
      .map(([channelId]) => channelHealths.find(h => h.channelId === channelId)?.channelName || channelId);

    const recommendations = this.generateServerRecommendations(channelHealths);
    const optimizationScore = this.calculateServerOptimizationScore(channelHealths);

    return {
      serverId: server.id,
      serverName: server.name,
      totalChannels: server.textChannels.length,
      activeChannels,
      redundantChannels,
      underperformingChannels,
      recommendations,
      optimizationScore,
      potentialImprovements: this.generateImprovementSuggestions(channelHealths)
    };
  }

  getChannelDeletionCandidates(serverOptimization: ServerOptimization, riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'): ChannelHealth[] {
    const thresholds = {
      conservative: 20,
      moderate: 30,
      aggressive: 45
    };

    return serverOptimization.recommendations
      .filter(rec => rec.action === 'delete' && rec.confidence > (riskTolerance === 'conservative' ? 0.8 : 0.6))
      .map(rec => {
        // Find the channel health for this recommendation
        return {
          channelId: 'placeholder',
          channelName: 'placeholder',
          healthScore: 0,
          activityLevel: 'dead' as const,
          lastActivity: '',
          messageCount: 0,
          uniqueUsers: 0,
          averageMessageLength: 0,
          engagementRate: 0,
          peakActivityPeriods: [],
          commonTopics: [],
          recommendation: rec,
          redundancyWith: [],
          qualityMetrics: {
            averageDiscussionLength: 0,
            ruleViolationsPerDay: 0,
            spamRatio: 0,
            positiveEngagement: 0,
            offTopicRatio: 0,
            moderationNeeded: false
          }
        };
      });
  }

  private getLastActivity(messages: Message[]): string {
    if (messages.length === 0) return 'Never';
    
    const sortedMessages = messages
      .filter(m => m.time)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    if (sortedMessages.length === 0) return 'Unknown';
    
    const lastMessage = new Date(sortedMessages[0].time);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastMessage.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff < 7) return `${daysDiff} days ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
    if (daysDiff < 365) return `${Math.floor(daysDiff / 30)} months ago`;
    return `${Math.floor(daysDiff / 365)} years ago`;
  }

  private getUniqueUsers(messages: Message[]): string[] {
    return [...new Set(messages.map(m => m.user))];
  }

  private getAverageMessageLength(messages: Message[]): number {
    if (messages.length === 0) return 0;
    return messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
  }

  private calculateEngagementRate(messages: Message[]): number {
    if (messages.length === 0) return 0;
    
    // Simple engagement calculation based on messages with reactions/responses
    const engagedMessages = messages.filter(m => 
      m.hasReactions || 
      m.content.includes('@') || // Mentions
      m.content.includes('!') || // Excitement
      m.content.length > 50 // Substantial messages
    ).length;
    
    return engagedMessages / messages.length;
  }

  private determineActivityLevel(messages: Message[], lastActivity: string): ChannelHealth['activityLevel'] {
    const recentMessages = this.getRecentMessages(messages, this.ACTIVITY_THRESHOLD_DAYS);
    const dailyAverage = recentMessages.length / this.ACTIVITY_THRESHOLD_DAYS;
    
    if (dailyAverage === 0) return 'dead';
    if (dailyAverage < 2) return 'low';
    if (dailyAverage < 10) return 'moderate';
    if (dailyAverage < 50) return 'high';
    return 'very_high';
  }

  private calculateHealthScore(messages: Message[], activityLevel: ChannelHealth['activityLevel'], engagementRate: number): number {
    let score = 0;
    
    // Activity scoring (40 points)
    switch (activityLevel) {
      case 'dead': score += 0; break;
      case 'low': score += 10; break;
      case 'moderate': score += 25; break;
      case 'high': score += 35; break;
      case 'very_high': score += 40; break;
    }
    
    // Engagement scoring (30 points)
    score += engagementRate * 30;
    
    // Consistency scoring (30 points)
    const consistencyScore = this.calculateConsistencyScore(messages);
    score += consistencyScore * 30;
    
    return Math.min(Math.round(score), 100);
  }

  private calculateConsistencyScore(messages: Message[]): number {
    if (messages.length < 7) return 0;
    
    // Measure consistency of activity over time
    const dailyMessageCounts = this.getDailyMessageCounts(messages);
    const variance = this.calculateVariance(Object.values(dailyMessageCounts));
    
    // Lower variance = higher consistency
    return Math.max(0, 1 - variance / 100);
  }

  private extractCommonTopics(messages: Message[]): string[] {
    const words = messages
      .flatMap(m => m.content.toLowerCase().split(/\s+/))
      .filter(word => word.length > 3)
      .filter(word => !this.isCommonWord(word));
    
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    return Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private calculateQualityMetrics(messages: Message[]): QualityMetrics {
    const totalMessages = messages.length;
    if (totalMessages === 0) {
      return {
        averageDiscussionLength: 0,
        ruleViolationsPerDay: 0,
        spamRatio: 0,
        positiveEngagement: 0,
        offTopicRatio: 0,
        moderationNeeded: false
      };
    }

    const shortMessages = messages.filter(m => m.content.length < 20).length;
    const repeatedMessages = this.findRepeatedMessages(messages);
    const positiveMessages = messages.filter(m => 
      /thanks|great|awesome|cool|good|nice/i.test(m.content)
    ).length;

    const spamRatio = (shortMessages + repeatedMessages.length) / totalMessages;
    const positiveEngagement = positiveMessages / totalMessages;

    return {
      averageDiscussionLength: this.getAverageMessageLength(messages),
      ruleViolationsPerDay: 0, // Would need rule violation detection
      spamRatio,
      positiveEngagement,
      offTopicRatio: 0, // Would need topic analysis
      moderationNeeded: spamRatio > 0.3 || positiveEngagement < 0.1
    };
  }

  private generateRecommendation(healthScore: number, activityLevel: ChannelHealth['activityLevel'], qualityMetrics: QualityMetrics, messages: Message[]): ChannelRecommendation {
    if (healthScore < 20 && activityLevel === 'dead') {
      return {
        action: 'delete',
        priority: 'medium',
        reason: 'Channel has been inactive with very low engagement',
        expectedImpact: 'Minimal impact - no recent activity to lose',
        confidence: 0.9
      };
    }

    if (healthScore < 35 && qualityMetrics.spamRatio > 0.4) {
      return {
        action: 'restructure',
        priority: 'high',
        reason: 'High spam ratio indicates poor channel management',
        expectedImpact: 'Improved quality and user experience',
        confidence: 0.8
      };
    }

    if (healthScore < 50 && activityLevel === 'low') {
      return {
        action: 'merge',
        priority: 'low',
        reason: 'Low activity could benefit from consolidation',
        expectedImpact: 'Increased activity in merged channel',
        confidence: 0.6
      };
    }

    return {
      action: 'keep',
      priority: 'low',
      reason: 'Channel shows healthy activity and engagement',
      expectedImpact: 'Continue positive community engagement',
      confidence: 0.9
    };
  }

  private findRedundantChannels(channelHealths: ChannelHealth[], channels: Channel[]): Record<string, string[]> {
    const redundancyMap: Record<string, string[]> = {};
    
    // Simple name-based redundancy detection
    channelHealths.forEach((health, i) => {
      const similarChannels: string[] = [];
      
      channelHealths.forEach((otherHealth, j) => {
        if (i !== j) {
          const similarity = this.calculateNameSimilarity(health.channelName, otherHealth.channelName);
          if (similarity > this.REDUNDANCY_THRESHOLD) {
            similarChannels.push(otherHealth.channelName);
          }
        }
      });
      
      if (similarChannels.length > 0) {
        redundancyMap[health.channelId] = similarChannels;
      }
    });
    
    return redundancyMap;
  }

  private generateServerRecommendations(channelHealths: ChannelHealth[]): ChannelRecommendation[] {
    return channelHealths
      .map(health => health.recommendation)
      .filter(rec => rec.action !== 'keep')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  private calculateServerOptimizationScore(channelHealths: ChannelHealth[]): number {
    if (channelHealths.length === 0) return 0;
    
    const averageHealth = channelHealths.reduce((sum, h) => sum + h.healthScore, 0) / channelHealths.length;
    const activeRatio = channelHealths.filter(h => h.activityLevel !== 'dead').length / channelHealths.length;
    
    return Math.round((averageHealth * 0.7) + (activeRatio * 30));
  }

  private generateImprovementSuggestions(channelHealths: ChannelHealth[]): string[] {
    const suggestions: string[] = [];
    
    const deadChannels = channelHealths.filter(h => h.activityLevel === 'dead').length;
    const lowEngagement = channelHealths.filter(h => h.engagementRate < 0.2).length;
    
    if (deadChannels > 0) {
      suggestions.push(`Remove ${deadChannels} inactive channels to reduce clutter`);
    }
    
    if (lowEngagement > 0) {
      suggestions.push(`Improve engagement in ${lowEngagement} channels with events or prompts`);
    }
    
    const redundantCount = channelHealths.filter(h => h.redundancyWith.length > 0).length;
    if (redundantCount > 0) {
      suggestions.push(`Consolidate ${redundantCount} redundant channels`);
    }
    
    return suggestions;
  }

  private getRecentMessages(messages: Message[], days: number): Message[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return messages.filter(m => {
      const msgDate = new Date(m.time || '');
      return msgDate > cutoff;
    });
  }

  private getDailyMessageCounts(messages: Message[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    messages.forEach(m => {
      const date = new Date(m.time || '').toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });
    
    return counts;
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private findPeakActivityPeriods(messages: Message[]): string[] {
    const hourCounts: Record<number, number> = {};
    
    messages.forEach(m => {
      const hour = new Date(m.time || '').getHours();
      if (!isNaN(hour)) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00-${hour}:59`);
  }

  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'that', 'have', 'this', 'will', 'with', 'they', 'from', 'been'];
    return commonWords.includes(word);
  }

  private findRepeatedMessages(messages: Message[]): Message[] {
    const contentCounts: Record<string, number> = {};
    
    messages.forEach(m => {
      const content = m.content.toLowerCase().trim();
      contentCounts[content] = (contentCounts[content] || 0) + 1;
    });
    
    return messages.filter(m => contentCounts[m.content.toLowerCase().trim()] > 2);
  }

  private calculateNameSimilarity(name1: string, name2: string): number {
    const words1 = name1.toLowerCase().split(/[-_\s]+/);
    const words2 = name2.toLowerCase().split(/[-_\s]+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return commonWords.length / totalWords;
  }
}

export const channelAnalyzer = new ChannelAnalyzer();