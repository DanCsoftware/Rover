
import { Hash, Users, Bell, Pin, Search, AtSign, Settings, X, Inbox, HelpCircle } from "lucide-react";
import { useState } from "react";

interface DiscordChannelHeaderProps {
  channelName: string;
  channelType: 'text' | 'dm';
  onToggleUserList: () => void;
  showUserList: boolean;
}

const DiscordChannelHeader = ({ channelName, channelType, onToggleUserList, showUserList }: DiscordChannelHeaderProps) => {
  return (
    <div className="h-12 border-b border-gray-600 flex items-center justify-between px-4 flex-shrink-0 bg-gray-700">
      <div className="flex items-center min-w-0 flex-1">
        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center mr-3 flex-shrink-0">
          {channelType === 'text' ? (
            <Hash className="w-4 h-4 text-gray-400" />
          ) : (
            <AtSign className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <span className="text-white font-semibold mr-2 truncate">{channelName}</span>
        {channelType === 'text' && (
          <>
            <div className="h-6 w-px bg-gray-600 mx-2 flex-shrink-0" />
            <span className="text-gray-400 text-sm truncate">
              Welcome to #{channelName}!
            </span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {channelType === 'text' && (
          <>
            <button className="p-1.5 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors">
              <Hash className="w-5 h-5" />
            </button>
            <button className="p-1.5 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-1.5 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors">
              <Pin className="w-5 h-5" />
            </button>
            <button 
              onClick={onToggleUserList}
              className={`p-1.5 hover:bg-gray-600 rounded transition-colors ${showUserList ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Users className="w-5 h-5" />
            </button>
          </>
        )}
        
        <div className="flex items-center space-x-2 ml-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="bg-gray-900 text-white text-sm rounded px-7 py-1 w-36 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:w-60 transition-all duration-200"
            />
          </div>
          
          <button className="p-1.5 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors">
            <Inbox className="w-5 h-5" />
          </button>
          
          <button className="p-1.5 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscordChannelHeader;
