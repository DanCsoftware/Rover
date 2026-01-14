import { useState, useEffect } from "react";
import { Compass, Search, FileText, Shield, Gamepad2, CheckCircle, Sparkles, AlertTriangle } from "lucide-react";
import RoverAvatar from "./RoverAvatar";
import { cn } from "@/lib/utils";

const roverHints = [
  { 
    category: "Navigation", 
    icon: Compass, 
    color: "#5865F2", 
    text: '"help me navigate to privacy settings"' 
  },
  { 
    category: "Search", 
    icon: Search, 
    color: "#57F287", 
    text: '"search for messages about crypto"' 
  },
  { 
    category: "Summarize", 
    icon: FileText, 
    color: "#FEE75C", 
    text: '"summarize the last 30 minutes"' 
  },
  { 
    category: "Link Safety", 
    icon: Shield, 
    color: "#EB459E", 
    text: '"check if this link is safe"' 
  },
  { 
    category: "Gaming", 
    icon: Gamepad2, 
    color: "#9B59B6", 
    text: '"find gaming servers near me"' 
  },
  { 
    category: "Fact Check", 
    icon: CheckCircle, 
    color: "#3498DB", 
    text: '"fact check this claim"' 
  },
  { 
    category: "Discovery", 
    icon: Sparkles, 
    color: "#F1C40F", 
    text: '"recommend servers about art"' 
  },
  { 
    category: "Moderation", 
    icon: AlertTriangle, 
    color: "#ED4245", 
    text: '"show server health report"' 
  },
];

const RoverHintCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % roverHints.length);
        setIsTransitioning(false);
      }, 150);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const currentHint = roverHints[currentIndex];
  const Icon = currentHint.icon;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#2b2d31]/50 border-t border-[#3f4147]/50">
      <RoverAvatar size="sm" showVerified={false} />
      
      <div 
        className={cn(
          "flex items-center gap-2 transition-opacity duration-150",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}
      >
        <div 
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: `${currentHint.color}20`,
            color: currentHint.color 
          }}
        >
          <Icon size={12} />
          <span>{currentHint.category}</span>
        </div>
        
        <span className="text-[#b5bac1] text-xs">
          try: <span className="text-[#dbdee1] italic">{currentHint.text}</span>
        </span>
      </div>

      {/* Dot indicators */}
      <div className="flex gap-1 ml-auto">
        {roverHints.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(idx);
                setIsTransitioning(false);
              }, 150);
            }}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-200",
              idx === currentIndex 
                ? "bg-[#5865F2] w-3" 
                : "bg-[#4e5058] hover:bg-[#6d6f78]"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default RoverHintCarousel;
