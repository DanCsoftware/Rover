
import DiscordSidebar from "@/components/DiscordSidebar";
import DiscordChat from "@/components/DiscordChat";
import DiscordUserPanel from "@/components/DiscordUserPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const Index = () => {
  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="w-full">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <DiscordSidebar />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={60} minSize={40}>
          <DiscordChat />
        </ResizablePanel>
        
        <ResizableHandle withHandle className="hidden lg:flex" />
        
        <ResizablePanel defaultSize={20} minSize={0} maxSize={25} className="hidden lg:block">
          <DiscordUserPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
