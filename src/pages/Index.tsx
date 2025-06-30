
import DiscordSidebar from "@/components/DiscordSidebar";
import DiscordChat from "@/components/DiscordChat";
import DiscordUserPanel from "@/components/DiscordUserPanel";

const Index = () => {
  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      <DiscordSidebar />
      <DiscordChat />
      <DiscordUserPanel />
    </div>
  );
};

export default Index;
