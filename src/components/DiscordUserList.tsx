import { Crown, Shield, Volume2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  activity?: string;
  role?: 'owner' | 'admin' | 'moderator' | 'member';
  inVoice?: string;
}

interface DiscordUserListProps {
  users: User[];
  className?: string;
}

const DiscordUserList = ({ users, className = "" }: DiscordUserListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'admin':
        return <Shield className="w-3 h-3 text-red-400" />;
      case 'moderator':
        return <Shield className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-400';
      case 'admin': return 'text-red-400';
      case 'moderator': return 'text-blue-400';
      default: return 'text-white';
    }
  };

  // Group by role hierarchy, then by online status
  const groupOrder = ['Owner', 'Admins', 'Moderators', 'Online', 'Offline'];
  
  const groupedUsers = users.reduce((acc, user) => {
    let key: string;
    if (user.role === 'owner') key = 'Owner';
    else if (user.role === 'admin') key = 'Admins';
    else if (user.role === 'moderator') key = 'Moderators';
    else if (user.status === 'online' || user.status === 'idle' || user.status === 'dnd') key = 'Online';
    else key = 'Offline';
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  // Sort groups by hierarchy
  const sortedGroups = groupOrder
    .filter(group => groupedUsers[group]?.length > 0)
    .map(group => [group, groupedUsers[group]] as [string, User[]]);

  return (
    <div className={`bg-gray-800 border-l border-gray-700 flex flex-col ${className}`}>
      <div className="p-4 flex-shrink-0">
        <h3 className="text-white font-semibold text-sm">
          Members — {users.length}
        </h3>
      </div>
      
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="px-2 pb-4 space-y-4">
            {sortedGroups.map(([groupName, groupUsers]) => (
              <div key={groupName}>
                <h4 className="text-gray-400 text-xs uppercase font-semibold mb-2 px-2 flex items-center">
                  {groupName} — {groupUsers.length}
                </h4>
                
                <div className="space-y-0.5">
                  {groupUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 px-2 py-1.5 rounded hover:bg-gray-700/50 cursor-pointer group">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <span className={`text-sm font-medium truncate ${getRoleColor(user.role)}`}>{user.name}</span>
                          {getRoleIcon(user.role)}
                        </div>
                        {user.activity && (
                          <div className="text-gray-400 text-xs truncate flex items-center gap-1">
                            {user.inVoice && <Volume2 className="w-3 h-3 text-green-500 flex-shrink-0" />}
                            <span className="truncate">{user.activity}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DiscordUserList;
