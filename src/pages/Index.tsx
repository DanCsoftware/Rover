import DiscordSidebar from "@/components/DiscordSidebar";
import DiscordChat from "@/components/DiscordChat";
import DiscordUserPanel from "@/components/DiscordUserPanel";
import DiscordDiscovery from "@/components/DiscordDiscovery";
import DiscordFriendsPanel from "@/components/DiscordFriendsPanel";
import ActiveNowPanel from "@/components/ActiveNowPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useDiscordState } from "@/hooks/useDiscordState";
import { servers } from "@/data/discordData";

const Index = () => {
  const {
    activeChannel,
    activeChannelType, 
    activeUser,
    isDMView,
    isDiscoverView,
    activeServer,
    activeHomeTab,
    isCurrentServerAdmin,
    switchToChannel,
    switchToDM,
    switchToDMView,
    switchToDiscover,
    switchToServer,
    switchToHomeTab,
    getCurrentMessages,
    getCurrentChannelName
  } = useDiscordState();

  const currentServerName = servers.find(s => s.id === activeServer)?.name || 'Unknown Server';
  
  // Check if we're in a home tab view (not in a specific DM)
  const isHomeTabView = isDMView && !activeChannel;

  // When in discover view, use a simple flex layout (no resizable panels needed)
  if (isDiscoverView) {
    return (
      <div className="h-screen bg-gray-900 flex overflow-hidden">
        {/* Server icon bar only */}
        <DiscordSidebar 
          onChannelClick={switchToChannel}
          onDMClick={switchToDM}
          onDMViewClick={switchToDMView}
          onServerClick={switchToServer}
          onDiscoverClick={switchToDiscover}
          onHomeTabClick={switchToHomeTab}
          activeChannel={activeChannel}
          activeChannelType={activeChannelType}
          isDMView={isDMView}
          isDiscoverView={isDiscoverView}
          activeServer={activeServer}
          activeHomeTab={activeHomeTab}
        />
        {/* Discovery view takes remaining space */}
        <div className="flex-1">
          <DiscordDiscovery onServerClick={switchToServer} />
        </div>
      </div>
    );
  }

  // Normal view with resizable panels - no third column for admin, uses insights banner in chat
  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="w-full group">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <DiscordSidebar 
            onChannelClick={switchToChannel}
            onDMClick={switchToDM}
            onDMViewClick={switchToDMView}
            onServerClick={switchToServer}
            onDiscoverClick={switchToDiscover}
            onHomeTabClick={switchToHomeTab}
            activeChannel={activeChannel}
            activeChannelType={activeChannelType}
            isDMView={isDMView}
            isDiscoverView={isDiscoverView}
            activeServer={activeServer}
            activeHomeTab={activeHomeTab}
          />
        </ResizablePanel>
        
        <ResizableHandle 
          withHandle 
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:opacity-100" 
        />
        
        <ResizablePanel defaultSize={isHomeTabView ? 60 : (activeChannelType === 'dm' ? 60 : 80)} minSize={40}>
          {/* Show Friends panel when in home tab view */}
          {isHomeTabView && activeHomeTab === 'friends' ? (
            <DiscordFriendsPanel />
          ) : isHomeTabView ? (
            // Placeholder for other home tabs (Nitro, Shop, Quests)
            <div 
              className="flex-1 h-full flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--discord-bg-primary))' }}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {activeHomeTab === 'nitro' && '✨'}
                  {activeHomeTab === 'shop' && '🛒'}
                  {activeHomeTab === 'quests' && '🎯'}
                </div>
                <h2 
                  className="text-xl font-bold mb-2"
                  style={{ color: 'hsl(var(--discord-text-normal))' }}
                >
                  {activeHomeTab === 'nitro' && 'Discord Nitro'}
                  {activeHomeTab === 'shop' && 'Shop'}
                  {activeHomeTab === 'quests' && 'Quests'}
                </h2>
                <p style={{ color: 'hsl(var(--discord-text-muted))' }}>
                  Coming soon...
                </p>
              </div>
            </div>
          ) : (
            <DiscordChat 
              channelName={getCurrentChannelName()}
              messages={getCurrentMessages()}
              activeUser={activeUser}
              channelType={activeChannelType}
              activeServerId={activeServer}
              isAdmin={isCurrentServerAdmin}
              serverName={currentServerName}
            />
          )}
        </ResizablePanel>
        
        {/* Show Active Now panel for Friends view, User panel for DMs */}
        {isHomeTabView && activeHomeTab === 'friends' ? (
          <>
            <ResizableHandle 
              withHandle 
              className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:opacity-100" 
            />
            <ResizablePanel defaultSize={20} minSize={0} maxSize={25} className="hidden lg:block">
              <ActiveNowPanel />
            </ResizablePanel>
          </>
        ) : activeChannelType === 'dm' && !isHomeTabView ? (
          <>
            <ResizableHandle 
              withHandle 
              className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:opacity-100" 
            />
            <ResizablePanel defaultSize={20} minSize={0} maxSize={25} className="hidden lg:block">
              <DiscordUserPanel activeUser={activeUser} />
            </ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
