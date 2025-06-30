
import { useState } from 'react';
import { channels, dmUsers, dmMessages, Channel, User, Message } from '@/data/discordData';

export const useDiscordState = () => {
  const [activeChannel, setActiveChannel] = useState<string>('official-links');
  const [activeChannelType, setActiveChannelType] = useState<'text' | 'dm'>('text');
  const [isDMView, setIsDMView] = useState<boolean>(false);
  const [activeServer, setActiveServer] = useState<number>(4); // Default to Midjourney server
  const [activeUser, setActiveUser] = useState<User>({
    id: 'server',
    name: 'Midjourney Official',
    username: '',
    avatar: '/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png',
    aboutMe: 'Official Midjourney Discord Server',
    createdOn: 'Jan 29, 2022'
  });

  const switchToChannel = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
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

  const switchToServer = (serverId: number) => {
    console.log('Switching to server:', serverId);
    setActiveServer(serverId);
    setIsDMView(false);
    setActiveChannelType('text');
    // Switch to first available text channel
    const firstChannel = channels[0];
    if (firstChannel) {
      setActiveChannel(firstChannel.id);
      setActiveUser({
        id: 'server',
        name: getServerName(serverId),
        username: '',
        avatar: getServerAvatar(serverId),
        aboutMe: `Official ${getServerName(serverId)} Discord Server`,
        createdOn: 'Jan 29, 2022'
      });
    }
  };

  const getServerName = (serverId: number): string => {
    const serverNames: { [key: number]: string } = {
      2: 'Server 1',
      3: 'Server 2',
      4: 'Midjourney Official'
    };
    return serverNames[serverId] || 'Midjourney Official';
  };

  const getServerAvatar = (serverId: number): string => {
    const serverAvatars: { [key: number]: string } = {
      2: '🔥',
      3: '🎵',
      4: '/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png'
    };
    return serverAvatars[serverId] || '/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png';
  };

  const getCurrentMessages = (): Message[] => {
    if (activeChannelType === 'text') {
      const channel = channels.find(c => c.id === activeChannel);
      return channel?.messages || [];
    } else {
      return dmMessages[activeChannel] || [];
    }
  };

  const getCurrentChannelName = (): string => {
    if (activeChannelType === 'text') {
      const channel = channels.find(c => c.id === activeChannel);
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
    activeServer,
    switchToChannel,
    switchToDM,
    switchToDMView,
    switchToServer,
    getCurrentMessages,
    getCurrentChannelName
  };
};
