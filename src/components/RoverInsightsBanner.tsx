import { useState, useEffect } from 'react';
import { 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  AlertTriangle, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AdminModerationPanel from './AdminModerationPanel';
import RoverAvatar from './RoverAvatar';
import { Message } from '@/data/discordData';
import { useModerationAnalysis } from '@/hooks/useModerationAnalysis';

interface RoverInsightsBannerProps {
  serverName: string;
  serverId: number;
  messages: Message[];
}

const RoverInsightsBanner = ({ 
  serverName, 
  serverId, 
  messages,
}: RoverInsightsBannerProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Use the moderation analysis hook at the banner level
  const {
    analysis,
    isAnalyzing,
    error,
    analyzeServer,
    handleAction,
    refreshAnalysis,
  } = useModerationAnalysis(serverId);

  // Trigger analysis on mount
  useEffect(() => {
    analyzeServer();
  }, [analyzeServer]);

  // Get real values from analysis
  const healthScore = analysis?.healthScore ?? null;
  const flaggedCount = analysis?.flaggedUsers?.length ?? null;

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="w-full px-4 py-2 flex items-center justify-between transition-colors"
        style={{ 
          backgroundColor: 'hsl(var(--discord-bg-tertiary))',
          borderBottom: '1px solid hsl(var(--discord-bg-quaternary))'
        }}
      >
        <div className="flex items-center gap-2">
          <RoverAvatar size="sm" showVerified={false} orangeTint={true} />
          <span className="text-xs font-medium" style={{ color: 'hsl(var(--discord-text-muted))' }}>
            ROVER Insights (Admin)
          </span>
        </div>
        <ChevronDown className="w-4 h-4" style={{ color: 'hsl(var(--discord-text-muted))' }} />
      </button>
    );
  }

  return (
    <div 
      className="px-4 py-3"
      style={{ 
        background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
        borderBottom: '1px solid hsl(var(--discord-bg-quaternary))'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RoverAvatar size="sm" showVerified={true} orangeTint={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--discord-text-normal))' }}>
                ROVER Insights
              </span>
              <span 
                className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase"
                style={{ 
                  backgroundColor: 'rgba(88, 101, 242, 0.3)',
                  color: '#818cf8'
                }}
              >
                Admin
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded hover:bg-black/20 transition-colors"
        >
          <ChevronUp className="w-4 h-4" style={{ color: 'hsl(var(--discord-text-muted))' }} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Health Score */}
        <div className="flex items-center gap-2">
          {isAnalyzing && healthScore === null ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(var(--discord-text-muted))' }} />
          ) : (
            <Activity className="w-4 h-4" style={{ color: (healthScore ?? 0) > 70 ? '#22c55e' : (healthScore ?? 0) > 40 ? '#eab308' : '#ef4444' }} />
          )}
          <span className="text-sm" style={{ color: 'hsl(var(--discord-text-normal))' }}>
            Health: <strong>{healthScore !== null ? `${healthScore}/100` : isAnalyzing ? 'Analyzing...' : 'N/A'}</strong>
          </span>
        </div>

        <div className="h-4 w-px" style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }} />

        {/* Flagged Users */}
        <div className="flex items-center gap-2">
          {isAnalyzing && flaggedCount === null ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(var(--discord-text-muted))' }} />
          ) : (
            <AlertTriangle className="w-4 h-4" style={{ color: (flaggedCount ?? 0) > 0 ? '#f97316' : '#22c55e' }} />
          )}
          <span className="text-sm" style={{ color: 'hsl(var(--discord-text-normal))' }}>
            <strong>{flaggedCount !== null ? flaggedCount : isAnalyzing ? '...' : '0'}</strong> users flagged
          </span>
        </div>

        <div className="h-4 w-px" style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }} />

        {/* View Details - Opens Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <button 
              className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#818cf8' }}
            >
              <Shield className="w-4 h-4" />
              Open Moderation Dashboard
              <ExternalLink className="w-3 h-3" />
            </button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-full sm:w-[480px] p-0 border-l"
            style={{ 
              backgroundColor: 'hsl(var(--discord-bg-secondary))',
              borderColor: 'hsl(var(--discord-bg-quaternary))'
            }}
          >
            <AdminModerationPanel 
              serverName={serverName}
              serverId={serverId}
              messages={messages}
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              error={error}
              onRefresh={refreshAnalysis}
              onAction={handleAction}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default RoverInsightsBanner;
