import { Star, Users, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { Server, ServerDiscoveryMeta, DiscoveryServerMeta } from "@/data/discordData";

interface RoverRecommendationCardProps {
  server: Server | { id: number; name: string; icon: string; iconStyle?: any };
  discoveryMeta: ServerDiscoveryMeta;
  extendedMeta?: DiscoveryServerMeta;
  matchScore: number;
  matchReasons: string[];
  onExplore?: () => void;
}

const RoverRecommendationCard = ({
  server,
  discoveryMeta,
  extendedMeta,
  matchScore,
  matchReasons,
  onExplore
}: RoverRecommendationCardProps) => {
  const scorePercent = Math.round(matchScore * 100);
  
  const getMatchBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent match', color: 'from-green-400 to-emerald-500' };
    if (score >= 75) return { label: 'Great match', color: 'from-blue-400 to-indigo-500' };
    if (score >= 60) return { label: 'Good match', color: 'from-yellow-400 to-amber-500' };
    return { label: `${score}% match`, color: 'from-gray-400 to-gray-500' };
  };

  const matchBadge = getMatchBadge(scorePercent);

  const getActivityBadge = (level?: string) => {
    switch (level) {
      case 'very_high':
        return { label: '🔥 Very Active', color: 'bg-red-500/20 text-red-400' };
      case 'high':
        return { label: '⚡ Active', color: 'bg-orange-500/20 text-orange-400' };
      case 'medium':
        return { label: '💬 Moderate', color: 'bg-blue-500/20 text-blue-400' };
      default:
        return { label: '🌱 Growing', color: 'bg-green-500/20 text-green-400' };
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const activityBadge = getActivityBadge(extendedMeta?.activityLevel);
  const iconStyle = 'iconStyle' in server ? server.iconStyle : undefined;

  return (
    <div 
      className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer h-full flex flex-col"
      style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}
      onClick={onExplore}
    >
      {/* Banner */}
      <div className="relative h-24 overflow-hidden">
        <img 
          src={discoveryMeta.bannerImage} 
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            // Hide broken image and show gradient fallback
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Gradient fallback background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
          style={{ zIndex: -1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Match Score Badge */}
        <div 
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${matchBadge.color} shadow-lg whitespace-nowrap`}
        >
          {matchBadge.label}
        </div>

        {/* Verified Badge */}
        {discoveryMeta.isVerified && (
          <div className="absolute top-3 left-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Server Icon (overlapping banner) */}
      <div className="relative px-4 -mt-8">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border-4 shadow-lg"
          style={{ 
            background: iconStyle?.background || 'hsl(var(--discord-bg-tertiary))',
            borderColor: 'hsl(var(--discord-bg-secondary))'
          }}
        >
          {iconStyle?.text || server.name.charAt(0)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2 flex-1 flex flex-col">
        {/* Header - Fixed height for alignment */}
        <div className="mb-2">
          <h3 
            className="font-bold text-base leading-tight line-clamp-2 min-h-[2.5rem]"
            style={{ color: 'hsl(var(--discord-text-normal))' }}
          >
            {server.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 min-h-[1.5rem] flex-wrap">
            {extendedMeta?.category && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ 
                  backgroundColor: 'hsl(var(--discord-bg-tertiary))',
                  color: 'hsl(var(--discord-text-muted))'
                }}
              >
                {extendedMeta.category}
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${activityBadge.color}`}>
              {activityBadge.label}
            </span>
          </div>
        </div>

        {/* Member Stats */}
        <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: 'hsl(var(--discord-text-muted))' }}>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{formatNumber(discoveryMeta.onlineCount)} Online</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{formatNumber(discoveryMeta.memberCount)} Members</span>
          </div>
        </div>

        {/* Why You'll Love It - Fixed height for alignment */}
        <div className="mb-3 min-h-[5.5rem]">
          <p 
            className="text-xs font-semibold mb-2 flex items-center gap-1"
            style={{ color: '#a78bfa' }}
          >
            <Star className="w-3 h-3" />
            Why you'll love it
          </p>
          <ul className="space-y-1">
            {(extendedMeta?.whyJoin || matchReasons).slice(0, 3).map((reason, idx) => (
              <li 
                key={idx}
                className="text-xs flex items-start gap-2 line-clamp-2"
                style={{ color: 'hsl(var(--discord-text-muted))' }}
              >
                <Zap className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500" />
                <span className="line-clamp-2">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags - Fixed height for alignment */}
        <div className="flex flex-wrap gap-1 mb-3 min-h-[3rem] content-start">
          {extendedMeta?.tags?.slice(0, 5).map((tag, idx) => (
            <span 
              key={idx}
              className="text-xs px-2 py-0.5 rounded-full h-fit"
              style={{ 
                backgroundColor: 'rgba(88, 101, 242, 0.2)',
                color: '#8b9dff'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Explore Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExplore?.();
          }}
          className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 group-hover:gap-3 mt-auto flex-shrink-0"
          style={{ 
            backgroundColor: '#5865f2',
            color: 'white'
          }}
        >
          Explore Server
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default RoverRecommendationCard;
