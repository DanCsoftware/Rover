import { Message, User, Server, cryptoCentralRules, ServerRule } from '@/data/discordData';
import { UserBehaviorAnalyzer, UserRiskProfile, userBehaviorAnalyzer, Violation } from './userBehaviorAnalyzer';
import { ChannelAnalyzer, ChannelHealth, ServerOptimization, channelAnalyzer } from './channelAnalyzer';
// Import statement removed - functionality will be integrated directly

export interface ModerationReport {
  type: 'user_safety' | 'channel_optimization' | 'server_health' | 'comprehensive';
  generatedAt: string;
  summary: string;
  highPriorityIssues: Issue[];
  recommendations: Recommendation[];
  metrics: ReportMetrics;
  data: any; // Specific data based on report type
}

export interface Issue {
  id: string;
  type: 'user_violation' | 'channel_problem' | 'server_issue' | 'safety_concern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedUsers?: string[];
  affectedChannels?: string[];
  evidence: string[];
  suggestedActions: string[];
  timeframe: string;
  autoFlag: boolean;
}

export interface Recommendation {
  id: string;
  category: 'moderation' | 'channel_management' | 'community_building' | 'safety';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: string[];
  resources?: string[];
  timeEstimate: string;
}

export interface ReportMetrics {
  totalUsers: number;
  activeUsers: number;
  riskUsers: number;
  totalChannels: number;
  activeChannels: number;
  serverHealthScore: number;
  communityTrend: 'improving' | 'stable' | 'declining';
  violationsThisWeek: number;
  engagementRate: number;
}

export class ModerationEngine {
  private userAnalyzer: UserBehaviorAnalyzer;
  private channelAnalyzer: ChannelAnalyzer;

  constructor() {
    this.userAnalyzer = userBehaviorAnalyzer;
    this.channelAnalyzer = channelAnalyzer;
  }

  async generateUserSafetyReport(messages: Message[], users: User[], query?: string): Promise<ModerationReport> {
    console.log('Generating user safety report...');
    
    // Analyze all users or filter by query
    let targetUsers = users;
    if (query) {
      // Filter users based on query patterns
      targetUsers = this.filterUsersByQuery(users, query);
    }

    const userProfiles = this.userAnalyzer.analyzeMultipleUsers(
      targetUsers.map(u => u.id), 
      messages, 
      users
    );

    const highRiskUsers = userProfiles.filter(p => p.riskScore >= 60);
    const issues = this.generateUserIssues(highRiskUsers);
    const recommendations = this.generateUserRecommendations(userProfiles);

    const metrics: ReportMetrics = {
      totalUsers: users.length,
      activeUsers: userProfiles.filter(p => p.messageCount > 0).length,
      riskUsers: highRiskUsers.length,
      totalChannels: 0, // Not applicable for user report
      activeChannels: 0,
      serverHealthScore: this.calculateUserHealthScore(userProfiles),
      communityTrend: this.analyzeCommunityTrend(userProfiles),
      violationsThisWeek: highRiskUsers.reduce((sum, u) => sum + u.violations.length, 0),
      engagementRate: this.calculateUserEngagementRate(userProfiles)
    };

    return {
      type: 'user_safety',
      generatedAt: new Date().toISOString(),
      summary: this.generateUserSafetySummary(userProfiles, highRiskUsers),
      highPriorityIssues: issues.filter(i => i.severity === 'high' || i.severity === 'critical'),
      recommendations,
      metrics,
      data: {
        userProfiles: highRiskUsers,
        totalAnalyzed: userProfiles.length,
        riskDistribution: this.getRiskDistribution(userProfiles)
      }
    };
  }

  async generateChannelOptimizationReport(server: Server, query?: string): Promise<ModerationReport> {
    console.log('Generating channel optimization report...');
    
    const serverOptimization = this.channelAnalyzer.analyzeServer(server);
    const channelHealths = server.textChannels.map(channel => 
      this.channelAnalyzer.analyzeChannel(channel, server)
    );

    // Filter channels based on query if provided
    let targetChannels = channelHealths;
    if (query) {
      targetChannels = this.filterChannelsByQuery(channelHealths, query);
    }

    const issues = this.generateChannelIssues(targetChannels);
    const recommendations = this.generateChannelRecommendations(serverOptimization);

    const metrics: ReportMetrics = {
      totalUsers: 0, // Not applicable for channel report
      activeUsers: 0,
      riskUsers: 0,
      totalChannels: server.textChannels.length,
      activeChannels: channelHealths.filter(c => c.activityLevel !== 'dead').length,
      serverHealthScore: serverOptimization.optimizationScore,
      communityTrend: 'stable', // Would need historical data
      violationsThisWeek: 0,
      engagementRate: this.calculateChannelEngagementRate(channelHealths)
    };

    return {
      type: 'channel_optimization',
      generatedAt: new Date().toISOString(),
      summary: this.generateChannelOptimizationSummary(serverOptimization),
      highPriorityIssues: issues.filter(i => i.severity === 'high' || i.severity === 'critical'),
      recommendations,
      metrics,
      data: {
        serverOptimization,
        channelHealths: targetChannels,
        deletionCandidates: this.channelAnalyzer.getChannelDeletionCandidates(serverOptimization)
      }
    };
  }

