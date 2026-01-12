import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface RoverAvatarProps {
  size?: "sm" | "md" | "lg";
  isThinking?: boolean;
  showVerified?: boolean;
  className?: string;
}

const RoverAvatar = ({ 
  size = "md", 
  isThinking = false, 
  showVerified = true,
  className 
}: RoverAvatarProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const iconScale = {
    sm: 0.6,
    md: 1,
    lg: 1.2
  };

  return (
    <div className={cn("relative", className)}>
      {/* Main Avatar */}
      <div 
        className={cn(
          sizeClasses[size],
          "rounded-full bg-gradient-to-br from-[#5865F2] via-[#7289DA] to-[#9B59B6]",
          "flex items-center justify-center shadow-lg",
          "border-2 border-[#5865F2]/30",
          isThinking && "animate-rover-pulse"
        )}
      >
        {/* Custom ROVER Bot Icon - Discord Clyde-inspired */}
        <svg 
          viewBox="0 0 24 24" 
          className="text-white"
          style={{ 
            width: `${16 * iconScale[size]}px`, 
            height: `${16 * iconScale[size]}px` 
          }}
          fill="currentColor"
        >
          {/* Bot Face */}
          <path d="M12 2C9.5 2 7.5 4 7.5 6.5V7H6.5C5.67 7 5 7.67 5 8.5V9.5C5 10.33 5.67 11 6.5 11H7.5V12C7.5 15.04 9.96 17.5 13 17.5H13.5V19H10.5V21H13.5H14.5H17.5V19H14.5V17.5H15C16.38 17.5 17.5 16.38 17.5 15V11H18.5C19.33 11 20 10.33 20 9.5V8.5C20 7.67 19.33 7 18.5 7H17.5V6.5C17.5 4 15.5 2 13 2H12Z" />
          {/* Left Eye */}
          <circle cx="10" cy="10" r="1.5" fill="#1a1a2e" />
          {/* Right Eye */}
          <circle cx="15" cy="10" r="1.5" fill="#1a1a2e" />
          {/* Antenna */}
          <circle cx="12.5" cy="3.5" r="1" fill="currentColor" />
          <line x1="12.5" y1="4.5" x2="12.5" y2="6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Verified Badge */}
      {showVerified && (
        <div 
          className={cn(
            "absolute -bottom-0.5 -right-0.5 bg-[#5865F2] rounded-full",
            "flex items-center justify-center border-2 border-[#36393f]",
            size === "sm" ? "w-3 h-3" : "w-4 h-4"
          )}
        >
          <Check 
            className="text-white" 
            style={{ 
              width: size === "sm" ? 6 : 10, 
              height: size === "sm" ? 6 : 10 
            }} 
            strokeWidth={3}
          />
        </div>
      )}

      {/* Thinking Ring Animation */}
      {isThinking && (
        <div 
          className={cn(
            "absolute inset-0 rounded-full border-2 border-[#5865F2]",
            "animate-ping opacity-75"
          )}
        />
      )}
    </div>
  );
};

export default RoverAvatar;
