import { useState } from "react";
import { Search, Sparkles, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { servers, serverDiscoveryData, discoverableServers, discoveryMetadata, userJoinedServerIds } from "@/data/discordData";
import { discordApps, appCategories } from "@/data/appsData";
import DiscordDiscoverSidebar from "./DiscordDiscoverSidebar";
import DiscoverServerCard from "./DiscoverServerCard";
import DiscoverAppCard from "./DiscoverAppCard";
import RoverRecommendationCard from "./RoverRecommendationCard";
import RoverAvatar from "./RoverAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRoverChat } from "@/hooks/useRoverChat";
import { serverDiscovery, ServerRecommendation } from "@/utils/serverDiscovery";

interface DiscordDiscoveryProps {
  onServerClick: (serverId: number) => void;
}

const DiscordDiscovery = ({ onServerClick }: DiscordDiscoveryProps) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'servers' | 'quests'>('servers');
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [activeAppCategory, setActiveAppCategory] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [roverQuery, setRoverQuery] = useState('');
  const [roverAcknowledgment, setRoverAcknowledgment] = useState('');
  const [recommendations, setRecommendations] = useState<ServerRecommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { streamingResponse, isStreaming, sendMessage } = useRoverChat();

  const interestTags = ['Gaming', 'Music', 'Art', 'Tech', 'Anime', 'Fitness', 'Learning', 'Creative'];

  const handleRoverSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setHasSearched(true);
    setRoverAcknowledgment('');
    
    // Get recommendations based on query
    const recs = serverDiscovery.getDiscoveryRecommendations(query);
    setRecommendations(recs);
    
    try {
      // Get a brief acknowledgment from AI
      const response = await sendMessage(
        `User is looking for Discord communities about: "${query}". Give a brief, friendly 1-2 sentence acknowledgment about what you found. Don't list servers, just acknowledge their interest. Keep it under 30 words.`,
        { channelName: 'discovery', serverName: 'Discovery', messages: [] }
      );
      
      setRoverAcknowledgment(response);
    } catch (e) {
      console.error('ROVER search error:', e);
      setRoverAcknowledgment(`Found ${recs.length} communities for "${query}"! Check them out below.`);
    }
  };

  const handleTagClick = (tag: string) => {
    setRoverQuery(tag);
    handleRoverSearch(tag);
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

  // Filter servers user has already joined (for "Featured" section)
  const joinedServers = servers.filter(server => userJoinedServerIds.includes(server.id));
  
  const filteredJoinedServers = joinedServers.filter(server => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!server.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    
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

  return (
    <div className="flex h-full" style={{ backgroundColor: 'hsl(var(--discord-bg-primary))' }}>
      {/* Discovery Sidebar */}
      <DiscordDiscoverSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Category Navigation */}
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
              {/* Compact ROVER Discovery Banner */}
              <div 
                className="relative rounded-xl overflow-hidden mb-8"
                style={{
                  background: 'linear-gradient(135deg, #5865f2 0%, #3b44c4 40%, #1e1f22 100%)',
                }}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* ROVER Avatar - Discord-style */}
                    <RoverAvatar size="lg" isThinking={isStreaming} showVerified={true} />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold" style={{ color: 'white' }}>
                          Find your community
                        </h1>
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                      </div>
                      <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        Tell ROVER what you're into
                      </p>
                      
                      {/* Interest Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {interestTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            disabled={isStreaming}
                            className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
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
                      
                      {/* Search Input */}
                      <div className="flex items-center gap-2">
                        <div 
                          className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-lg"
                          style={{ 
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <input
                            type="text"
                            value={roverQuery}
                            onChange={(e) => setRoverQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRoverSearch(roverQuery)}
                            placeholder="I want to find communities about..."
                            disabled={isStreaming}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/50"
                          />
                        </div>
                        <button
                          onClick={() => handleRoverSearch(roverQuery)}
                          disabled={isStreaming || !roverQuery.trim()}
                          className="px-4 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
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
                
                {/* Brief Acknowledgment (not long text) */}
                {(hasSearched && (streamingResponse || roverAcknowledgment)) && (
                  <div 
                    className="px-6 py-3 flex items-center gap-3"
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.25)',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {isStreaming ? (
                        <>
                          {streamingResponse}
                          <span className="animate-pulse">▋</span>
                        </>
                      ) : (
                        roverAcknowledgment || `Found ${recommendations.length} communities for you!`
                      )}
                    </p>
                  </div>
                )}
                
                {/* Decorative elements */}
                <div 
                  className="absolute top-2 right-6 w-24 h-24 rounded-full opacity-20 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #eb459e 0%, transparent 70%)' }}
                />
              </div>

              {/* ROVER Recommendations Section - Only after search */}
              {hasSearched && recommendations.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5" style={{ color: '#a78bfa' }} />
                    <h2 
                      className="text-lg font-bold"
                      style={{ color: 'hsl(var(--discord-text-normal))' }}
                    >
                      Recommended for You
                    </h2>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa' }}
                    >
                      {recommendations.length} new
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recommendations.slice(0, 8).map((rec) => {
                      const discoveryMeta = serverDiscoveryData[rec.server.id];
                      const extendedMeta = discoveryMetadata[rec.server.id];
                      if (!discoveryMeta) return null;
                      
                      return (
                        <RoverRecommendationCard
                          key={rec.server.id}
                          server={rec.server}
                          discoveryMeta={discoveryMeta}
                          extendedMeta={extendedMeta}
                          matchScore={rec.matchScore}
                          matchReasons={rec.matchReasons}
                          onExplore={() => {
                            console.log('Explore server:', rec.server.id);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State - Before Search */}
              {!hasSearched && (
                <div className="text-center py-16">
                  <RoverAvatar size="lg" className="mx-auto mb-4 opacity-60" showVerified={false} />
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'hsl(var(--discord-text-normal))' }}
                  >
                    Tell ROVER what you're looking for
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'hsl(var(--discord-text-muted))' }}
                  >
                    Type your interests above or click a tag to get started
                  </p>
                </div>
              )}

              {/* Your Servers Section */}
              <div className="mb-6">
                <h2 
                  className="text-lg font-bold mb-4"
                  style={{ color: 'hsl(var(--discord-text-normal))' }}
                >
                  {activeCategory === 'home' ? 'Your Communities' : serverCategories.find(c => c.id === activeCategory)?.label}
                </h2>

                {filteredJoinedServers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredJoinedServers.map((server) => {
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
                  className="absolute top-4 right-8 w-32 h-32 rounded-full opacity-30"
                  style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }}
                />
                <div 
                  className="absolute bottom-4 right-32 w-20 h-20 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(circle, #57f287 0%, transparent 70%)' }}
                />
              </div>

              {/* Promoted Apps Section */}
              {promotedApps.length > 0 && (
                <div className="mb-8">
                  <h2 
                    className="text-lg font-bold mb-4"
                    style={{ color: 'hsl(var(--discord-text-normal))' }}
                  >
                    Featured Apps
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {promotedApps.map((app) => (
                      <DiscoverAppCard key={app.id} app={app} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Apps Section */}
              <div className="mb-6">
                <h2 
                  className="text-lg font-bold mb-4"
                  style={{ color: 'hsl(var(--discord-text-normal))' }}
                >
                  {activeAppCategory === 'featured' ? 'All Apps' : appCategories.find(c => c.id === activeAppCategory)?.label}
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
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="p-6">
              {/* Quests Hero */}
              <div 
                className="relative rounded-xl overflow-hidden mb-8 p-8"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #1e1f22 100%)',
                  minHeight: '200px'
                }}
              >
                <div className="relative z-10 max-w-lg">
                  <h1 
                    className="text-3xl font-bold mb-3 uppercase tracking-wide"
                    style={{ color: 'white' }}
                  >
                    ⚔️ Quests
                  </h1>
                  <p 
                    className="text-base opacity-90"
                    style={{ color: 'rgba(255,255,255,0.8)' }}
                  >
                    Complete challenges, earn rewards, and unlock exclusive items across Discord.
                  </p>
                </div>
              </div>

              {/* Quests Content */}
              <div 
                className="text-center py-16 rounded-xl"
                style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}
              >
                <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: '#fbbf24' }} />
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: 'hsl(var(--discord-text-normal))' }}
                >
                  New Quests Coming Soon
                </h3>
                <p 
                  className="text-sm max-w-md mx-auto"
                  style={{ color: 'hsl(var(--discord-text-muted))' }}
                >
                  Check back later for exciting challenges and rewards. 
                  In the meantime, explore servers and apps!
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default DiscordDiscovery;