  async generateComprehensiveReport(server: Server, messages: Message[], users: User[]): Promise<ModerationReport> {
    console.log('Generating comprehensive moderation report...');
    
    const userReport = await this.generateUserSafetyReport(messages, users);
    const channelReport = await this.generateChannelOptimizationReport(server);

    const combinedIssues = [...userReport.highPriorityIssues, ...channelReport.highPriorityIssues];
    const combinedRecommendations = [...userReport.recommendations, ...channelReport.recommendations];

    const metrics: ReportMetrics = {
      totalUsers: userReport.metrics.totalUsers,
      activeUsers: userReport.metrics.activeUsers,
      riskUsers: userReport.metrics.riskUsers,
      totalChannels: channelReport.metrics.totalChannels,
      activeChannels: channelReport.metrics.activeChannels,
      serverHealthScore: Math.round((userReport.metrics.serverHealthScore + channelReport.metrics.serverHealthScore) / 2),
      communityTrend: this.determineCombinedTrend(userReport.metrics, channelReport.metrics),
      violationsThisWeek: userReport.metrics.violationsThisWeek,
      engagementRate: Math.round((userReport.metrics.engagementRate + channelReport.metrics.engagementRate) / 2)
    };

    return {
      type: 'comprehensive',
      generatedAt: new Date().toISOString(),
      summary: this.generateComprehensiveSummary(userReport, channelReport, metrics),
      highPriorityIssues: combinedIssues.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      recommendations: combinedRecommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      metrics,
      data: {
        userSafety: userReport.data,
        channelOptimization: channelReport.data,
        overallHealth: metrics.serverHealthScore
      }
    };
  }

  formatReportForAI(report: ModerationReport, query: string): string {
    const { type, summary, highPriorityIssues, recommendations, metrics } = report;
    
    let response = `🔍 **${this.getReportTitle(type)} Report**\n\n`;
    response += `📊 **Summary:** ${summary}\n\n`;

    if (highPriorityIssues.length > 0) {
      response += `⚠️ **High Priority Issues:**\n`;
      highPriorityIssues.slice(0, 5).forEach((issue, index) => {
        const urgencyIcon = this.getUrgencyIcon(issue.severity);
        response += `\n${urgencyIcon} **${issue.title}** - ${issue.severity.toUpperCase()}\n`;
        response += `   ${issue.description}\n`;
        if (issue.suggestedActions.length > 0) {
          response += `   🎯 **Action:** ${issue.suggestedActions[0]}\n`;
        }
      });
      response += '\n';
    }

    if (type === 'user_safety') {
      response += this.formatUserSafetyDetails(report);
    } else if (type === 'channel_optimization') {
      response += this.formatChannelOptimizationDetails(report);
    }

    if (recommendations.length > 0) {
      response += `\n💡 **Recommendations:**\n`;
      recommendations.slice(0, 3).forEach((rec, index) => {
        response += `\n${index + 1}. **${rec.title}** (${rec.priority} priority)\n`;
        response += `   ${rec.description}\n`;
        response += `   📈 **Impact:** ${rec.expectedImpact}\n`;
      });
    }

    response += `\n📈 **Key Metrics:**\n`;
    response += `• Server Health Score: ${metrics.serverHealthScore}/100\n`;
    response += `• Community Trend: ${metrics.communityTrend}\n`;
    response += `• Active Users: ${metrics.activeUsers}/${metrics.totalUsers}\n`;
    if (metrics.riskUsers > 0) {
      response += `• Users Requiring Attention: ${metrics.riskUsers}\n`;
    }

    return response;
  }

  private filterUsersByQuery(users: User[], query: string): User[] {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('harass') || lowerQuery.includes('toxic')) {
      return users; // Return all for comprehensive analysis
    }
    
    if (lowerQuery.includes('new') || lowerQuery.includes('recent')) {
      // Filter to recently joined users
      return users.filter(u => {
        const joinDate = new Date(u.createdOn || '');
        const daysSinceJoin = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceJoin < 30; // Last 30 days
      });
    }
    
