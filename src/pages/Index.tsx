import DiscordSidebar from "@/components/DiscordSidebar";
import DiscordChat from "@/components/DiscordChat";
import DiscordUserPanel from "@/components/DiscordUserPanel";
import DiscordDiscovery from "@/components/DiscordDiscovery";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useDiscordState } from "@/hooks/useDiscordState";

const Index = () => {
  const {
    activeChannel,
    activeChannelType, 
    activeUser,
    isDMView,
    isDiscoverView,
    activeServer,
    switchToChannel,
    switchToDM,
    switchToDMView,
    switchToDiscover,
    switchToServer,
    getCurrentMessages,
    getCurrentChannelName
  } = useDiscordState();

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
          activeChannel={activeChannel}
          activeChannelType={activeChannelType}
          isDMView={isDMView}
          isDiscoverView={isDiscoverView}
          activeServer={activeServer}
        />
        {/* Discovery view takes remaining space */}
        <div className="flex-1">
          <DiscordDiscovery onServerClick={switchToServer} />
        </div>
      </div>
    );
  }

  // Normal view with resizable panels
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
            activeChannel={activeChannel}
            activeChannelType={activeChannelType}
            isDMView={isDMView}
            isDiscoverView={isDiscoverView}
            activeServer={activeServer}
          />
        </ResizablePanel>
        
        <ResizableHandle 
          withHandle 
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:opacity-100" 
        />
        
        <ResizablePanel defaultSize={60} minSize={40}>
          <DiscordChat 
            channelName={getCurrentChannelName()}
            messages={getCurrentMessages()}
            activeUser={activeUser}
            channelType={activeChannelType}
            activeServerId={activeServer}
          />
        </ResizablePanel>
        
        <ResizableHandle 
          withHandle 
          className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:opacity-100" 
        />
        
        {/* Show user panel only for DMs */}
        {activeChannelType === 'dm' && (
          <ResizablePanel defaultSize={20} minSize={0} maxSize={25} className="hidden lg:block">
            <DiscordUserPanel activeUser={activeUser} />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
