
import { useState } from "react";
import { Send, Plus, Gift, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

const DiscordChat = () => {
  const [message, setMessage] = useState("");

  const messages = [
    {
      id: 1,
      user: "Midjourney Bot",
      time: "2:13 AM",
      content: "Heya! Welcome to Midjourney. I'm here to help you get started.",
      isBot: true
    },
    {
      id: 2,
      user: "Midjourney Bot",
      time: "",
      content: "First, you'll need to accept our terms of service. You can review them at https://docs.midjourney.com/docs/terms-of-service",
      isBot: true,
      hasButton: true,
      buttonText: "Accept TOS"
    },
    {
      id: 3,
      user: "Midjourney Bot",
      time: "",
      content: "Let's explore the basics of Midjourney",
      isBot: true,
      hasButtons: true,
      buttons: ["Start Tutorial", "Skip"]
    },
    {
      id: 4,
      user: "Midjourney Bot",
      time: "",
      content: "Visit the Midjourney server to be inspired by what others are creating, get support, or learn more about creation.",
      isBot: true,
      hasInvite: true
    },
    {
      id: 5,
      user: "Midjourney Bot",
      time: "",
      content: "We hope you enjoy Midjourney! You can always learn more by visiting https://docs.midjourney.com/ or get answers to your questions by using /ask",
      isBot: true
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-700">
      {/* Chat Header */}
      <div className="h-12 border-b border-gray-600 flex items-center px-4">
        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center mr-3">
          <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Midjourney" className="w-4 h-4 rounded-full" />
        </div>
        <span className="text-white font-semibold">Midjourney Bot</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center mb-4">
            <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Midjourney Bot" className="w-16 h-16 rounded-full" />
          </div>
          <h2 className="text-white text-2xl font-bold">Midjourney Bot</h2>
          <p className="text-gray-400">Midjourney Bot#9282</p>
          <p className="text-gray-400 mt-2">This is the beginning of your direct message history with Midjourney Bot.</p>
          <div className="flex space-x-2 mt-4">
            <Button variant="destructive" size="sm">Mute</Button>
            <Button variant="secondary" size="sm">Manage App</Button>
            <Button variant="secondary" size="sm">Report</Button>
          </div>
          <div className="text-gray-500 text-sm mt-4">September 14, 2024</div>
        </div>

        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
              <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Bot" className="w-6 h-6 rounded-full" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-white font-medium">{msg.user}</span>
                <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded">APP</span>
                {msg.time && <span className="text-gray-500 text-xs">{msg.time}</span>}
              </div>
              <div className="text-gray-300 text-sm leading-relaxed">{msg.content}</div>
              
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
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4">
        <div className="bg-gray-600 rounded-lg flex items-center px-4 py-3">
          <button className="mr-3 p-1 hover:bg-gray-500 rounded">
            <Plus className="w-5 h-5 text-gray-400" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message @Midjourney Bot"
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
          />
          <div className="flex items-center space-x-2 ml-3">
            <button className="p-1 hover:bg-gray-500 rounded">
              <Gift className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-500 rounded">
              <Smile className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordChat;