    return users;
  }

  private filterChannelsByQuery(channels: ChannelHealth[], query: string): ChannelHealth[] {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('delete') || lowerQuery.includes('remove')) {
      return channels.filter(c => 
        c.recommendation.action === 'delete' || 
        c.activityLevel === 'dead'
      );
    }
    
    if (lowerQuery.includes('inactive') || lowerQuery.includes('unused')) {
      return channels.filter(c => 
        c.activityLevel === 'dead' || 
        c.activityLevel === 'low'
      );
    }
    
    return channels;
  }

  private generateUserIssues(userProfiles: UserRiskProfile[]): Issue[] {
    const issues: Issue[] = [];
    
    userProfiles.forEach(profile => {
      if (profile.riskScore >= 80) {
        issues.push({
          id: `critical_user_${profile.userId}`,
          type: 'user_violation',
          severity: 'critical',
          title: `Critical Risk User: ${profile.username}`,
          description: `User shows severe behavioral issues with ${profile.violations.length} violations`,
          affectedUsers: [profile.username],
          evidence: profile.violations.map(v => v.description),
          suggestedActions: [profile.recommendedAction.reason],
          timeframe: 'Immediate action required',
          autoFlag: profile.recommendedAction.autoFlag
        });
      }
    });
    
    return issues;
  }

  private generateChannelIssues(channels: ChannelHealth[]): Issue[] {
    const issues: Issue[] = [];
    
    channels.forEach(channel => {
      if (channel.recommendation.action === 'delete' && channel.recommendation.confidence > 0.8) {
        issues.push({
          id: `delete_channel_${channel.channelId}`,
          type: 'channel_problem',
          severity: 'medium',
          title: `Channel Deletion Candidate: #${channel.channelName}`,
          description: channel.recommendation.reason,
          affectedChannels: [channel.channelName],
          evidence: [`Health Score: ${channel.healthScore}`, `Last Activity: ${channel.lastActivity}`],
          suggestedActions: [`Delete channel #${channel.channelName}`],
          timeframe: 'Within 1 week',
          autoFlag: false
        });
      }
    });
    
    return issues;
  }

  private generateUserRecommendations(userProfiles: UserRiskProfile[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    const highRiskCount = userProfiles.filter(p => p.riskScore >= 60).length;
    if (highRiskCount > 0) {
      recommendations.push({
        id: 'enhance_moderation',
        category: 'moderation',
        priority: 'high',
        title: 'Enhance Moderation Protocols',
        description: `${highRiskCount} users require immediate attention`,
        expectedImpact: 'Improved community safety and reduced harassment',
        implementation: [
          'Review flagged users immediately',
          'Implement stricter chat monitoring',
          'Consider temporary mutes for repeat offenders'
        ],
        timeEstimate: '1-2 hours'
      });
    }
    
    return recommendations;
  }

  private generateChannelRecommendations(serverOptimization: ServerOptimization): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (serverOptimization.redundantChannels.length > 0) {
      recommendations.push({
        id: 'consolidate_channels',
        category: 'channel_management',
        priority: 'medium',
        title: 'Consolidate Redundant Channels',
        description: `${serverOptimization.redundantChannels.length} channels have overlapping purposes`,
        expectedImpact: 'Reduced confusion and increased activity in remaining channels',
        implementation: [
          'Identify channel pairs with similar content',
          'Announce consolidation plan to community',
          'Merge channels and archive old ones'
        ],
        timeEstimate: '2-3 hours'
      });
    }
    
    return recommendations;
  }

  private calculateUserHealthScore(userProfiles: UserRiskProfile[]): number {
    if (userProfiles.length === 0) return 100;
    
    const totalRisk = userProfiles.reduce((sum, p) => sum + p.riskScore, 0);
    const averageRisk = totalRisk / userProfiles.length;
    
    return Math.max(0, 100 - averageRisk);
  }

  private calculateChannelEngagementRate(channels: ChannelHealth[]): number {
    if (channels.length === 0) return 0;
    
    const totalEngagement = channels.reduce((sum, c) => sum + c.engagementRate, 0);
    return Math.round((totalEngagement / channels.length) * 100);
  }

  private calculateUserEngagementRate(userProfiles: UserRiskProfile[]): number {
    if (userProfiles.length === 0) return 0;
    
    const activeUsers = userProfiles.filter(p => p.messageCount > 0).length;
    return Math.round((activeUsers / userProfiles.length) * 100);
  }

  private analyzeCommunityTrend(userProfiles: UserRiskProfile[]): 'improving' | 'stable' | 'declining' {
    const highRiskRatio = userProfiles.filter(p => p.riskScore >= 60).length / userProfiles.length;
    
    if (highRiskRatio > 0.1) return 'declining';
    if (highRiskRatio < 0.05) return 'improving';
    return 'stable';
  }

  private getRiskDistribution(userProfiles: UserRiskProfile[]): Record<string, number> {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    
    userProfiles.forEach(p => {
      if (p.riskScore >= 80) distribution.critical++;
      else if (p.riskScore >= 60) distribution.high++;
      else if (p.riskScore >= 30) distribution.medium++;
      else distribution.low++;
    });
    
    return distribution;
  }

  private determineCombinedTrend(userMetrics: ReportMetrics, channelMetrics: ReportMetrics): 'improving' | 'stable' | 'declining' {
    const userTrend = userMetrics.communityTrend;
    const channelHealth = channelMetrics.serverHealthScore;
    
    if (userTrend === 'declining' || channelHealth < 60) return 'declining';
    if (userTrend === 'improving' && channelHealth > 80) return 'improving';
    return 'stable';
  }

  private generateUserSafetySummary(allProfiles: UserRiskProfile[], highRiskUsers: UserRiskProfile[]): string {
    if (highRiskUsers.length === 0) {
      return `Analyzed ${allProfiles.length} users - community shows healthy behavior patterns with no high-risk users detected.`;
    }
    
    return `Found ${highRiskUsers.length} users requiring immediate attention out of ${allProfiles.length} analyzed. ${highRiskUsers.filter(u => u.riskScore >= 80).length} users show critical risk levels.`;
  }

  private generateChannelOptimizationSummary(optimization: ServerOptimization): string {
    return `Server has ${optimization.activeChannels}/${optimization.totalChannels} active channels. Optimization score: ${optimization.optimizationScore}/100. ${optimization.recommendations.length} improvement opportunities identified.`;
  }

  private generateComprehensiveSummary(userReport: ModerationReport, channelReport: ModerationReport, metrics: ReportMetrics): string {
    return `Overall server health: ${metrics.serverHealthScore}/100. Community trend: ${metrics.communityTrend}. ${metrics.riskUsers} users need attention, ${metrics.activeChannels}/${metrics.totalChannels} channels active.`;
  }

  private getReportTitle(type: string): string {
    switch (type) {
      case 'user_safety': return 'User Safety Analysis';
      case 'channel_optimization': return 'Channel Optimization';
      case 'comprehensive': return 'Comprehensive Moderation';
      default: return 'Moderation Report';
    }
  }

  private getUrgencyIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      default: return '🔵';
    }
  }

  private formatUserSafetyDetails(report: ModerationReport): string {
    const data = report.data;
    let details = '';
    
    if (data.userProfiles && data.userProfiles.length > 0) {
      details += `\n👥 **High-Risk Users Detected:**\n`;
      data.userProfiles.slice(0, 3).forEach((profile: UserRiskProfile, index: number) => {
        details += `\n**${index + 1}. ${profile.username}** - Risk Score: ${profile.riskScore}/100\n`;
        details += `   • ${profile.violations.length} violations detected\n`;
        
        // Show rule violations with cross-references
        profile.violations.slice(0, 2).forEach((violation: Violation) => {
          const ruleRef = this.mapViolationToRule(violation.type);
          if (ruleRef) {
            details += `   • **Rule #${ruleRef.ruleNumber}** (${ruleRef.ruleName}): ${violation.description}\n`;
          } else {
            details += `   • ${violation.type}: ${violation.description}\n`;
          }
        });
        
        details += `   • Active in ${profile.channelsActive.length} channels\n`;
        details += `   • **Recommended Action:** ${profile.recommendedAction.action}\n`;
      });
    }
    
    return details;
  }

  private formatChannelOptimizationDetails(report: ModerationReport): string {
    const data = report.data;
    let details = '';
    
    if (data.deletionCandidates && data.deletionCandidates.length > 0) {
      details += `\n📊 **Channels Recommended for Review:**\n`;
      data.serverOptimization.recommendations.slice(0, 3).forEach((rec: any, index: number) => {
        details += `\n**${index + 1}. Action: ${rec.action}** (${rec.priority} priority)\n`;
        details += `   • Reason: ${rec.reason}\n`;
        details += `   • Expected Impact: ${rec.expectedImpact}\n`;
      });
    }
    
    return details;
  }

  // Map violation types to server rules for cross-referencing
  private mapViolationToRule(violationType: string): { ruleNumber: number; ruleName: string } | null {
    const matchingRule = cryptoCentralRules.find(rule => 
      rule.violationTypes.includes(violationType as any)
    );
    
    if (matchingRule) {
      return { ruleNumber: matchingRule.ruleNumber, ruleName: matchingRule.title };
    }
    return null;
  }

  // Get all applicable rules for a violation
  getApplicableRules(violation: Violation): ServerRule[] {
    return cryptoCentralRules.filter(rule => 
      rule.violationTypes.includes(violation.type)
    );
  }
}

export const moderationEngine = new ModerationEngine();