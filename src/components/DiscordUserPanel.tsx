
import { Settings, User, Bell, Crown } from "lucide-react";

const DiscordUserPanel = () => {
  return (
    <div className="h-full bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
      {/* User Profile */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            <img src="/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png" alt="Midjourney Bot" className="w-12 h-12 rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white font-bold text-lg truncate">Midjourney Bot</div>
            <div className="text-gray-400 text-sm truncate">Midjourney Bot#9282</div>
          </div>
        </div>
        
        <div className="bg-indigo-600 text-white px-3 py-1 rounded text-sm inline-block mb-3">
          APP
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-white font-semibold mb-1">About Me</h3>
            <p className="text-gray-400 text-sm">
              Generate an image based on a text prompt in under 60 seconds using the /imagine command!
            </p>
          </div>
          
          <div>
            <a href="#" className="text-indigo-400 hover:underline text-sm break-all">
              https://docs.midjourney.com/docs/terms-of-service
            </a>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-1">Created On</h3>
            <p className="text-gray-400 text-sm">Jan 29, 2022</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex-shrink-0">
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded mb-2 text-sm font-medium">
          Commands
        </button>
        <button className="w-full text-gray-400 hover:text-white py-2 text-sm">
          View Full Profile
        </button>
      </div>
    </div>
  );
};

export default DiscordUserPanel;
