
import { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface AIAssistantProps {
  message: string;
  onResponse: (response: string) => void;
}

export const AIAssistant = ({ message, onResponse }: AIAssistantProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processAIRequest = async (userMessage: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple response generation based on the message
    const cleanMessage = userMessage.replace('@rover', '').trim().toLowerCase();
    let response = "I'm ROVER, your AI assistant! I'm here to help you with various tasks.";
    
    if (cleanMessage.includes('help')) {
      response = "Here are some things I can help you with:\n• Answer questions\n• Provide information\n• Assist with creative tasks\n• And much more!";
    } else if (cleanMessage.includes('hello') || cleanMessage.includes('hi')) {
      response = "Hello there! How can I assist you today?";
    } else if (cleanMessage.includes('what') || cleanMessage.includes('how')) {
      response = "That's a great question! Let me help you with that. Feel free to be more specific about what you'd like to know.";
    }
    
    setIsProcessing(false);
    onResponse(response);
  };

  return (
    <div className="flex items-start space-x-3 opacity-80">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        {isProcessing ? (
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-white font-medium">ROVER</span>
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-1.5 py-0.5 rounded">AI</span>
          <span className="text-gray-500 text-xs">now</span>
        </div>
        
        {isProcessing ? (
          <div className="text-gray-400 text-sm italic">
            ROVER is thinking...
          </div>
        ) : (
          <div className="text-gray-300 text-sm">
            Processing your request...
          </div>
        )}
      </div>
    </div>
  );
};
