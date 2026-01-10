import { useState } from 'react';
import { 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  AlertTriangle, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AdminModerationPanel from './AdminModerationPanel';
import { Message } from '@/data/discordData';

interface RoverInsightsBannerProps {
  serverName: string;
  serverId: number;
  messages: Message[];
  healthScore?: number;
  flaggedCount?: number;
}

const RoverInsightsBanner = ({ 
  serverName, 
  serverId, 
  messages,
  healthScore = 87,
  flaggedCount = 3
}: RoverInsightsBannerProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #5865f2 0%, #7c3aed 100%)' }}
          >
            <Sparkles className="w-3 h-3 text-white" />
          </div>
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
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #5865f2 0%, #7c3aed 100%)' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
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
          <Activity className="w-4 h-4" style={{ color: healthScore > 70 ? '#22c55e' : healthScore > 40 ? '#eab308' : '#ef4444' }} />
          <span className="text-sm" style={{ color: 'hsl(var(--discord-text-normal))' }}>
            Health: <strong>{healthScore}/100</strong>
          </span>
        </div>

        <div className="h-4 w-px" style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }} />

        {/* Flagged Users */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: flaggedCount > 0 ? '#f97316' : '#22c55e' }} />
          <span className="text-sm" style={{ color: 'hsl(var(--discord-text-normal))' }}>
            <strong>{flaggedCount}</strong> users flagged
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
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Quick tip */}
      <div 
        className="mt-3 text-xs flex items-center gap-1.5"
        style={{ color: 'hsl(var(--discord-text-muted))' }}
      >
        <span>💡</span>
        <span>Type <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }}>@rover moderation</code> for quick analysis</span>
      </div>
    </div>
  );
};

export default RoverInsightsBanner;
