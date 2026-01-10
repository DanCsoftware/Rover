
import { useState } from 'react';
import { servers, dmUsers, dmMessages, User, Message } from '@/data/discordData';

export const useDiscordState = () => {
  const [activeChannel, setActiveChannel] = useState<string>('official-links');
  const [activeChannelType, setActiveChannelType] = useState<'text' | 'dm'>('text');
  const [isDMView, setIsDMView] = useState<boolean>(false);
  const [isDiscoverView, setIsDiscoverView] = useState<boolean>(false);
  const [activeServer, setActiveServer] = useState<number>(4); // Default to Midjourney server
  const [activeUser, setActiveUser] = useState<User>({
    id: 'server',
    name: 'Midjourney',
    username: '',
    avatar: '/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png',
    aboutMe: 'Official Midjourney Discord Server',
    createdOn: 'Jan 29, 2022'
  });

  const switchToChannel = (channelId: string) => {
    const currentServer = servers.find(s => s.id === activeServer);
    const channel = currentServer?.textChannels.find(c => c.id === channelId);
    if (channel) {
      setActiveChannel(channelId);
      setActiveChannelType('text');
      setIsDMView(false);
      setActiveUser({
        id: 'server',
        name: getServerName(activeServer),
        username: '',
        avatar: getServerAvatar(activeServer),
        aboutMe: `Official ${getServerName(activeServer)} Discord Server`,
        createdOn: 'Jan 29, 2022'
      });
    }
  };

  const switchToDM = (userId: string) => {
    const user = dmUsers.find(u => u.id === userId);
    if (user) {
      setActiveChannel(userId);
      setActiveChannelType('dm');
      setIsDMView(true);
      setActiveUser(user);
    }
  };

  const switchToDMView = () => {
    setIsDMView(true);
    setIsDiscoverView(false);
    setActiveChannelType('dm');
    // If current channel is not a DM, switch to first available DM
    if (activeChannelType !== 'dm') {
      const firstDM = dmUsers[0];
      if (firstDM) {
        setActiveChannel(firstDM.id);
        setActiveUser(firstDM);
      }
    }
  };

  const switchToDiscover = () => {
    setIsDiscoverView(true);
    setIsDMView(false);
  };

  const switchToServer = (serverId: number) => {
    console.log('Switching to server:', serverId);
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setActiveServer(serverId);
      setIsDMView(false);
      setIsDiscoverView(false);
      setActiveChannelType('text');
      // Switch to first available text channel for this server
      const firstChannel = server.textChannels[0];
      if (firstChannel) {
        setActiveChannel(firstChannel.id);
        setActiveUser({
          id: 'server',
          name: server.name,
          username: '',
          avatar: getServerAvatar(serverId),
          aboutMe: `Official ${server.name} Discord Server`,
          createdOn: 'Jan 29, 2022'
        });
      }
    }
  };

  const getServerName = (serverId: number): string => {
    const server = servers.find(s => s.id === serverId);
    return server?.name || 'Unknown Server';
  };

  const getServerAvatar = (serverId: number): string => {
    const server = servers.find(s => s.id === serverId);
    return server?.icon || '/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png';
  };

  const getCurrentMessages = (): Message[] => {
    if (activeChannelType === 'text') {
      const currentServer = servers.find(s => s.id === activeServer);
      const channel = currentServer?.textChannels.find(c => c.id === activeChannel);
      return channel?.messages || [];
    } else {
      return dmMessages[activeChannel] || [];
    }
  };

  const getCurrentChannelName = (): string => {
    if (activeChannelType === 'text') {
      const currentServer = servers.find(s => s.id === activeServer);
      const channel = currentServer?.textChannels.find(c => c.id === activeChannel);
      return channel?.name || '';
    } else {
      return activeUser.name;
    }
  };

  return {
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
  };
};
