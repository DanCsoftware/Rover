import { Bot, Hash, Volume2, Settings, Headphones, Mic, ChevronDown, ChevronRight, Gamepad2, Music, Code, Sparkles, Dumbbell, Film, Compass } from "lucide-react";
import { useState } from "react";
import { servers, ServerIconStyle } from "@/data/discordData";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DiscordSidebarProps {
  onChannelClick: (channelId: string) => void;
  onDMClick: (userId: string) => void;
  onDMViewClick: () => void;
  onServerClick: (serverId: number) => void;
  onDiscoverClick: () => void;
  activeChannel: string;
  activeChannelType: 'text' | 'dm';
  isDMView: boolean;
  isDiscoverView: boolean;
  activeServer: number;
}

const DiscordSidebar = ({ 
  onChannelClick, 
  onDMClick, 
  onDMViewClick, 
  onServerClick,
  onDiscoverClick,
  activeChannel, 
  activeChannelType, 
  isDMView,
  isDiscoverView,
  activeServer 
}: DiscordSidebarProps) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["text", "voice"]);
  
  const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    Gamepad2,
    Music,
    Code,
    Sparkles,
    Dumbbell,
    Film
  };
  
  const dmChannels = [
    { id: "search", name: "Find or start a conve...", type: "dm" },
    { id: "user1", name: "User1 🔴MSU", type: "dm", status: "online", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
    { id: "tickets", name: "Tickets", type: "dm" },
    { id: "user2", name: "User2...", type: "dm", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" },
    { id: "group1", name: "User3, User4, G...", type: "dm", members: "4 Members" },
    { id: "user5", name: "User5", type: "dm", avatar: "https://images.unsplash.com/photo-1494790108755-2616b0433ccd?w=32&h=32&fit=crop&crop=face" },
    { id: "user6", name: "User6...", type: "dm", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face" },
    { id: "midjourney-bot", name: "Midjourney Bot", type: "dm" },
  ];

  const getUserAvatars = () => {
    const avatars = [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b0433ccd?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face"
    ];
    return avatars;
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const isChannelActive = (channelId: string, channelType: 'text' | 'dm') => {
    return activeChannel === channelId && activeChannelType === channelType;
  };

  const isServerActive = (serverId: number) => {
    return activeServer === serverId && !isDMView;
  };

  const getCurrentServer = () => {
    return servers.find(s => s.id === activeServer);
  };

  const getCurrentServerName = () => {
    const server = getCurrentServer();
    return server ? server.name : "Unknown Server";
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}>
      {/* Server List */}
      <div className="w-16 flex flex-col items-center py-3 space-y-2 flex-shrink-0" style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}>
        {/* Discord Icon for Direct Messages */}
        <div
          onClick={onDMViewClick}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
            isDMView ? "rounded-2xl" : "hover:rounded-2xl"
          }`}
          style={{ 
            backgroundColor: isDMView ? 'hsl(var(--discord-brand))' : 'hsl(var(--discord-bg-primary))',
            color: 'white'
          }}
        >
          <svg 
            viewBox="0 -28.5 256 256" 
            className="w-8 h-8" 
            xmlns="http://www.w3.org/2000/svg" 
            preserveAspectRatio="xMidYMid"
          >
            <path 
              d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" 
              fill="#5865F2" 
              fillRule="nonzero"
            />
          </svg>
        </div>
        
        <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }}></div>
        
        {servers.map((server) => (
          <div
            key={server.id}
            onClick={() => onServerClick(server.id)}
            className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden ${
              isServerActive(server.id) ? "rounded-2xl" : "hover:rounded-2xl"
            }`}
            style={{ 
              background: server.iconStyle?.background || (isServerActive(server.id) ? 'hsl(var(--discord-brand))' : 'hsl(var(--discord-bg-primary))'),
              color: 'white'
            }}
            title={server.name}
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
                    fontSize: server.iconStyle.textSize || '1.25rem',
                    fontWeight: server.iconStyle.fontWeight || '700'
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
        ))}
        <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }}></div>
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:rounded-2xl transition-all duration-200"
          style={{ backgroundColor: 'hsl(var(--discord-bg-primary))', color: 'hsl(var(--discord-green))' }}
          title="Add a Server"
        >
          <span className="text-2xl">+</span>
        </div>
        <div 
          onClick={onDiscoverClick}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
            isDiscoverView ? "rounded-2xl" : "hover:rounded-2xl"
          }`}
          style={{ 
            backgroundColor: isDiscoverView ? 'hsl(var(--discord-green))' : 'hsl(var(--discord-bg-primary))',
            color: isDiscoverView ? 'white' : 'hsl(var(--discord-green))'
          }}
          title="Explore Discoverable Servers"
        >
          <Compass className="w-6 h-6" />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}>
        <div className="h-12 flex items-center px-4 flex-shrink-0 shadow-sm" style={{ borderBottom: '1px solid hsl(var(--discord-bg-quaternary))' }}>
          <span className="font-semibold truncate" style={{ color: 'hsl(var(--discord-text-normal))' }}>
            {isDMView ? "Direct Messages" : getCurrentServerName()}
          </span>
        </div>
        
        <ScrollArea className="flex-1">
          {isDMView ? (
            /* Direct Messages View */
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1 text-xs uppercase font-semibold" style={{ color: 'hsl(var(--discord-text-muted))' }}>
                <span className="truncate">Direct Messages</span>
                <span className="text-lg cursor-pointer flex-shrink-0 hover:text-white transition-colors">+</span>
              </div>
              
              {dmChannels.map((channel) => (
                  <div
                  key={channel.id}
                  className={`flex items-center px-2 py-1.5 mx-2 rounded cursor-pointer transition-colors ${
                    isChannelActive(channel.id, 'dm') ? "" : ""
                  }`}
                  style={{ 
                    backgroundColor: isChannelActive(channel.id, 'dm') ? 'hsl(var(--discord-bg-quaternary))' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isChannelActive(channel.id, 'dm')) {
                      e.currentTarget.style.backgroundColor = 'hsl(var(--discord-bg-tertiary))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isChannelActive(channel.id, 'dm')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => channel.id !== "search" && channel.id !== "tickets" && channel.id !== "group1" && onDMClick(channel.id)}
                >
                  <div className="w-8 h-8 mr-3 flex-shrink-0">
                    {channel.name === "Midjourney Bot" ? (
                      <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Midjourney" className="w-8 h-8 rounded-full" />
                    ) : channel.avatar ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={channel.avatar} alt={channel.name} />
                        <AvatarFallback className="bg-gray-600 text-gray-300 text-sm">
                          {channel.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: 'hsl(var(--discord-text-normal))' }}>{channel.name}</div>
                    {channel.members && (
                      <div className="text-gray-500 text-xs truncate">{channel.members}</div>
                    )}
                  </div>
                  {channel.status === "online" && (
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Server Channels View */
            <>
              {/* Text Channels */}
              <div className="p-2">
                <div 
                  className="flex items-center px-2 py-1 text-gray-400 text-xs uppercase font-semibold cursor-pointer hover:text-gray-300"
                  onClick={() => toggleGroup("text")}
                >
                  {expandedGroups.includes("text") ? (
                    <ChevronDown className="w-3 h-3 mr-1 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 mr-1 flex-shrink-0" />
                  )}
                  <span className="truncate">Text Channels</span>
                </div>
                
                {expandedGroups.includes("text") && (
                  <div className="ml-2">
                    {getCurrentServer()?.textChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className={`flex items-center px-2 py-1.5 rounded cursor-pointer transition-colors ${
                          isChannelActive(channel.id, 'text') ? 'bg-gray-700' : 'hover:bg-gray-700'
                        }`}
                        onClick={() => onChannelClick(channel.id)}
                      >
                        <Hash className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-300 text-sm truncate">{channel.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice Channels */}
              <div className="p-2">
                <div 
                  className="flex items-center px-2 py-1 text-gray-400 text-xs uppercase font-semibold cursor-pointer hover:text-gray-300"
                  onClick={() => toggleGroup("voice")}
                >
                  {expandedGroups.includes("voice") ? (
                    <ChevronDown className="w-3 h-3 mr-1 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 mr-1 flex-shrink-0" />
                  )}
                  <span className="truncate">Voice Channels</span>
                </div>
                
                {expandedGroups.includes("voice") && (
                  <div className="ml-2">
                    {getCurrentServer()?.voiceChannels.map((channel, index) => {
                      const avatars = getUserAvatars();
                      return (
                        <div key={index} className="mb-1">
                          <div className="flex items-center px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700">
                            <Volume2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-300 text-sm flex-1 truncate">{channel.name}</span>
                            {channel.users > 0 && (
                              <span className="text-gray-500 text-xs flex-shrink-0">{channel.users}</span>
                            )}
                          </div>
                          
                          {/* Show users in voice channel */}
                          {channel.userList && channel.userList.length > 0 && (
                            <div className="ml-6 space-y-1">
                              {channel.userList.map((user, userIndex) => (
                                <div key={userIndex} className="flex items-center px-2 py-1 text-gray-400 text-xs">
                                  <Avatar className="w-4 h-4 mr-2 flex-shrink-0">
                                    <AvatarImage src={avatars[userIndex % avatars.length]} alt={user} />
                                    <AvatarFallback className="bg-gray-600 text-white text-xs font-bold">
                                      {user.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">{user}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </ScrollArea>

        {/* User Panel */}
        <div className="h-14 flex items-center px-2 flex-shrink-0" style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}>
          <Avatar className="w-8 h-8 mr-2 flex-shrink-0">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="User" />
            <AvatarFallback className="bg-indigo-600 text-white text-sm font-bold">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'hsl(var(--discord-text-normal))' }}>User</div>
            <div className="text-xs truncate" style={{ color: 'hsl(var(--discord-text-muted))' }}>#1234</div>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            <button className="p-1 rounded hover:bg-black/20 transition-colors">
              <Mic className="w-4 h-4" style={{ color: 'hsl(var(--discord-interactive-normal))' }} />
            </button>
            <button className="p-1 rounded hover:bg-black/20 transition-colors">
              <Headphones className="w-4 h-4" style={{ color: 'hsl(var(--discord-interactive-normal))' }} />
            </button>
            <button className="p-1 rounded hover:bg-black/20 transition-colors">
              <Settings className="w-4 h-4" style={{ color: 'hsl(var(--discord-interactive-normal))' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordSidebar;
