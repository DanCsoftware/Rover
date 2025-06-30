
import { Bot, Hash, Volume2, Settings, Headphones, Mic } from "lucide-react";

const DiscordSidebar = () => {
  const servers = [
    { id: 1, name: "Discord", icon: "🎮", active: false },
    { id: 2, name: "Server 1", icon: "🔥", active: false },
    { id: 3, name: "Server 2", icon: "🎵", active: false },
    { id: 4, name: "Midjourney", icon: "/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png", active: true },
  ];

  const channels = [
    { name: "Find or start a conve...", type: "dm" },
    { name: "JarExt 🔴MSU", type: "dm", status: "online" },
    { name: "Tickets", type: "dm" },
    { name: "deleted_user...", type: "dm" },
    { name: "HK, elw0n, G...", type: "dm", members: "4 Members" },
    { name: "elw0n", type: "dm" },
    { name: "danielahc...", type: "dm" },
    { name: "Midjourney Bot", type: "dm", active: true },
  ];

  return (
    <div className="flex h-screen bg-gray-800">
      {/* Server List */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-3 space-y-2">
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
      <div className="w-60 bg-gray-800 flex flex-col">
        <div className="h-12 border-b border-gray-700 flex items-center px-4">
          <span className="text-white font-semibold">Direct Messages</span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {channels.map((channel, index) => (
              <div
                key={index}
                className={`flex items-center px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  channel.active ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                  {channel.name === "Midjourney Bot" ? (
                    <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Midjourney" className="w-6 h-6 rounded-full" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 text-sm truncate">{channel.name}</div>
                  {channel.members && (
                    <div className="text-gray-500 text-xs">{channel.members}</div>
                  )}
                </div>
                {channel.status === "online" && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User Panel */}
        <div className="h-14 bg-gray-900 flex items-center px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium">Dancp</div>
            <div className="text-gray-400 text-xs">#1234</div>
          </div>
          <div className="flex space-x-1">
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
