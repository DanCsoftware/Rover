import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, MoreHorizontal } from "lucide-react";

const ActiveNowPanel = () => {
  const groupActivities = [
    {
      id: 1,
      users: ['User1', 'User2'],
      othersCount: 2,
      activity: 'Playing VALORANT',
      timeAgo: '3m',
      avatars: [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      ]
    }
  ];

  const activitySuggestions = [
    {
      id: 1,
      title: "Let's Play!",
      subtitle: 'All Together',
      participants: [
        'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=32&h=32&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      ],
      moreCount: 2
    }
  ];

  const promotedQuest = {
    title: 'Alpha vs Omega Quest',
    availableUntil: '1/20/26',
    description: 'Play VALORANT for 15 minutes with your Discord client open to unlock a special Avatar Decoration.',
    icon: '🎮'
  };

  return (
    <div 
      className="w-60 p-4 flex-shrink-0 hidden lg:block overflow-y-auto"
      style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}
    >
      <h3 
        className="font-bold text-lg mb-4"
        style={{ color: 'hsl(var(--discord-text-normal))' }}
      >
        Active Now
      </h3>
      
      {/* Group Activities */}
      <div className="space-y-3 mb-4">
        {groupActivities.map((group) => (
          <div 
            key={group.id}
            className="p-3 rounded-lg cursor-pointer"
            style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}
          >
            <div className="flex items-center justify-between mb-2">
              {/* Stacked avatars */}
              <div className="flex -space-x-2">
                {group.avatars.slice(0, 4).map((avatar, idx) => (
                  <Avatar key={idx} className="w-8 h-8 border-2" style={{ borderColor: 'hsl(var(--discord-bg-tertiary))' }}>
                    <AvatarImage src={avatar} alt={`User ${idx + 1}`} />
                    <AvatarFallback style={{ backgroundColor: 'hsl(var(--discord-bg-primary))' }}>
                      U{idx + 1}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <ChevronDown 
                className="w-4 h-4" 
                style={{ color: 'hsl(var(--discord-text-muted))' }}
              />
            </div>
            <div 
              className="font-medium text-sm"
              style={{ color: 'hsl(var(--discord-text-normal))' }}
            >
              {group.users[0]}, {group.users[1]}, and {group.othersCount} others
            </div>
            <div 
              className="text-xs mt-1"
              style={{ color: 'hsl(var(--discord-green))' }}
            >
              {group.activity} - {group.timeAgo}
            </div>
          </div>
        ))}
      </div>

      {/* Let's Play Activity Cards */}
      <div className="space-y-2 mb-4">
        {activitySuggestions.map((suggestion) => (
          <div 
            key={suggestion.id}
            className="flex items-center gap-3 p-2 rounded cursor-pointer transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--discord-bg-tertiary))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ 
                backgroundColor: 'hsl(var(--discord-blurple))',
                color: 'white'
              }}
            >
              LP!
            </div>
            <div className="flex-1 min-w-0">
              <div 
                className="font-medium text-sm"
                style={{ color: 'hsl(var(--discord-text-normal))' }}
              >
                {suggestion.title}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'hsl(var(--discord-text-muted))' }}
              >
                {suggestion.subtitle}
              </div>
            </div>
            {/* Participant avatars */}
            <div className="flex items-center -space-x-1">
              {suggestion.participants.map((avatar, idx) => (
                <Avatar key={idx} className="w-6 h-6 border" style={{ borderColor: 'hsl(var(--discord-bg-secondary))' }}>
                  <AvatarImage src={avatar} alt={`Participant ${idx + 1}`} />
                  <AvatarFallback style={{ backgroundColor: 'hsl(var(--discord-bg-primary))', fontSize: '10px' }}>
                    U
                  </AvatarFallback>
                </Avatar>
              ))}
              {suggestion.moreCount > 0 && (
                <span 
                  className="text-xs ml-1"
                  style={{ color: 'hsl(var(--discord-text-muted))' }}
                >
                  +{suggestion.moreCount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PROMOTED Quest Card */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span 
            className="text-xs uppercase font-semibold"
            style={{ color: 'hsl(var(--discord-text-muted))' }}
          >
            PROMOTED
          </span>
          <MoreHorizontal 
            className="w-4 h-4 cursor-pointer" 
            style={{ color: 'hsl(var(--discord-text-muted))' }}
          />
        </div>
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">{promotedQuest.icon}</span>
            <div className="flex-1 min-w-0">
              <div 
                className="font-medium text-sm"
                style={{ color: 'hsl(var(--discord-text-normal))' }}
              >
                {promotedQuest.title}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'hsl(var(--discord-text-muted))' }}
              >
                Available until {promotedQuest.availableUntil}
              </div>
            </div>
          </div>
          <p 
            className="text-xs mb-3 leading-relaxed"
            style={{ color: 'hsl(var(--discord-text-muted))' }}
          >
            {promotedQuest.description}
          </p>
          <div className="flex gap-2">
            <button 
              className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{ 
                backgroundColor: 'hsl(var(--discord-bg-primary))',
                color: 'hsl(var(--discord-text-normal))'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'hsl(var(--discord-bg-quaternary))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'hsl(var(--discord-bg-primary))';
              }}
            >
              Learn More
            </button>
            <button 
              className="flex-1 px-3 py-1.5 rounded text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: 'hsl(var(--discord-blurple))' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'hsl(var(--discord-blurple-hover))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'hsl(var(--discord-blurple))';
              }}
            >
              Accept Quest
            </button>
          </div>
        </div>
      </div>

      {/* Empty state fallback */}
      {groupActivities.length === 0 && activitySuggestions.length === 0 && (
        <div 
          className="text-center py-8"
          style={{ color: 'hsl(var(--discord-text-muted))' }}
        >
          <p className="text-sm">It's quiet for now...</p>
          <p className="text-xs mt-1">When a friend starts an activity, we'll show it here!</p>
        </div>
      )}
    </div>
  );
};

export default ActiveNowPanel;
