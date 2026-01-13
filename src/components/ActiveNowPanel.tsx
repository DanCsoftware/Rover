import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ActiveNowPanel = () => {
  const activeUsers = [
    { 
      id: 1, 
      name: 'SexyBeast', 
      activity: 'In a Voice Channel', 
      activityType: 'voice',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face',
      channelName: 'General'
    },
    { 
      id: 2, 
      name: 'GamerPro', 
      activity: 'Playing Valorant', 
      activityType: 'game',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
    },
    { 
      id: 3, 
      name: 'MusicLover', 
      activity: 'Listening to Spotify', 
      activityType: 'spotify',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
      songName: 'Blinding Lights'
    },
  ];

  return (
    <div 
      className="w-60 p-4 flex-shrink-0 hidden lg:block"
      style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}
    >
      <h3 
        className="font-bold text-lg mb-4"
        style={{ color: 'hsl(var(--discord-text-normal))' }}
      >
        Active Now
      </h3>
      
      <div className="space-y-4">
        {activeUsers.map((user) => (
          <div 
            key={user.id} 
            className="flex items-start gap-3 p-2 rounded cursor-pointer transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--discord-bg-tertiary))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback 
                  style={{ backgroundColor: 'hsl(var(--discord-bg-primary))' }}
                >
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div 
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2"
                style={{ borderColor: 'hsl(var(--discord-bg-secondary))' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div 
                className="font-medium text-sm"
                style={{ color: 'hsl(var(--discord-text-normal))' }}
              >
                {user.name}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'hsl(var(--discord-green))' }}
              >
                {user.activity}
              </div>
              {user.channelName && (
                <div 
                  className="text-xs mt-0.5"
                  style={{ color: 'hsl(var(--discord-text-muted))' }}
                >
                  🔊 {user.channelName}
                </div>
              )}
              {user.songName && (
                <div 
                  className="text-xs mt-0.5"
                  style={{ color: 'hsl(var(--discord-text-muted))' }}
                >
                  🎵 {user.songName}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeUsers.length === 0 && (
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
