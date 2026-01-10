import { Grid2X2, Users, Trophy } from "lucide-react";

interface DiscordDiscoverSidebarProps {
  activeTab: 'apps' | 'servers' | 'quests';
  onTabChange: (tab: 'apps' | 'servers' | 'quests') => void;
}

const DiscordDiscoverSidebar = ({ activeTab, onTabChange }: DiscordDiscoverSidebarProps) => {
  const tabs = [
    { id: 'apps' as const, label: 'Apps', icon: Grid2X2 },
    { id: 'servers' as const, label: 'Servers', icon: Users },
    { id: 'quests' as const, label: 'Quests', icon: Trophy },
  ];

  return (
    <div 
      className="w-60 h-full flex flex-col"
      style={{ backgroundColor: 'hsl(var(--discord-bg-secondary))' }}
    >
      {/* Header */}
      <div 
        className="h-12 flex items-center px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid hsl(var(--discord-bg-quaternary))' }}
      >
        <span className="font-bold text-lg" style={{ color: 'hsl(var(--discord-text-normal))' }}>
          Discover
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="p-2 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors"
              style={{
                backgroundColor: isActive ? 'hsl(var(--discord-bg-quaternary))' : 'transparent',
                color: isActive ? 'hsl(var(--discord-text-normal))' : 'hsl(var(--discord-text-muted))'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'hsl(var(--discord-bg-tertiary))';
                  e.currentTarget.style.color = 'hsl(var(--discord-text-normal))';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'hsl(var(--discord-text-muted))';
                }
              }}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{tab.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiscordDiscoverSidebar;
