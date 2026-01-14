import { useState } from 'react';
import { 
  AlertTriangle, 
  Ban, 
  Clock, 
  MessageSquare, 
  Activity,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Eye,
  X
} from 'lucide-react';
import { Message } from '@/data/discordData';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RuleViolation {
  ruleNumber: number;
  ruleName: string;
  evidence: string;
}

interface FlaggedUser {
  id: string;
  username: string;
  avatar: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  violations: RuleViolation[];
  lastActive: string;
  messageCount: number;
}

interface AdminModerationPanelProps {
  serverName: string;
  serverId: number;
  messages: Message[];
}

const mockFlaggedUsers: FlaggedUser[] = [
  {
    id: '1',
    username: 'SpamBot2024',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    riskLevel: 'critical',
    violations: [
      { ruleNumber: 2, ruleName: 'No Scam Promotion', evidence: 'Posted malicious link: bit.ly/malware-token' },
      { ruleNumber: 3, ruleName: 'No Pump & Dump', evidence: '"JOIN MY PUMP GROUP NOW!!!"' },
      { ruleNumber: 5, ruleName: 'No Spam or Self-Promotion', evidence: '5 messages in 5 minutes' },
      { ruleNumber: 7, ruleName: 'Security First', evidence: '"DM me your seed phrase for verification"' },
      { ruleNumber: 9, ruleName: 'No Begging or Solicitation', evidence: '"DM ME NOW!!!" - soliciting users' }
    ],
    lastActive: '2 min ago',
    messageCount: 47
  },
  {
    id: '2',
    username: 'CryptoScammer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    riskLevel: 'high',
    violations: [
      { ruleNumber: 5, ruleName: 'No Spam or Self-Promotion', evidence: 'Repeated promotional content about external service' },
      { ruleNumber: 9, ruleName: 'No Begging or Solicitation', evidence: '3 reports of unsolicited DM contact' }
    ],
    lastActive: '15 min ago',
    messageCount: 23
  },
  {
    id: '3',
    username: 'ToxicGamer99',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face',
    riskLevel: 'medium',
    violations: [
      { ruleNumber: 1, ruleName: 'Respect Everyone', evidence: 'Hostile language toward new members' },
      { ruleNumber: 4, ruleName: 'Quality Over Quantity', evidence: 'Excessive caps usage in messages' }
    ],
    lastActive: '1 hr ago',
    messageCount: 156
  }
];

type RiskFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

