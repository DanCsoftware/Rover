
import { Hash, Users, Bell, Pin, Search, AtSign, Settings, X, Inbox, HelpCircle, Shield } from "lucide-react";
import { useState } from "react";

interface DiscordChannelHeaderProps {
  channelName: string;
  channelType: 'text' | 'dm';
  onToggleUserList: () => void;
  showUserList: boolean;
  isAdmin?: boolean;
}

const DiscordChannelHeader = ({ channelName, channelType, onToggleUserList, showUserList, isAdmin = false }: DiscordChannelHeaderProps) => {
  return (
    <div className="h-12 flex items-center justify-between px-4 flex-shrink-0 shadow-sm" style={{ backgroundColor: 'hsl(var(--discord-bg-primary))', borderBottom: '1px solid hsl(var(--discord-bg-quaternary))' }}>
      <div className="flex items-center min-w-0 flex-1">
        {channelType === 'text' ? (
          <Hash className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: 'hsl(var(--discord-text-muted))' }} />
        ) : (
          <AtSign className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: 'hsl(var(--discord-text-muted))' }} />
        )}
        <span className="font-semibold mr-2 truncate" style={{ color: 'hsl(var(--discord-text-normal))' }}>{channelName}</span>
        
        {/* Admin Mode Indicator */}
        {isAdmin && channelType === 'text' && (
          <>
            <div className="h-6 w-px mx-2 flex-shrink-0" style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }} />
            <div 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
              style={{ 
                backgroundColor: 'rgba(88, 101, 242, 0.2)',
                color: '#818cf8'
              }}
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </div>
          </>
        )}
        
        {channelType === 'text' && !isAdmin && (
          <>
            <div className="h-6 w-px mx-2 flex-shrink-0" style={{ backgroundColor: 'hsl(var(--discord-bg-quaternary))' }} />
            <span className="text-sm truncate" style={{ color: 'hsl(var(--discord-text-muted))' }}>
              Welcome to #{channelName}! 🤖 Try @ROVER for navigation help
            </span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {channelType === 'text' && (
          <>
            <button className="p-1.5 rounded transition-colors hover:bg-black/20" style={{ color: 'hsl(var(--discord-interactive-normal))' }}>
              <Hash className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded transition-colors hover:bg-black/20" style={{ color: 'hsl(var(--discord-interactive-normal))' }}>
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded transition-colors hover:bg-black/20" style={{ color: 'hsl(var(--discord-interactive-normal))' }}>
              <Pin className="w-5 h-5" />
            </button>
            <button 
              onClick={onToggleUserList}
              className="p-1.5 rounded transition-colors hover:bg-black/20"
              style={{ color: showUserList ? 'hsl(var(--discord-text-normal))' : 'hsl(var(--discord-interactive-normal))' }}
            >
              <Users className="w-5 h-5" />
            </button>
          </>
        )}
        
        <div className="flex items-center space-x-2 ml-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2" style={{ color: 'hsl(var(--discord-text-muted))' }} />
            <input
              type="text"
              placeholder="Search"
              className="text-sm rounded px-7 py-1 w-36 focus:outline-none focus:w-60 transition-all duration-200"
              style={{ 
                backgroundColor: 'hsl(var(--discord-bg-secondary))', 
                color: 'hsl(var(--discord-text-normal))',
                border: '1px solid transparent'
              }}
              onFocus={(e) => e.target.style.borderColor = 'hsl(var(--discord-brand))'}
              onBlur={(e) => e.target.style.borderColor = 'transparent'}
            />
          </div>
          
          <button className="p-1.5 rounded transition-colors hover:bg-black/20" style={{ color: 'hsl(var(--discord-interactive-normal))' }}>
            <Inbox className="w-5 h-5" />
          </button>
          
          <button className="p-1.5 rounded transition-colors hover:bg-black/20" style={{ color: 'hsl(var(--discord-interactive-normal))' }}>
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscordChannelHeader;
