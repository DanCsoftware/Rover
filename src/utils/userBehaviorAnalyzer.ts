import { Message, User } from '@/data/discordData';

export interface UserRiskProfile {
  userId: string;
  username: string;
  riskScore: number; // 0-100
  violations: Violation[];
  behaviorPatterns: BehaviorPattern[];
  recentActivity: ActivitySummary;
  recommendedAction: ModerationAction;
  joinDate?: string;
  messageCount: number;
  channelsActive: string[];
}

export interface Violation {
  id: string;
  type: 'harassment' | 'spam' | 'toxicity' | 'inappropriate_content' | 'rule_violation' | 'suspicious_links';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  timestamp: string;
  channel: string;
  reportedBy?: string;
  resolved: boolean;
  ruleViolated?: number;    // Which rule number was violated
  ruleName?: string;        // Rule title for display
}

export interface BehaviorPattern {
  pattern: 'excessive_profanity' | 'targeted_harassment' | 'spam_posting' | 'link_farming' | 'rapid_posting' | 'off_topic' | 'bot_like';
  confidence: number; // 0-1
  frequency: number;
  examples: string[];
  timespan: string;
}

export interface ActivitySummary {
  messagesLast24h: number;
  messagesLastWeek: number;
  averageMessageLength: number;
  peakActivityHours: number[];
  channelDistribution: Record<string, number>;
  reactionRatio: number; // positive reactions / total messages
}

export interface ModerationAction {
  action: 'monitor' | 'warn' | 'mute' | 'kick' | 'ban' | 'require_verification';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  duration?: string;
  autoFlag: boolean;
}

export class UserBehaviorAnalyzer {
  private toxicityKeywords = [
    'hate', 'toxic', 'kill yourself', 'kys', 'retard', 'gay', 'stupid', 'idiot', 'loser', 
    'noob', 'trash', 'garbage', 'pathetic', 'worthless'
  ];

  private harassmentPatterns = [
    /you\s+(are|r)\s+(stupid|dumb|trash|garbage|worthless)/i,
    /kill\s+your?self/i,
    /go\s+die/i,
    /nobody\s+likes\s+you/i,
    /shut\s+up/i
  ];

  private spamIndicators = [
    /(.)\1{10,}/, // repeated characters
    /LOOK\s+AT\s+THIS|CHECK\s+THIS\s+OUT|CLICK\s+HERE/i,
    /FREE\s+MONEY|MAKE\s+MONEY|EASY\s+CASH/i
  ];

  analyzeUser(userId: string, messages: Message[], allUsers: User[]): UserRiskProfile {
    const userMessages = messages.filter(m => m.user === userId || m.user.includes(userId));
    const user = allUsers.find(u => u.id === userId || u.name === userId);
    
    if (userMessages.length === 0) {
      return this.createLowRiskProfile(userId, user?.name || userId);
    }

    const violations = this.detectViolations(userMessages);
    const behaviorPatterns = this.analyzeBehaviorPatterns(userMessages);
    const activitySummary = this.generateActivitySummary(userMessages);
    const riskScore = this.calculateRiskScore(violations, behaviorPatterns, activitySummary);
    const recommendedAction = this.getRecommendedAction(riskScore, violations, behaviorPatterns);

    return {
      userId,
      username: user?.name || userId,
      riskScore,
      violations,
      behaviorPatterns,
      recentActivity: activitySummary,
      recommendedAction,
      joinDate: user?.createdOn,
      messageCount: userMessages.length,
      channelsActive: ['general'] // Placeholder - would need to track channel context
    };
  }