const AdminModerationPanel = ({ serverName, serverId, messages }: AdminModerationPanelProps) => {
  const [healthScore] = useState(87);
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>(mockFlaggedUsers);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [viewingContext, setViewingContext] = useState<string | null>(null);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return 'hsl(var(--discord-text-muted))';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle2 className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleUserAction = (userId: string, action: 'ban' | 'timeout' | 'warn') => {
    console.log(`Action ${action} on user ${userId}`);
    
    if (action === 'ban') {
      setFlaggedUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const getUserMessages = (username: string): Message[] => {
    return messages.filter(m => m.user === username).slice(-10);
  };

  // Filter and sort users by risk priority
  const filteredUsers = riskFilter === 'all' 
    ? flaggedUsers 
    : flaggedUsers.filter(u => u.riskLevel === riskFilter);

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const priority: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return priority[a.riskLevel] - priority[b.riskLevel];
  });

  // Count users by risk level
  const riskCounts = flaggedUsers.reduce((acc, user) => {
    acc[user.riskLevel] = (acc[user.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filterTabs: { key: RiskFilter; label: string }[] = [
    { key: 'all', label: `All (${flaggedUsers.length})` },
    { key: 'critical', label: `Critical (${riskCounts.critical || 0})` },
    { key: 'high', label: `High (${riskCounts.high || 0})` },
    { key: 'medium', label: `Medium (${riskCounts.medium || 0})` },
    { key: 'low', label: `Low (${riskCounts.low || 0})` },
  ];

  return (
    <div 
      className="h-full flex flex-col"
      style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid hsl(var(--discord-bg-quaternary))' }}
      >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#2b2d31' }}
        >
          <img 
            src="/lovable-uploads/discord-new-logo-2.webp" 
            alt="ROVER Moderation"
            className="w-8 h-8 object-contain"
            style={{ filter: 'sepia(1) saturate(5) hue-rotate(-5deg) brightness(0.95)' }}
          />
        </div>
        <div>
          <h2 className="font-bold text-sm" style={{ color: 'hsl(var(--discord-text-normal))' }}>
            ROVER Moderation
          </h2>
          <p className="text-xs" style={{ color: 'hsl(var(--discord-text-muted))' }}>
            {serverName} • Autonomous Review
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Server Health Score */}
          <div 
            className="p-4 rounded-xl"
            style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: 'hsl(var(--discord-green))' }} />
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--discord-text-normal))' }}>
                  Server Health Score
                </span>
              </div>
              <span className="text-2xl font-bold" style={{ color: 'hsl(var(--discord-green))' }}>
                {healthScore}/100
              </span>
            </div>
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }}
            >
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${healthScore}%`,
                  background: healthScore > 70 
                    ? 'linear-gradient(90deg, #22c55e 0%, #57f287 100%)'
                    : healthScore > 40 
                    ? 'linear-gradient(90deg, #eab308 0%, #facc15 100%)'
                    : 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)'
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs" style={{ color: 'hsl(var(--discord-text-muted))' }}>
              <span>Based on recent activity</span>
              <span>Updated 5m ago</span>
            </div>
          </div>

          {/* Flagged Users */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'hsl(var(--discord-text-normal))' }}>
                <AlertTriangle className="w-4 h-4" style={{ color: '#f97316' }} />
                Users Requiring Attention
              </h3>
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(249, 115, 22, 0.2)',
                  color: '#f97316'
                }}
              >
                {flaggedUsers.length}
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 mb-3">
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setRiskFilter(tab.key)}
                  className="px-2 py-1 rounded text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: riskFilter === tab.key 
                      ? 'hsl(var(--discord-brand))' 
                      : 'hsl(var(--discord-bg-tertiary))',
                    color: riskFilter === tab.key 
                      ? 'white' 
                      : 'hsl(var(--discord-text-muted))'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {sortedUsers.map(user => (
                <div 
                  key={user.id}
                  className="rounded-lg overflow-hidden"
                  style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}
                >
                  {/* User Header */}
                  <div 
                    className="p-3 cursor-pointer"
                    onClick={() => {
                      setExpandedUser(expandedUser === user.id ? null : user.id);
                      setViewingContext(null);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate" style={{ color: 'hsl(var(--discord-text-normal))' }}>
                            {user.username}
                          </span>
                          <span 
                            className="px-2 py-0.5 rounded text-xs font-medium uppercase flex items-center gap-1"
                            style={{ 
                              backgroundColor: `${getRiskColor(user.riskLevel)}20`,
                              color: getRiskColor(user.riskLevel)
                            }}
                          >
                            {getRiskIcon(user.riskLevel)}
                            {user.riskLevel}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: 'hsl(var(--discord-text-muted))' }}>
                          Rule {user.violations[0].ruleNumber}: {user.violations[0].ruleName}
                        </p>
                      </div>
                      {expandedUser === user.id ? (
                        <ChevronUp className="w-4 h-4" style={{ color: 'hsl(var(--discord-text-muted))' }} />
                      ) : (
                        <ChevronDown className="w-4 h-4" style={{ color: 'hsl(var(--discord-text-muted))' }} />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedUser === user.id && (
                    <div 
                      className="px-3 pb-3"
                      style={{ borderTop: '1px solid hsl(var(--discord-bg-quaternary))' }}
                    >
                      <div className="pt-3">
                        <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--discord-text-muted))' }}>
                          Violations:
                        </p>
                        <div className="space-y-2 mb-3">
                          {user.violations.map((v, i) => (
                            <div 
                              key={i}
                              className="p-2 rounded text-xs"
                              style={{ 
                                backgroundColor: 'hsl(var(--discord-bg-primary))',
                                borderLeft: `3px solid ${getRiskColor(user.riskLevel)}`
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-3 h-3" style={{ color: getRiskColor(user.riskLevel) }} />
                                <span className="font-medium" style={{ color: 'hsl(var(--discord-text-normal))' }}>
                                  Rule {v.ruleNumber}: {v.ruleName}
                                </span>
                              </div>
                              <p style={{ color: 'hsl(var(--discord-text-muted))' }}>
                                {v.evidence}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'hsl(var(--discord-text-muted))' }}>
                          <span>Last active: {user.lastActive}</span>
                          <span>•</span>
                          <span>{user.messageCount} messages</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button 
                            onClick={() => setViewingContext(viewingContext === user.id ? null : user.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            style={{ 
                              backgroundColor: viewingContext === user.id 
                                ? 'rgba(88, 101, 242, 0.3)' 
                                : 'rgba(88, 101, 242, 0.2)',
                              color: '#5865f2'
                            }}
                          >
                            <Eye className="w-3 h-3" />
                            View Messages
                          </button>
                          <button 
                            onClick={() => handleUserAction(user.id, 'ban')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            style={{ 
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              color: '#ef4444'
                            }}
                          >
                            <Ban className="w-3 h-3" />
                            Ban
                          </button>
                          <button 
                            onClick={() => handleUserAction(user.id, 'timeout')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            style={{ 
                              backgroundColor: 'rgba(234, 179, 8, 0.2)',
                              color: '#eab308'
                            }}
                          >
                            <Clock className="w-3 h-3" />
                            Timeout
                          </button>
                          <button 
                            onClick={() => handleUserAction(user.id, 'warn')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            style={{ 
                              backgroundColor: 'hsl(var(--discord-bg-quaternary))',
                              color: 'hsl(var(--discord-text-normal))'
                            }}
                          >
                            <MessageSquare className="w-3 h-3" />
                            Warn
                          </button>
                        </div>

                        {/* Message Context Viewer */}
                        {viewingContext === user.id && (
                          <div 
                            className="mt-3 rounded-lg p-3"
                            style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'hsl(var(--discord-text-muted))' }}>
                                <MessageSquare className="w-3 h-3" />
                                Message History (Last 10)
                              </span>
                              <button 
                                onClick={() => setViewingContext(null)}
                                className="p-1 rounded hover:bg-white/10 transition-colors"
                              >
                                <X className="w-3 h-3" style={{ color: 'hsl(var(--discord-text-muted))' }} />
                              </button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {getUserMessages(user.username).length > 0 ? (
                                getUserMessages(user.username).map((msg, idx) => (
                                  <div 
                                    key={idx}
                                    className="text-xs p-2 rounded"
                                    style={{ 
                                      backgroundColor: 'hsl(var(--discord-bg-tertiary))',
                                      borderLeft: msg.content.includes('http') || 
                                                  msg.content.includes('DM') || 
                                                  msg.content === msg.content.toUpperCase() && msg.content.length > 10
                                        ? '2px solid #ef4444' 
                                        : '2px solid transparent'
                                    }}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span style={{ color: 'hsl(var(--discord-text-muted))' }}>{msg.time}</span>
                                      {(msg.content.includes('http') || msg.content.includes('DM') || msg.content.includes('seed phrase')) && (
                                        <span 
                                          className="px-1 py-0.5 rounded text-[10px] font-medium"
                                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                        >
                                          ⚠️ SUSPICIOUS
                                        </span>
                                      )}
                                    </div>
                                    <p style={{ color: 'hsl(var(--discord-text-normal))' }}>
                                      {msg.content.length > 150 ? msg.content.slice(0, 150) + '...' : msg.content}
                                    </p>
                                    {msg.hasReactions && msg.reactions && (
                                      <div className="flex gap-1 mt-1">
                                        {msg.reactions.map((r, ri) => (
                                          <span 
                                            key={ri}
                                            className="px-1 py-0.5 rounded text-[10px]"
                                            style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }}
                                          >
                                            {r.emoji} {r.count}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-center py-4" style={{ color: 'hsl(var(--discord-text-muted))' }}>
                                  No messages found in current channel
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {sortedUsers.length === 0 && (
                <div 
                  className="text-center py-6 rounded-lg"
                  style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}
                >
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--discord-green))' }} />
                  <p className="text-sm" style={{ color: 'hsl(var(--discord-text-normal))' }}>
                    {riskFilter === 'all' 
                      ? 'All clear! No users need attention.'
                      : `No ${riskFilter} risk users found.`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminModerationPanel;
