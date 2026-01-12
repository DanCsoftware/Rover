import { useMemo } from "react";
import twemoji from "@twemoji/api";

interface EmojiProps {
  emoji: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Emoji = ({ emoji, size = "md", className = "" }: EmojiProps) => {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const parsedEmoji = useMemo(() => {
    const parsed = twemoji.parse(emoji, {
      folder: "svg",
      ext: ".svg",
      base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/"
    });
    
    // Extract the src from the parsed img tag
    const srcMatch = parsed.match(/src="([^"]+)"/);
    return srcMatch ? srcMatch[1] : null;
  }, [emoji]);

  if (!parsedEmoji) {
    // Fallback to native emoji with some styling
    return (
      <span 
        className={`inline-flex items-center justify-center ${sizeMap[size]} ${className}`}
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={parsedEmoji}
      alt={emoji}
      className={`inline-block ${sizeMap[size]} ${className}`}
      style={{ 
        verticalAlign: "middle",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
      }}
      draggable={false}
    />
  );
};

export default Emoji;
