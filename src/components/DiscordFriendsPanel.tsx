import { useState } from "react";
import { Users, MessageCircle, MoreVertical, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

type FriendsFilter = 'online' | 'all' | 'pending' | 'blocked' | 'add';

const DiscordFriendsPanel = () => {
  const [friendsFilter, setFriendsFilter] = useState<FriendsFilter>('online');

  const friends = [
    { id: 1, name: 'drizzle', status: 'Idle', statusType: 'idle', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    { id: 2, name: 'Ebar 💖', status: '🐣 물좀마셔라', statusType: 'online', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
    { id: 3, name: 'Ren', status: 'Online', statusType: 'online', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b0433ccd?w=32&h=32&fit=crop&crop=face' },
    { id: 4, name: 'SexyBeast', status: '🔊 In voice • 🐸 my first status', statusType: 'online', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face' },
    { id: 5, name: 'GamerPro', status: 'Playing Valorant', statusType: 'online', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
    { id: 6, name: 'MusicLover', status: 'Listening to Spotify', statusType: 'online', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face' },
  ];

  const tabs: { key: FriendsFilter; label: string }[] = [
    { key: 'online', label: 'Online' },
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'blocked', label: 'Blocked' },
    { key: 'add', label: 'Add Friend' },
  ];

  const filteredFriends = friendsFilter === 'all' 
    ? friends 
    : friends.filter(f => f.statusType !== 'offline');

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'hsl(var(--discord-bg-primary))' }}>
      {/* Header with tabs */}
      <div 
        className="h-12 flex items-center px-4 gap-4 flex-shrink-0"
        style={{ borderBottom: '1px solid hsl(var(--discord-bg-quaternary))' }}
      >
        <Users className="w-5 h-5" style={{ color: 'hsl(var(--discord-text-muted))' }} />
        <span className="font-semibold" style={{ color: 'hsl(var(--discord-text-normal))' }}>Friends</span>
        
        <div 
          className="h-6 w-px mx-2" 
          style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }} 
        />
        
        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFriendsFilter(tab.key)}
              className={`px-2 py-1 rounded text-sm transition-colors ${
                tab.key === 'add' ? '' : ''
              }`}
              style={{
                backgroundColor: friendsFilter === tab.key 
                  ? 'hsl(var(--discord-bg-quaternary))' 
                  : tab.key === 'add' 
                    ? 'hsl(142.1 76.2% 36.3%)' 
                    : 'transparent',
                color: tab.key === 'add' 
                  ? 'white' 
                  : friendsFilter === tab.key 
                    ? 'hsl(var(--discord-text-normal))' 
                    : 'hsl(var(--discord-text-muted))',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div 
          className="flex items-center px-3 py-2 rounded"
          style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}
        >
          <input 
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'hsl(var(--discord-text-normal))' }}
          />
          <Search className="w-4 h-4" style={{ color: 'hsl(var(--discord-text-muted))' }} />
        </div>
      </div>

      {/* Online Count */}
      <div 
        className="px-6 py-2 text-xs font-semibold uppercase"
        style={{ color: 'hsl(var(--discord-text-muted))' }}
      >
        {friendsFilter === 'online' ? 'Online' : 'All Friends'} — {filteredFriends.length}
      </div>

      {/* Friends List */}
      <ScrollArea className="flex-1 px-2">
        {filteredFriends.map((friend) => (
          <div 
            key={friend.id} 
            className="flex items-center px-4 py-2 mx-2 rounded cursor-pointer group transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--discord-bg-quaternary))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="relative mr-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={friend.avatar} alt={friend.name} />
                <AvatarFallback 
                  className="text-sm font-medium"
                  style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}
                >
                  {friend.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div 
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${getStatusColor(friend.statusType)}`}
                style={{ borderColor: 'hsl(var(--discord-bg-primary))' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div 
                className="font-medium text-sm"
                style={{ color: 'hsl(var(--discord-text-normal))' }}
              >
                {friend.name}
              </div>
              <div 
                className="text-xs truncate"
                style={{ color: 'hsl(var(--discord-text-muted))' }}
              >
                {friend.status}
              </div>
            </div>
            
            {/* Action buttons - visible on hover */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className="p-2 rounded-full transition-colors"
                style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}
              >
                <MessageCircle 
                  className="w-5 h-5" 
                  style={{ color: 'hsl(var(--discord-text-muted))' }} 
                />
              </button>
              <button 
                className="p-2 rounded-full transition-colors"
                style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}
              >
                <MoreVertical 
                  className="w-5 h-5" 
                  style={{ color: 'hsl(var(--discord-text-muted))' }} 
                />
              </button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default DiscordFriendsPanel;
