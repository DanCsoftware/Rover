import { useState } from "react";
import { Search } from "lucide-react";
import { servers, serverDiscoveryData } from "@/data/discordData";
import DiscordDiscoverSidebar from "./DiscordDiscoverSidebar";
import DiscoverServerCard from "./DiscoverServerCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DiscordDiscoveryProps {
  onServerClick: (serverId: number) => void;
}

const DiscordDiscovery = ({ onServerClick }: DiscordDiscoveryProps) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'servers' | 'quests'>('servers');
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'home', label: 'Home' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'music', label: 'Music' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'science', label: 'Science & Tech' },
    { id: 'education', label: 'Education' },
    { id: 'student', label: 'Student Hubs' },
  ];

  const getCategoryForServer = (serverId: number): string[] => {
    const categoryMap: Record<number, string[]> = {
      2: ['gaming', 'entertainment'],
      3: ['music', 'entertainment'],
      4: ['science', 'entertainment'],
      5: ['science', 'education'],
      6: ['entertainment'],
      7: ['education'],
      8: ['entertainment'],
      9: ['education', 'science'],
    };
    return categoryMap[serverId] || [];
  };

  const filteredServers = servers.filter(server => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!server.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Filter by category
    if (activeCategory !== 'home') {
      const serverCategories = getCategoryForServer(server.id);
      if (!serverCategories.includes(activeCategory)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="flex h-full" style={{ backgroundColor: 'hsl(var(--discord-bg-primary))' }}>
      {/* Discovery Sidebar */}
      <DiscordDiscoverSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Category Navigation */}
        <div 
          className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid hsl(var(--discord-bg-quaternary))' }}
        >
          <div className="flex items-center gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="text-sm font-medium pb-1 transition-colors relative"
                style={{
                  color: activeCategory === category.id 
                    ? 'hsl(var(--discord-text-normal))' 
                    : 'hsl(var(--discord-text-muted))',
                  borderBottom: activeCategory === category.id 
                    ? '2px solid hsl(var(--discord-text-normal))' 
                    : '2px solid transparent'
                }}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}
          >
            <Search className="w-4 h-4" style={{ color: 'hsl(var(--discord-text-muted))' }} />
            <input
              type="text"
              placeholder="Explore servers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-40"
              style={{ color: 'hsl(var(--discord-text-normal))' }}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          {activeTab === 'servers' && (
            <div className="p-6">
              {/* Hero Banner */}
              <div 
                className="relative rounded-xl overflow-hidden mb-8 p-8"
                style={{
                  background: 'linear-gradient(135deg, #5865f2 0%, #3b44c4 40%, #1e1f22 100%)',
                  minHeight: '200px'
                }}
              >
                <div className="relative z-10 max-w-lg">
                  <h1 
                    className="text-3xl font-bold mb-3 uppercase tracking-wide"
                    style={{ color: 'white' }}
                  >
                    Find your community on Discord
                  </h1>
                  <p 
                    className="text-base opacity-90"
                    style={{ color: 'rgba(255,255,255,0.8)' }}
                  >
                    From gaming, to music, to learning, there's a place for you.
                  </p>
                </div>
                
                {/* Decorative elements */}
                <div 
                  className="absolute top-4 right-8 w-32 h-32 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(circle, #eb459e 0%, transparent 70%)' }}
                />
                <div 
                  className="absolute bottom-4 right-32 w-20 h-20 rounded-full opacity-15"
                  style={{ background: 'radial-gradient(circle, #57f287 0%, transparent 70%)' }}
                />
              </div>

              {/* Featured Servers Section */}
              <div className="mb-6">
                <h2 
                  className="text-lg font-bold mb-4"
                  style={{ color: 'hsl(var(--discord-text-normal))' }}
                >
                  {activeCategory === 'home' ? 'Featured Communities' : categories.find(c => c.id === activeCategory)?.label}
                </h2>

                {filteredServers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredServers.map((server) => {
                      const discoveryMeta = serverDiscoveryData[server.id];
                      if (!discoveryMeta) return null;
                      
                      return (
                        <DiscoverServerCard
                          key={server.id}
                          server={server}
                          discoveryMeta={discoveryMeta}
                          onClick={() => onServerClick(server.id)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div 
                    className="text-center py-12"
                    style={{ color: 'hsl(var(--discord-text-muted))' }}
                  >
                    <p>No servers found in this category.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'apps' && (
            <div className="flex items-center justify-center h-96">
              <p style={{ color: 'hsl(var(--discord-text-muted))' }}>Apps coming soon...</p>
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="flex items-center justify-center h-96">
              <p style={{ color: 'hsl(var(--discord-text-muted))' }}>Quests coming soon...</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default DiscordDiscovery;
