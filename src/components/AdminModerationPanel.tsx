import { useState, useEffect } from 'react';
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
  X,
  RefreshCw,
  Loader2,
  XCircle
} from 'lucide-react';
import { Message } from '@/data/discordData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModerationAnalysis, FlaggedUser, Violation } from '@/hooks/useModerationAnalysis';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminModerationPanelProps {
  serverName: string;
  serverId: number;
  messages: Message[];
  analysis: ModerationAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  onAction: (username: string, severity: string, action: 'ban' | 'timeout' | 'warn' | 'dismiss') => Promise<any>;
}

type RiskFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

interface ActionConfirmation {
  username: string;
  severity: string;
  action: 'ban' | 'timeout' | 'warn' | 'dismiss';
}

const AdminModerationPanel = ({ 
  serverName, 
  serverId, 
  messages,
  analysis,
  isAnalyzing,
  error,
  onRefresh,
  onAction
}: AdminModerationPanelProps) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [viewingContext, setViewingContext] = useState<string | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [animatingScore, setAnimatingScore] = useState(false);
  const [actionConfirmation, setActionConfirmation] = useState<ActionConfirmation | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  // Animate score changes
  useEffect(() => {
    if (analysis && previousScore !== null && previousScore !== analysis.healthScore) {
      setAnimatingScore(true);
      const diff = analysis.healthScore - previousScore;
      const direction = diff > 0 ? '+' : '';
      
      toast({
        title: "Health Score Updated",
        description: `${previousScore} → ${analysis.healthScore} (${direction}${diff.toFixed(1)})`,
      });
      
      setTimeout(() => setAnimatingScore(false), 1000);
    }
    if (analysis) {
      setPreviousScore(analysis.healthScore);
    }
  }, [analysis?.healthScore, previousScore]);

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

  const confirmAction = (username: string, severity: string, action: 'ban' | 'timeout' | 'warn' | 'dismiss') => {
    setActionConfirmation({ username, severity, action });
  };

  const executeAction = async () => {
    if (!actionConfirmation) return;
    
    setProcessingAction(true);
    const { username, severity, action } = actionConfirmation;
    
    try {
      const result = await onAction(username, severity, action);
      
      if (result.success) {
        toast({
          title: `${action.charAt(0).toUpperCase() + action.slice(1)} Action Applied`,
          description: result.message,
        });
      }
    } catch (e) {
      toast({
        title: "Action Failed",
        description: "Could not process the moderation action",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
      setActionConfirmation(null);
    }
  };

  const getUserMessages = (username: string): Message[] => {
    return messages.filter(m => m.user === username).slice(-10);
  };

  const getActionDescription = (action: string, username: string) => {
    switch (action) {
      case 'ban': return `This will permanently remove ${username} from the server.`;
      case 'timeout': return `This will temporarily restrict ${username}'s ability to send messages.`;
      case 'warn': return `This will send an official warning to ${username}.`;
      case 'dismiss': return `This will mark ${username} as not a threat. Note: This will decrease the health score.`;
      default: return '';
    }
  };

  const getScoreChange = (action: string, severity: string) => {
    const changes: Record<string, Record<string, number>> = {
      ban: { critical: 5, high: 3, medium: 1, low: 1 },
      timeout: { critical: 2, high: 1, medium: 0.5, low: 0.5 },
      warn: { critical: 1, high: 1, medium: 1, low: 1 },
      dismiss: { critical: -3, high: -2, medium: -1, low: -1 },
    };
    return changes[action]?.[severity] ?? 0;
  };

  // Get flagged users from analysis or empty array
  const flaggedUsers = analysis?.flaggedUsers ?? [];
  const healthScore = analysis?.healthScore ?? 0;

  // Filter and sort users by risk priority
  const filteredUsers = riskFilter === 'all' 
    ? flaggedUsers 
    : flaggedUsers.filter(u => u.severity === riskFilter);

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const priority: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return priority[a.severity] - priority[b.severity];
  });

  // Count users by risk level
  const riskCounts = flaggedUsers.reduce((acc, user) => {
    acc[user.severity] = (acc[user.severity] || 0) + 1;
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
        <div className="flex-1">
          <h2 className="font-bold text-sm" style={{ color: 'hsl(var(--discord-text-normal))' }}>
            ROVER Moderation
          </h2>
          <p className="text-xs" style={{ color: 'hsl(var(--discord-text-muted))' }}>
            {serverName} • AI-Powered Analysis
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
          title="Refresh Analysis"
        >
          <RefreshCw 
            className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} 
            style={{ color: 'hsl(var(--discord-text-muted))' }} 
          />
        </button>
      </div>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin" style={{ color: 'hsl(var(--discord-brand))' }} />
            <p className="text-sm font-medium" style={{ color: 'hsl(var(--discord-text-normal))' }}>
              ROVER is analyzing server activity...
            </p>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--discord-text-muted))' }}>
              This may take a few seconds
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isAnalyzing && (
        <div className="p-4">
          <div 
            className="p-4 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#ef4444' }}>Analysis Error</p>
              <p className="text-xs" style={{ color: 'hsl(var(--discord-text-muted))' }}>{error}</p>
            </div>
            <button
              onClick={onRefresh}
              className="px-3 py-1 rounded text-xs font-medium transition-colors"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

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
              <span 
                className={`text-2xl font-bold transition-all duration-500 ${animatingScore ? 'scale-125' : ''}`}
                style={{ 
                  color: healthScore > 70 
                    ? 'hsl(var(--discord-green))' 
                    : healthScore > 40 
                    ? '#eab308' 
                    : '#ef4444' 
                }}
              >
                {healthScore.toFixed(0)}/100
              </span>
            </div>
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-500"
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
              <span>{analysis ? `${analysis.messageCount} messages analyzed` : 'Loading...'}</span>
              <span>{analysis ? `Analyzed ${new Date(analysis.analyzedAt).toLocaleTimeString()}` : ''}</span>
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
                  key={user.username}
                  className="rounded-lg overflow-hidden"
                  style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}
                >
                  {/* User Header */}
                  <div 
                    className="p-3 cursor-pointer"
                    onClick={() => {
                      setExpandedUser(expandedUser === user.username ? null : user.username);
                      setViewingContext(null);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getRiskColor(user.severity) + '30' }}
                      >
                        <span className="text-sm font-bold" style={{ color: getRiskColor(user.severity) }}>
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate" style={{ color: 'hsl(var(--discord-text-normal))' }}>
                            {user.username}
                          </span>
                          <span 
                            className="px-2 py-0.5 rounded text-xs font-medium uppercase flex items-center gap-1"
                            style={{ 
                              backgroundColor: `${getRiskColor(user.severity)}20`,
                              color: getRiskColor(user.severity)
                            }}
                          >
                            {getRiskIcon(user.severity)}
                            {user.severity}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: 'hsl(var(--discord-text-muted))' }}>
                          {user.violations.length} violation{user.violations.length !== 1 ? 's' : ''} • {user.totalMessages} messages
                        </p>
                      </div>
                      {expandedUser === user.username ? (
                        <ChevronUp className="w-4 h-4" style={{ color: 'hsl(var(--discord-text-muted))' }} />
                      ) : (
                        <ChevronDown className="w-4 h-4" style={{ color: 'hsl(var(--discord-text-muted))' }} />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedUser === user.username && (
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
                                borderLeft: `3px solid ${getRiskColor(user.severity)}`
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-3 h-3" style={{ color: getRiskColor(user.severity) }} />
                                <span className="font-medium" style={{ color: 'hsl(var(--discord-text-normal))' }}>
                                  Rule {v.ruleNumber}: {v.ruleName}
                                </span>
                              </div>
                              <p style={{ color: 'hsl(var(--discord-text-muted))' }}>
                                {v.evidence}
                              </p>
                              {v.messageExcerpt && (
                                <p 
                                  className="mt-1 italic truncate"
                                  style={{ color: 'hsl(var(--discord-text-muted))', opacity: 0.8 }}
                                >
                                  "{v.messageExcerpt.length > 80 ? v.messageExcerpt.slice(0, 80) + '...' : v.messageExcerpt}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'hsl(var(--discord-text-muted))' }}>
                          <span>Last active: {user.lastActive}</span>
                          <span>•</span>
                          <span>{user.totalMessages} messages</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button 
                            onClick={() => setViewingContext(viewingContext === user.username ? null : user.username)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            style={{ 
                              backgroundColor: viewingContext === user.username 
                                ? 'rgba(88, 101, 242, 0.3)' 
                                : 'rgba(88, 101, 242, 0.2)',
                              color: '#5865f2'
                            }}
                          >
                            <Eye className="w-3 h-3" />
                            View Messages
                          </button>
                          <button 
                            onClick={() => confirmAction(user.username, user.severity, 'ban')}
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
                            onClick={() => confirmAction(user.username, user.severity, 'timeout')}
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
                            onClick={() => confirmAction(user.username, user.severity, 'warn')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            style={{ 
                              backgroundColor: 'hsl(var(--discord-bg-quaternary))',
                              color: 'hsl(var(--discord-text-normal))'
                            }}
                          >
                            <MessageSquare className="w-3 h-3" />
                            Warn
                          </button>
                          <button 
                            onClick={() => confirmAction(user.username, user.severity, 'dismiss')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            style={{ 
                              backgroundColor: 'rgba(156, 163, 175, 0.2)',
                              color: '#9ca3af'
                            }}
                          >
                            <XCircle className="w-3 h-3" />
                            Dismiss
                          </button>
                        </div>

                        {/* Message Context Viewer */}
                        {viewingContext === user.username && (
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

              {sortedUsers.length === 0 && !isAnalyzing && (
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

      {/* Confirmation Dialog */}
      <AlertDialog open={!!actionConfirmation} onOpenChange={() => setActionConfirmation(null)}>
        <AlertDialogContent style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))', border: '1px solid hsl(var(--discord-bg-quaternary))' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'hsl(var(--discord-text-normal))' }}>
              Confirm {actionConfirmation?.action?.charAt(0).toUpperCase()}{actionConfirmation?.action?.slice(1)} Action
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'hsl(var(--discord-text-muted))' }}>
              {actionConfirmation && getActionDescription(actionConfirmation.action, actionConfirmation.username)}
              <div className="mt-3 p-2 rounded" style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}>
                <p className="text-xs">
                  Health score change: <span style={{ color: getScoreChange(actionConfirmation?.action || '', actionConfirmation?.severity || '') >= 0 ? '#22c55e' : '#ef4444' }}>
                    {getScoreChange(actionConfirmation?.action || '', actionConfirmation?.severity || '') >= 0 ? '+' : ''}
                    {getScoreChange(actionConfirmation?.action || '', actionConfirmation?.severity || '')}
                  </span>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))', color: 'hsl(var(--discord-text-normal))', border: 'none' }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              disabled={processingAction}
              style={{ 
                backgroundColor: actionConfirmation?.action === 'ban' ? '#ef4444' 
                  : actionConfirmation?.action === 'timeout' ? '#eab308'
                  : actionConfirmation?.action === 'dismiss' ? '#9ca3af'
                  : 'hsl(var(--discord-brand))',
                color: 'white'
              }}
            >
              {processingAction ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminModerationPanel;
