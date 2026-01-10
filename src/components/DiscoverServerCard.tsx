import { CheckCircle2, Gamepad2, Music, Code, Sparkles, Dumbbell, Film } from "lucide-react";
import { Server, ServerDiscoveryMeta } from "@/data/discordData";
import React from "react";

interface DiscoverServerCardProps {
  server: Server;
  discoveryMeta: ServerDiscoveryMeta;
  onClick?: () => void;
}

const DiscoverServerCard = ({ server, discoveryMeta, onClick }: DiscoverServerCardProps) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    Gamepad2,
    Music,
    Code,
    Sparkles,
    Dumbbell,
    Film
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <div
      onClick={onClick}
      className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}
    >
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        <img 
          src={discoveryMeta.bannerImage} 
          alt={server.name}
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'linear-gradient(to top, hsl(var(--discord-bg-secondary)) 0%, transparent 60%)' 
          }} 
        />
        
        {/* Server Icon */}
        <div 
          className="absolute bottom-3 left-3 w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border-4"
          style={{ 
            background: server.iconStyle?.background || 'hsl(var(--discord-bg-tertiary))',
            borderColor: 'hsl(var(--discord-bg-secondary))'
          }}
        >
          {server.iconStyle ? (
            server.iconStyle.iconName && iconMap[server.iconStyle.iconName] ? (
              React.createElement(iconMap[server.iconStyle.iconName], {
                className: "w-6 h-6",
                style: { color: server.iconStyle.iconColor }
              })
            ) : (
              <span 
                className="font-bold" 
                style={{ 
                  color: server.iconStyle.iconColor,
                  fontSize: server.iconStyle.textSize || '1.25rem'
                }}
              >
                {server.iconStyle.text}
              </span>
            )
          ) : server.icon.startsWith("/") || server.icon.startsWith("http") ? (
            <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">{server.icon}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2">
        {/* Server Name with Verified Badge */}
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="font-bold text-base truncate" style={{ color: 'hsl(var(--discord-text-normal))' }}>
            {server.name}
          </h3>
          {discoveryMeta.isVerified && (
            <CheckCircle2 
              className="w-4 h-4 flex-shrink-0" 
              style={{ color: 'hsl(var(--discord-green))' }} 
            />
          )}
        </div>

        {/* Description */}
        <p 
          className="text-sm mb-3 line-clamp-2"
          style={{ color: 'hsl(var(--discord-text-muted))' }}
        >
          {discoveryMeta.description}
        </p>

        {/* Member Stats */}
        <div className="flex items-center gap-4 text-xs" style={{ color: 'hsl(var(--discord-text-muted))' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--discord-green))' }} />
            <span>{formatNumber(discoveryMeta.onlineCount)} Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--discord-text-muted))' }} />
            <span>{formatNumber(discoveryMeta.memberCount)} Members</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverServerCard;
