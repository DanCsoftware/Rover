import { useState } from "react";
import { Search, Sparkles, Bot, ArrowRight, Loader2 } from "lucide-react";
import { servers, serverDiscoveryData } from "@/data/discordData";
import { discordApps, appCategories } from "@/data/appsData";
import DiscordDiscoverSidebar from "./DiscordDiscoverSidebar";
import DiscoverServerCard from "./DiscoverServerCard";
import DiscoverAppCard from "./DiscoverAppCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRoverChat } from "@/hooks/useRoverChat";

interface DiscordDiscoveryProps {
  onServerClick: (serverId: number) => void;
}

const DiscordDiscovery = ({ onServerClick }: DiscordDiscoveryProps) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'servers' | 'quests'>('servers');
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [activeAppCategory, setActiveAppCategory] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [roverQuery, setRoverQuery] = useState('');
  const [roverRecommendation, setRoverRecommendation] = useState('');
  const [highlightedServers, setHighlightedServers] = useState<number[]>([]);
  
  const { streamingResponse, isStreaming, sendMessage } = useRoverChat();

  const interestTags = ['Gaming', 'Music', 'Art', 'Tech', 'Crypto', 'Anime', 'Social', 'Learning'];

  const handleRoverSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setRoverRecommendation('');
    setHighlightedServers([]);
    
    try {
      const response = await sendMessage(
        `I'm looking for Discord communities. Help me find: ${query}. Based on available servers, recommend the best matches and explain why.`,
        { channelName: 'discovery', serverName: 'Discovery', messages: [] }
      );
      
      setRoverRecommendation(response);
      
      // Highlight matching servers based on keywords
      const queryLower = query.toLowerCase();
      const matches = servers.filter(s => {
        const meta = serverDiscoveryData[s.id];
        const searchText = `${s.name} ${meta?.description || ''}`.toLowerCase();
        return queryLower.split(' ').some(word => word.length > 2 && searchText.includes(word));
      });
      setHighlightedServers(matches.map(s => s.id));
    } catch (e) {
      console.error('ROVER search error:', e);
    }
  };

  const handleTagClick = (tag: string) => {
    setRoverQuery(tag);
    handleRoverSearch(`${tag} communities with active members`);
  };

  const serverCategories = [
    { id: 'home', label: 'Home' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'music', label: 'Music' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'science', label: 'Science & Tech' },
    { id: 'education', label: 'Education' },
    { id: 'student', label: 'Student Hubs' },
  ];

  // Get current categories based on active tab
  const getCurrentCategories = () => {
    if (activeTab === 'servers') return serverCategories;
    if (activeTab === 'apps') return appCategories;
    return [];
  };

  const currentCategories = getCurrentCategories();

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
      const serverCats = getCategoryForServer(server.id);
      if (!serverCats.includes(activeCategory)) {
        return false;
      }
    }
    
    return true;
  });

  const filteredApps = discordApps.filter(app => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!app.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    if (activeAppCategory !== 'featured') {
      if (app.category !== activeAppCategory) {
        return false;
      }
    }
    
    return true;
  });

  const promotedApps = discordApps.filter(app => app.isPromoted);
  const puzzleGames = discordApps.filter(app => app.category === 'games' && !app.isPromoted);

  return (
    <div className="flex h-full" style={{ backgroundColor: 'hsl(var(--discord-bg-primary))' }}>
      {/* Discovery Sidebar */}
      <DiscordDiscoverSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Category Navigation - Only show for Apps and Servers */}
        {activeTab !== 'quests' && (
          <div 
            className="flex items-center justify-between px-6 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid hsl(var(--discord-bg-quaternary))' }}
          >
            <div className="flex items-center gap-6">
              {currentCategories.map((category) => {
                const isActive = activeTab === 'servers' 
                  ? activeCategory === category.id 
                  : activeAppCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      if (activeTab === 'servers') {
                        setActiveCategory(category.id);
                      } else {
                        setActiveAppCategory(category.id);
                      }
                    }}
                    className="text-sm font-medium pb-1 transition-colors relative"
                    style={{
                      color: isActive 
                        ? 'hsl(var(--discord-text-normal))' 
                        : 'hsl(var(--discord-text-muted))',
                      borderBottom: isActive 
                        ? '2px solid hsl(var(--discord-text-normal))' 
                        : '2px solid transparent'
                    }}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-md"
              style={{ backgroundColor: 'hsl(var(--discord-bg-tertiary))' }}
            >
              <Search className="w-4 h-4" style={{ color: 'hsl(var(--discord-text-muted))' }} />
              <input
                type="text"
                placeholder={activeTab === 'servers' ? "Explore servers" : "Search apps"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-40"
                style={{ color: 'hsl(var(--discord-text-normal))' }}
              />
            </div>
          </div>
        )}

        {/* Quests Header */}
        {activeTab === 'quests' && (
          <div 
            className="flex items-center px-6 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid hsl(var(--discord-bg-quaternary))' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: '#fbbf24' }} />
              <button
                className="text-sm font-medium pb-1"
                style={{
                  color: 'hsl(var(--discord-text-normal))',
                  borderBottom: '2px solid hsl(var(--discord-text-normal))'
                }}
              >
                All Quests
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          {activeTab === 'servers' && (
            <div className="p-6">
              {/* Interactive ROVER Discovery Banner */}
              <div 
                className="relative rounded-xl overflow-hidden mb-8"
                style={{
                  background: 'linear-gradient(135deg, #5865f2 0%, #3b44c4 40%, #1e1f22 100%)',
                }}
              >
                <div className="p-8 pb-6">
                  <div className="flex items-start gap-4">
                    {/* ROVER Avatar */}
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{ 
                        background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
                        boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)'
                      }}
                    >
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold" style={{ color: 'white' }}>
                          Hey! I'm ROVER
                        </h1>
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                      </div>
                      <p className="text-base mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>
                        Tell me what you're into, and I'll find your perfect community.
                      </p>
                      
                      {/* Interest Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {interestTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            disabled={isStreaming}
                            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.15)',
                              color: 'white',
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      
                      {/* Natural Language Search */}
                      <div className="flex items-center gap-2">
                        <div 
                          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{ 
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <Bot className="w-5 h-5 text-purple-300 flex-shrink-0" />
                          <input
                            type="text"
                            value={roverQuery}
                            onChange={(e) => setRoverQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRoverSearch(roverQuery)}
                            placeholder="Describe your ideal community..."
                            disabled={isStreaming}
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/50"
                          />
                        </div>
                        <button
                          onClick={() => handleRoverSearch(roverQuery)}
                          disabled={isStreaming || !roverQuery.trim()}
                          className="px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                          style={{ 
                            backgroundColor: 'white',
                            color: '#5865f2'
                          }}
                        >
                          {isStreaming ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              Find
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ROVER Response Section */}
                {(streamingResponse || roverRecommendation) && (
                  <div 
                    className="px-8 py-4"
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)' }}
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          ROVER's Recommendations
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
                          {isStreaming ? streamingResponse : roverRecommendation}
                          {isStreaming && <span className="animate-pulse">▋</span>}
                        </p>
                        {highlightedServers.length > 0 && !isStreaming && (
                          <p className="text-xs mt-2" style={{ color: '#a78bfa' }}>
                            ✨ {highlightedServers.length} matching communities highlighted below
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Decorative elements */}
                <div 
                  className="absolute top-4 right-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #eb459e 0%, transparent 70%)' }}
                />
                <div 
                  className="absolute bottom-4 right-32 w-20 h-20 rounded-full opacity-15 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #57f287 0%, transparent 70%)' }}
                />
              </div>

              {/* Featured Servers Section */}
              <div className="mb-6">
                <h2 
                  className="text-lg font-bold mb-4"
                  style={{ color: 'hsl(var(--discord-text-normal))' }}
                >
                  {activeCategory === 'home' ? 'Featured Communities' : serverCategories.find(c => c.id === activeCategory)?.label}
                </h2>

                {filteredServers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredServers.map((server) => {
                      const discoveryMeta = serverDiscoveryData[server.id];
                      if (!discoveryMeta) return null;
                      const isHighlighted = highlightedServers.includes(server.id);
                      
                      return (
                        <div
                          key={server.id}
                          className={`transition-all ${isHighlighted ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-transparent rounded-xl scale-[1.02]' : ''}`}
                        >
                          <DiscoverServerCard
                            server={server}
                            discoveryMeta={discoveryMeta}
                            onClick={() => onServerClick(server.id)}
                          />
                        </div>
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
            <div className="p-6">
              {/* Hero Banner for Apps */}
              <div 
                className="relative rounded-xl overflow-hidden mb-8 p-8"
                style={{
                  background: 'linear-gradient(135deg, #5865f2 0%, #7c3aed 40%, #1e1f22 100%)',
                  minHeight: '200px'
                }}
              >
                <div className="relative z-10 max-w-lg">
                  <h1 
                    className="text-3xl font-bold mb-3 uppercase tracking-wide"
                    style={{ color: 'white' }}
                  >
                    Find things to do together
                  </h1>
                  <p 
                    className="text-base opacity-90"
                    style={{ color: 'rgba(255,255,255,0.8)' }}
                  >
                    Bring the fun to your hangouts with apps for games, music, creative tools, and more.
                  </p>
                </div>
                
                {/* Decorative elements */}
                <div 
                  className="absolute top-4 right-8 w-32 h-32 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }}
                />
                <div 
                  className="absolute bottom-4 right-32 w-20 h-20 rounded-full opacity-15"
                  style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }}
                />
              </div>

              {/* Promoted Games Section */}
              {activeAppCategory === 'featured' && (
                <>
                  <div className="mb-6">
                    <h2 
                      className="text-lg font-bold mb-4"
                      style={{ color: 'hsl(var(--discord-text-normal))' }}
                    >
                      Promoted Games
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {promotedApps.map((app) => (
                        <DiscoverAppCard key={app.id} app={app} />
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 
                      className="text-lg font-bold mb-4"
                      style={{ color: 'hsl(var(--discord-text-normal))' }}
                    >
                      Puzzle Games
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {puzzleGames.slice(0, 4).map((app) => (
                        <DiscoverAppCard key={app.id} app={app} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Filtered Apps */}
              {activeAppCategory !== 'featured' && (
                <div className="mb-6">
                  <h2 
                    className="text-lg font-bold mb-4"
                    style={{ color: 'hsl(var(--discord-text-normal))' }}
                  >
                    {appCategories.find(c => c.id === activeAppCategory)?.label || 'Apps'}
                  </h2>
                  {filteredApps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredApps.map((app) => (
                        <DiscoverAppCard key={app.id} app={app} />
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="text-center py-12"
                      style={{ color: 'hsl(var(--discord-text-muted))' }}
                    >
                      <p>No apps found in this category.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="p-6">
              {/* Hero Banner for Quests */}
              <div 
                className="relative rounded-xl overflow-hidden mb-8"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #5865f2 30%, #3b82f6 60%, #1e1f22 100%)',
                  minHeight: '280px'
                }}
              >
                {/* Decorative stars */}
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="absolute top-6 left-12 text-2xl opacity-60"
                    style={{ color: '#fbbf24' }}
                  >
                    ✦
                  </div>
                  <div 
                    className="absolute top-16 right-24 text-lg opacity-40"
                    style={{ color: '#fbbf24' }}
                  >
                    ★
                  </div>
                  <div 
                    className="absolute bottom-12 left-32 text-sm opacity-30"
                    style={{ color: '#fbbf24' }}
                  >
                    ✦
                  </div>
                  <div 
                    className="absolute top-24 left-1/3 text-xl opacity-50"
                    style={{ color: '#a855f7' }}
                  >
                    ★
                  </div>
                  <div 
                    className="absolute bottom-20 right-1/4 text-2xl opacity-40"
                    style={{ color: '#60a5fa' }}
                  >
                    ✦
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full py-12 px-8 text-center">
                  <h1 
                    className="text-4xl font-bold mb-6 uppercase tracking-wide"
                    style={{ color: 'white' }}
                  >
                    Quests have moved!
                  </h1>
                  <button 
                    className="px-6 py-3 rounded-md font-semibold text-sm transition-all hover:opacity-90"
                    style={{ 
                      backgroundColor: 'white', 
                      color: '#1e1f22'
                    }}
                  >
                    View Quests
                  </button>
                </div>
              </div>

              {/* Info Section */}
              <div className="text-center max-w-xl mx-auto">
                <h2 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'hsl(var(--discord-text-normal))' }}
                >
                  Quests have moved!
                </h2>
                <p 
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: 'hsl(var(--discord-text-muted))' }}
                >
                  We've moved Quests to their own dedicated space! You can now find all your quests, 
                  rewards, and progress tracking in one convenient location. Click the button above 
                  or use the link below to access Quest Home.
                </p>
                <a 
                  href="#"
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#5865f2' }}
                >
                  Go to Quest Home
                </a>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default DiscordDiscovery;
