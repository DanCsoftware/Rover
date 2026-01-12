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

  return (
    <div className={cn("relative", className)}>
      {/* Main Avatar */}
      <div 
        className={cn(
          sizeClasses[size],
          "rounded-lg overflow-hidden",
          isThinking && "animate-rover-pulse"
        )}
      >
        <img 
          src="/lovable-uploads/8946501d-dd9e-4358-be97-8ba3df21de53.png"
          alt="ROVER"
          className="w-full h-full object-cover"
        />
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
