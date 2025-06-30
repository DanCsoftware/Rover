
import { Bot, Hash, Volume2, Settings, Headphones, Mic, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const DiscordSidebar = () => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["text", "voice"]);
  
  const servers = [
    { id: 1, name: "Discord", icon: "🎮", active: false },
    { id: 2, name: "Server 1", icon: "🔥", active: false },
    { id: 3, name: "Server 2", icon: "🎵", active: false },
    { id: 4, name: "Midjourney", icon: "/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png", active: true },
  ];

  const dmChannels = [
    { name: "Find or start a conve...", type: "dm" },
    { name: "User 1 🔴MSU", type: "dm", status: "online" },
    { name: "Tickets", type: "dm" },
    { name: "User 2...", type: "dm" },
    { name: "User 3, User 4, G...", type: "dm", members: "4 Members" },
    { name: "User 5", type: "dm" },
    { name: "User 6...", type: "dm" },
    { name: "Midjourney Bot", type: "dm", active: true },
  ];

  const textChannels = [
    { name: "general", type: "text" },
    { name: "newbies", type: "text" },
    { name: "🎨-showcase", type: "text" },
    { name: "prompt-help", type: "text" },
    { name: "🚨-rules", type: "text" },
  ];

  const voiceChannels = [
    { name: "General", type: "voice", users: 0 },
    { name: "🎨 Creative Session", type: "voice", users: 3 },
    { name: "Help Desk", type: "voice", users: 1 },
  ];

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  return (
    <div className="flex h-full bg-gray-800">
      {/* Server List */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-3 space-y-2 flex-shrink-0">
        {servers.map((server) => (
          <div
            key={server.id}
            className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              server.active ? "bg-indigo-600" : "bg-gray-700 hover:bg-indigo-600 hover:rounded-xl"
            }`}
          >
            {server.icon.startsWith("/") ? (
              <img src={server.icon} alt={server.name} className="w-8 h-8 rounded-full" />
            ) : (
              <span className="text-xl">{server.icon}</span>
            )}
          </div>
        ))}
        <div className="w-8 h-0.5 bg-gray-600 rounded-full"></div>
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 hover:rounded-xl transition-all">
          <span className="text-green-400 text-2xl">+</span>
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 bg-gray-800 flex flex-col min-w-0">
        <div className="h-12 border-b border-gray-700 flex items-center px-4 flex-shrink-0">
          <span className="text-white font-semibold truncate">Midjourney Official</span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
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
                {textChannels.map((channel, index) => (
                  <div
                    key={index}
                    className="flex items-center px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700"
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
                {voiceChannels.map((channel, index) => (
                  <div
                    key={index}
                    className="flex items-center px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700"
                  >
                    <Volume2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-300 text-sm flex-1 truncate">{channel.name}</span>
                    {channel.users > 0 && (
                      <span className="text-gray-500 text-xs flex-shrink-0">{channel.users}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct Messages */}
          <div className="p-2 border-t border-gray-700 mt-2">
            <div className="flex items-center justify-between px-2 py-1 text-gray-400 text-xs uppercase font-semibold">
              <span className="truncate">Direct Messages</span>
              <span className="text-lg cursor-pointer hover:text-white flex-shrink-0">+</span>
            </div>
            
            {dmChannels.map((channel, index) => (
              <div
                key={index}
                className={`flex items-center px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  channel.active ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3 flex-shrink-0">
                  {channel.name === "Midjourney Bot" ? (
                    <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Midjourney" className="w-6 h-6 rounded-full" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 text-sm truncate">{channel.name}</div>
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
        </div>

        {/* User Panel */}
        <div className="h-14 bg-gray-900 flex items-center px-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 flex-shrink-0">
            <span className="text-white text-sm font-bold">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">User</div>
            <div className="text-gray-400 text-xs truncate">#1234</div>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            <button className="p-1 hover:bg-gray-700 rounded">
              <Mic className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-700 rounded">
              <Headphones className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-700 rounded">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordSidebar;