  analyzeMultipleUsers(userIds: string[], messages: Message[], allUsers: User[]): UserRiskProfile[] {
    return userIds.map(userId => this.analyzeUser(userId, messages, allUsers))
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  getHighRiskUsers(messages: Message[], allUsers: User[], threshold: number = 60): UserRiskProfile[] {
    const allUserIds = [...new Set(messages.map(m => m.user))];
    const profiles = this.analyzeMultipleUsers(allUserIds, messages, allUsers);
    return profiles.filter(profile => profile.riskScore >= threshold);
  }

  private detectViolations(messages: Message[]): Violation[] {
    const violations: Violation[] = [];
    
    messages.forEach((message, index) => {
      // Toxicity detection
      const toxicityLevel = this.analyzeToxicity(message.content);
      if (toxicityLevel > 0.6) {
        violations.push({
          id: `toxicity_${index}`,
          type: 'toxicity',
          severity: toxicityLevel > 0.8 ? 'high' : 'medium',
          description: 'Toxic language detected',
          evidence: [message.content],
          timestamp: message.time || 'unknown',
          channel: 'general', // Placeholder - would need channel context
          resolved: false
        });
      }

      // Harassment detection
      if (this.detectHarassment(message.content)) {
        violations.push({
          id: `harassment_${index}`,
          type: 'harassment',
          severity: 'high',
          description: 'Harassment language detected',
          evidence: [message.content],
          timestamp: message.time || 'unknown',
          channel: 'general', // Placeholder - would need channel context
          resolved: false
        });
      }

      // Spam detection
      if (this.detectSpam(message.content)) {
        violations.push({
          id: `spam_${index}`,
          type: 'spam',
          severity: 'medium',
          description: 'Spam content detected',
          evidence: [message.content],
          timestamp: message.time || 'unknown',
          channel: 'general', // Placeholder - would need channel context
          resolved: false
        });
      }
    });

    return violations;
  }

  private analyzeBehaviorPatterns(messages: Message[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // Excessive profanity
    const profanityCount = messages.filter(m => 
      this.toxicityKeywords.some(word => m.content.toLowerCase().includes(word))
    ).length;
    
    if (profanityCount > messages.length * 0.3) {
      patterns.push({
        pattern: 'excessive_profanity',
        confidence: Math.min(profanityCount / messages.length, 1),
        frequency: profanityCount,
        examples: messages.filter(m => 
          this.toxicityKeywords.some(word => m.content.toLowerCase().includes(word))
        ).slice(0, 3).map(m => m.content),
        timespan: 'recent activity'
      });
    }

    // Rapid posting
    const rapidPostingThreshold = 5; // messages within 1 minute
    let rapidPosts = 0;
    for (let i = 0; i < messages.length - rapidPostingThreshold; i++) {
      const timeWindow = messages.slice(i, i + rapidPostingThreshold);
      if (this.isRapidPosting(timeWindow)) {
        rapidPosts++;
      }
    }

    if (rapidPosts > 3) {
      patterns.push({
        pattern: 'rapid_posting',
        confidence: Math.min(rapidPosts / 10, 1),
        frequency: rapidPosts,
        examples: messages.slice(0, 3).map(m => m.content),
        timespan: 'recent activity'
      });
    }

    return patterns;
  }

  private generateActivitySummary(messages: Message[]): ActivitySummary {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const messagesLast24h = messages.filter(m => {
      const msgTime = new Date(m.time || '');
      return msgTime > last24h;
    }).length;

    const messagesLastWeek = messages.filter(m => {
      const msgTime = new Date(m.time || '');
      return msgTime > lastWeek;
    }).length;

    const channelDistribution: Record<string, number> = {};
    messages.forEach(m => {
      const channel = 'general'; // Placeholder - would need channel context
      channelDistribution[channel] = (channelDistribution[channel] || 0) + 1;
    });

    return {
      messagesLast24h,
      messagesLastWeek,
      averageMessageLength: messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length,
      peakActivityHours: this.calculatePeakHours(messages),
      channelDistribution,
      reactionRatio: 0.5 // Placeholder - would need reaction data
    };
  }

  private calculateRiskScore(violations: Violation[], patterns: BehaviorPattern[], activity: ActivitySummary): number {
    let score = 0;
    
    // Violation scoring
    violations.forEach(v => {
      switch (v.severity) {
        case 'critical': score += 25; break;
        case 'high': score += 15; break;
        case 'medium': score += 8; break;
        case 'low': score += 3; break;
      }
    });

    // Pattern scoring
    patterns.forEach(p => {
      score += p.confidence * 20;
    });

    // Activity scoring (suspicious patterns)
    if (activity.messagesLast24h > 100) score += 10; // Excessive posting
    if (activity.averageMessageLength < 10) score += 5; // Very short messages
    if (activity.reactionRatio < 0.1) score += 8; // Poor community reception

    return Math.min(score, 100);
  }

  private getRecommendedAction(riskScore: number, violations: Violation[], patterns: BehaviorPattern[]): ModerationAction {
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const highViolations = violations.filter(v => v.severity === 'high').length;

    if (riskScore >= 85 || criticalViolations > 0) {
      return {
        action: 'ban',
        priority: 'urgent',
        reason: 'Multiple severe violations detected',
        autoFlag: true
      };
    }

    if (riskScore >= 70 || highViolations >= 3) {
      return {
        action: 'mute',
        priority: 'high',
        reason: 'Repeated rule violations and toxic behavior',
        duration: '24 hours',
        autoFlag: true
      };
    }

    if (riskScore >= 50) {
      return {
        action: 'warn',
        priority: 'medium',
        reason: 'Concerning behavior patterns detected',
        autoFlag: true
      };
    }

    if (riskScore >= 30) {
      return {
        action: 'monitor',
        priority: 'low',
        reason: 'Minor violations, monitor for escalation',
        autoFlag: false
      };
    }

    return {
      action: 'monitor',
      priority: 'low',
      reason: 'Low risk user',
      autoFlag: false
    };
  }

  private createLowRiskProfile(userId: string, username: string): UserRiskProfile {
    return {
      userId,
      username,
      riskScore: 0,
      violations: [],
      behaviorPatterns: [],
      recentActivity: {
        messagesLast24h: 0,
        messagesLastWeek: 0,
        averageMessageLength: 0,
        peakActivityHours: [],
        channelDistribution: {},
        reactionRatio: 0
      },
      recommendedAction: {
        action: 'monitor',
        priority: 'low',
        reason: 'No activity found',
        autoFlag: false
      },
      messageCount: 0,
      channelsActive: []
    };
  }

  private analyzeToxicity(content: string): number {
    const lowerContent = content.toLowerCase();
    let toxicityScore = 0;
    let totalPossible = this.toxicityKeywords.length + this.harassmentPatterns.length;

    // Check toxic keywords
    this.toxicityKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        toxicityScore += 1;
      }
    });

    // Check harassment patterns
    this.harassmentPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        toxicityScore += 2; // Patterns are weighted higher
        totalPossible += 1; // Adjust total for weighted pattern
      }
    });

    return Math.min(toxicityScore / totalPossible, 1);
  }

  private detectHarassment(content: string): boolean {
    return this.harassmentPatterns.some(pattern => pattern.test(content));
  }

  private detectSpam(content: string): boolean {
    return this.spamIndicators.some(pattern => pattern.test(content));
  }

  private isRapidPosting(messages: Message[]): boolean {
    if (messages.length < 2) return false;
    
    const times = messages.map(m => new Date(m.time || '').getTime()).filter(t => !isNaN(t));
    if (times.length < 2) return false;
    
    times.sort((a, b) => a - b);
    const timeSpan = times[times.length - 1] - times[0];
    return timeSpan < 60000; // Less than 1 minute
  }

  private calculatePeakHours(messages: Message[]): number[] {
    const hourCounts: Record<number, number> = {};
    
    messages.forEach(m => {
      const hour = new Date(m.time || '').getHours();
      if (!isNaN(hour)) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    // Return top 3 active hours
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }
}

export const userBehaviorAnalyzer = new UserBehaviorAnalyzer();