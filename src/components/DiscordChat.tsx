import { useState, useMemo } from "react";
import { Send, Plus, Gift, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "@/data/discordData";
import { AIAssistant } from "./AIAssistant";
import DiscordChannelHeader from "./DiscordChannelHeader";
import DiscordUserList from "./DiscordUserList";

interface DiscordChatProps {
  channelName: string;
  messages: Message[];
  activeUser: any;
  channelType: 'text' | 'dm';
}

const DiscordChat = ({ channelName, messages, activeUser, channelType }: DiscordChatProps) => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showUserList, setShowUserList] = useState(true);

  // Extract users from messages and create user list with roles and status
  const channelUsers = useMemo(() => {
    const userMap = new Map();
    
    // Process all messages (both initial and new ones) to extract unique users
    const allMessages = [...messages, ...chatMessages.slice(messages.length)];
    
    allMessages.forEach((msg) => {
      if (!userMap.has(msg.user) && msg.user !== 'You') {
        let role: 'owner' | 'admin' | 'moderator' | 'member' = 'member';
        let status: 'online' | 'idle' | 'dnd' | 'offline' = 'online';
        let activity: string | undefined;

        // Assign roles based on user patterns
        if (msg.user.includes('Admin') || msg.user === 'ModeratorX') {
          role = 'admin';
        } else if (msg.user.includes('Moderator') || msg.user.includes('Mod')) {
          role = 'moderator';
        } else if (msg.user.includes('Guild') || msg.user.includes('Owner') || msg.user === 'GuildMaster') {
          role = 'owner';
        }

        // Assign activities based on user names/context
        if (msg.user.includes('Gamer') || msg.user.includes('Pro')) {
          activity = 'Playing games';
        } else if (msg.user.includes('DJ') || msg.user.includes('Music')) {
          activity = 'Listening to music';
        } else if (msg.user.includes('Artist') || msg.user.includes('Creative')) {
          activity = 'Creating art';
        } else if (msg.user.includes('Bot')) {
          activity = 'Bot activities';
          status = 'online';
        }

        // Add some variety to status - most users online, some idle/dnd
        const randomStatus = Math.random();
        if (randomStatus > 0.85) {
          status = 'idle';
        } else if (randomStatus > 0.95) {
          status = 'dnd';
        }

        userMap.set(msg.user, {
          id: msg.user.toLowerCase().replace(/\s+/g, '-'),
          name: msg.user,
          status,
          role,
          activity
        });
      }
    });

    // Add some additional users to make the list more realistic
    const additionalUsers = [
      { id: 'user1', name: 'ProGamer99', status: 'online' as const, role: 'member' as const, activity: 'Playing Valorant' },
      { id: 'user2', name: 'GamerGirl2024', status: 'online' as const, role: 'member' as const, activity: 'Streaming' },
      { id: 'user3', name: 'TacticalGenius', status: 'idle' as const, role: 'member' as const },
      { id: 'user4', name: 'BuildMaster', status: 'online' as const, role: 'member' as const, activity: 'Building' },
    ];

    additionalUsers.forEach(user => {
      if (!userMap.has(user.name)) {
        userMap.set(user.name, user);
      }
    });

    return Array.from(userMap.values());
  }, [messages, chatMessages]);

  const getMessageAvatar = (msgUser: string, isBot?: boolean) => {
    if (msgUser === 'Midjourney Bot' || isBot) {
      return <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Bot" className="w-6 h-6 rounded-full" />;
    }
    return <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
      {msgUser.charAt(0)}
    </div>;
  };

  const renderMessageContent = (msg: Message) => {
    let content = msg.content;
    
    // Handle links in content
    if (msg.hasLinks && msg.links) {
      msg.links.forEach(link => {
        content = content.replace(link, `<a href="${link}" class="text-blue-400 hover:underline" target="_blank">${link}</a>`);
      });
    }
    
    return (
      <div 
        className={`text-gray-300 text-sm leading-relaxed ${msg.isWelcome ? 'text-lg font-medium text-white' : ''}`}
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
      />
    );
  };

  const renderReactions = (reactions?: { emoji: string; count: number }[]) => {
    if (!reactions || reactions.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {reactions.map((reaction, index) => (
          <div key={index} className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded px-2 py-1 flex items-center space-x-1">
            <span className="text-sm">{reaction.emoji}</span>
            <span className="text-xs text-gray-400">{reaction.count}</span>
          </div>
        ))}
      </div>
    );
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      user: 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: message,
      isBot: false
    };

    setChatMessages(prev => [...prev, newMessage]);

    // Check if message mentions @rover
    if (message.toLowerCase().includes('@rover')) {
      setShowAIAssistant(true);
      // Process AI request after a short delay
      setTimeout(() => {
        handleAIResponse(message);
      }, 500);
    }

    setMessage("");
  };

  const handleAIResponse = (userMessage: string) => {
    // Simulate AI processing
    setTimeout(() => {
      const cleanMessage = userMessage.replace('@rover', '').trim().toLowerCase();
      let response = "I'm ROVER, your AI assistant! I'm here to help you with various tasks.";
      
      if (cleanMessage.includes('help')) {
        response = "Here are some things I can help you with:\n• Answer questions\n• Provide information\n• Assist with creative tasks\n• And much more!";
      } else if (cleanMessage.includes('hello') || cleanMessage.includes('hi')) {
        response = "Hello there! How can I assist you today?";
      } else if (cleanMessage.includes('what') || cleanMessage.includes('how')) {
        response = "That's a great question! Let me help you with that. Feel free to be more specific about what you'd like to know.";
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        user: 'ROVER',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: response,
        isBot: true
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setShowAIAssistant(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-gray-700">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat Header */}
        <DiscordChannelHeader 
          channelName={channelName}
          channelType={channelType}
          onToggleUserList={() => setShowUserList(!showUserList)}
          showUserList={showUserList}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Profile Section - only show for DMs */}
            {channelType === 'dm' && (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center mb-4">
                  {activeUser.avatar ? (
                    <img src={activeUser.avatar} alt={activeUser.name} className="w-16 h-16 rounded-full" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {activeUser.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h2 className="text-white text-2xl font-bold">{activeUser.name}</h2>
                <p className="text-gray-400">{activeUser.username}</p>
                <p className="text-gray-400 mt-2">This is the beginning of your direct message history with {activeUser.name}.</p>
                <div className="flex space-x-2 mt-4">
                  <Button variant="destructive" size="sm">Mute</Button>
                  <Button variant="secondary" size="sm">View Profile</Button>
                  <Button variant="secondary" size="sm">Report</Button>
                </div>
                <div className="text-gray-500 text-sm mt-4">September 14, 2024</div>
              </div>
            )}

            {/* Channel Header - only show for text channels */}
            {channelType === 'text' && (
              <div className="flex flex-col items-start py-8">
                <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-2xl">#</span>
                </div>
                <h2 className="text-white text-2xl font-bold">Welcome to #{channelName}!</h2>
                <p className="text-gray-400 mt-2">This is the start of the #{channelName} channel.</p>
                <div className="text-gray-500 text-sm mt-4">September 14, 2024</div>
              </div>
            )}

            {/* Messages */}
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  {msg.user === 'ROVER' ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                  ) : msg.user === 'Midjourney Bot' || msg.isBot ? (
                    <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Bot" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {msg.user.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium">{msg.user}</span>
                    {msg.user === 'ROVER' && (
                      <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-1.5 py-0.5 rounded">AI</span>
                    )}
                    {msg.isBot && msg.user !== 'ROVER' && (
                      <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded">BOT</span>
                    )}
                    {msg.time && <span className="text-gray-500 text-xs">{msg.time}</span>}
                  </div>
                  
                  {renderMessageContent(msg)}
                  
                  {msg.hasButton && (
                    <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white" size="sm">
                      {msg.buttonText}
                    </Button>
                  )}
                  
                  {msg.hasButtons && (
                    <div className="flex space-x-2 mt-2">
                      {msg.buttons?.map((button, index) => (
                        <Button 
                          key={index} 
                          className={index === 0 ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-500"} 
                          size="sm"
                        >
                          {button}
                        </Button>
                      ))}
                    </div>
                  )}

                  {msg.hasInvite && (
                    <div className="mt-3 bg-gray-800 rounded-lg p-4 max-w-md">
                      <div className="text-white text-sm mb-2">You've Been Invited To Join A Server</div>
                      <div className="flex items-center space-x-3">
                        <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Server" className="w-12 h-12 rounded-lg" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Midjourney ✅</div>
                          <div className="text-gray-400 text-sm">🟢 858,103 Online ⚫ 20,943,714 Members</div>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                          Join
                        </Button>
                      </div>
                    </div>
                  )}

                  {renderReactions(msg.hasReactions ? msg.reactions : undefined)}
                </div>
              </div>
            ))}

            {/* AI Assistant Processing */}
            {showAIAssistant && (
              <AIAssistant 
                message={message} 
                onResponse={(response) => {
                  const aiMessage: Message = {
                    id: Date.now(),
                    user: 'ROVER',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    content: response,
                    isBot: true
                  };
                  setChatMessages(prev => [...prev, aiMessage]);
                  setShowAIAssistant(false);
                }} 
              />
            )}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 flex-shrink-0">
          <div className="bg-gray-600 rounded-lg flex items-center px-4 py-3">
            <button className="mr-3 p-1 hover:bg-gray-500 rounded">
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${channelType === 'text' ? '#' + channelName : '@' + channelName} (try @rover)`}
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            />
            <div className="flex items-center space-x-2 ml-3">
              <button className="p-1 hover:bg-gray-500 rounded">
                <Gift className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-1 hover:bg-gray-500 rounded">
                <Smile className="w-5 h-5 text-gray-400" />
              </button>
              <button 
                onClick={handleSendMessage}
                className="p-1 hover:bg-gray-500 rounded"
              >
                <Send className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Hint for @rover */}
          {message.toLowerCase().includes('@rover') && (
            <div className="mt-2 text-xs text-gray-400 flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span>ROVER AI will respond to your message</span>
            </div>
          )}
        </div>
      </div>

      {/* User List - only show for text channels when showUserList is true */}
      {channelType === 'text' && showUserList && (
        <DiscordUserList users={channelUsers} className="w-60 flex-shrink-0" />
      )}
    </div>
  );
};

export default DiscordChat;
