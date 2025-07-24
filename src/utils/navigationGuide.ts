export interface NavigationStep {
  step: number;
  description: string;
  icon?: string;
  element?: string;
  location?: string;
}

export interface NavigationGuide {
  title: string;
  description: string;
  methods: NavigationMethod[];
  relatedFeatures?: string[];
  proTips?: string[];
}

export interface NavigationMethod {
  name: string;
  recommended?: boolean;
  steps: NavigationStep[];
}

export const navigationDatabase: Record<string, NavigationGuide> = {
  "notification": {
    title: "Notification Settings",
    description: "Control how and when Discord notifies you",
    methods: [
      {
        name: "User Settings (Recommended)",
        recommended: true,
        steps: [
          {
            step: 1,
            description: "Click the **Settings** gear icon",
            icon: "🔧",
            element: "gear icon",
            location: "bottom left of your screen"
          },
          {
            step: 2,
            description: "Look for **Notifications** in the left sidebar",
            icon: "🔔",
            element: "Notifications tab",
            location: "left sidebar"
          },
          {
            step: 3,
            description: "Customize your notification preferences",
            icon: "⚙️",
            element: "notification settings",
            location: "main panel"
          }
        ]
      },
      {
        name: "Right-click Method",
        steps: [
          {
            step: 1,
            description: "Right-click your username",
            element: "username",
            location: "bottom left"
          },
          {
            step: 2,
            description: "Select \"User Settings\"",
            element: "User Settings option"
          },
          {
            step: 3,
            description: "Navigate to \"Notifications\"",
            element: "Notifications tab"
          }
        ]
      }
    ],
    relatedFeatures: ["Privacy Settings", "Server Notifications", "Sound Settings"],
    proTips: [
      "You can also right-click any server icon to access server-specific notification settings!",
      "Use @everyone mentions sparingly to respect others' notification preferences"
    ]
  },
  "privacy": {
    title: "Privacy & Safety Settings",
    description: "Control who can contact you and see your information",
    methods: [
      {
        name: "User Settings",
        recommended: true,
        steps: [
          {
            step: 1,
            description: "Click the **Settings** gear icon",
            icon: "🔧",
            element: "gear icon",
            location: "bottom left"
          },
          {
            step: 2,
            description: "Select **Privacy & Safety**",
            icon: "🛡️",
            element: "Privacy & Safety tab",
            location: "left sidebar"
          },
          {
            step: 3,
            description: "Adjust your privacy preferences",
            icon: "⚙️",
            element: "privacy settings",
            location: "main panel"
          }
        ]
      }
    ],
    relatedFeatures: ["Blocked Users", "Friend Requests", "Message Filtering"],
    proTips: [
      "Enable \"Keep me safe\" for automatic message filtering",
      "Review your privacy settings regularly"
    ]
  },
  "server": {
    title: "Server Settings",
    description: "Manage server configuration and permissions",
    methods: [
      {
        name: "Server Dropdown",
        recommended: true,
        steps: [
          {
            step: 1,
            description: "Right-click the server name/icon",
            icon: "🏠",
            element: "server icon",
            location: "left sidebar or top of channel list"
          },
          {
            step: 2,
            description: "Select **Server Settings**",
            icon: "⚙️",
            element: "Server Settings option"
          },
          {
            step: 3,
            description: "Navigate through the settings categories",
            element: "settings tabs",
            location: "left sidebar"
          }
        ]
      }
    ],
    relatedFeatures: ["Roles & Permissions", "Channels", "Moderation"],
    proTips: [
      "You need \"Manage Server\" permission to access server settings",
      "Changes to server settings affect all members"
    ]
  },
  "profile": {
    title: "User Profile",
    description: "Edit your profile information and status",
    methods: [
      {
        name: "User Panel",
        recommended: true,
        steps: [
          {
            step: 1,
            description: "Click on your avatar/username",
            icon: "👤",
            element: "your avatar",
            location: "bottom left corner"
          },
          {
            step: 2,
            description: "Select **Edit Profile** or **Set Status**",
            element: "profile options"
          }
        ]
      }
    ],
    relatedFeatures: ["Custom Status", "Avatar", "About Me"],
    proTips: [
      "You can set a custom status with an emoji and message",
      "Profile changes are visible to all servers you're in"
    ]
  },
  "friends": {
    title: "Friends & Direct Messages",
    description: "Manage your friends list and DMs",
    methods: [
      {
        name: "Direct Access",
        recommended: true,
        steps: [
          {
            step: 1,
            description: "Click the **Discord logo** or **Home** button",
            icon: "🏠",
            element: "Discord logo",
            location: "top left"
          },
          {
            step: 2,
            description: "Select **Friends** tab",
            icon: "👥",
            element: "Friends tab",
            location: "top navigation"
          }
        ]
      }
    ],
    relatedFeatures: ["Add Friend", "Pending Requests", "Blocked Users"],
    proTips: [
      "You can add friends by username#discriminator or phone number",
      "Use the search bar to quickly find friends"
    ]
  }
};

export class NavigationGuide {
  static findGuide(query: string): NavigationGuide | null {
    const normalizedQuery = query.toLowerCase();
    
    // Map common terms to navigation keys
    const termMappings: Record<string, string> = {
      "notification": "notification",
      "notifications": "notification",
      "privacy": "privacy",
      "safety": "privacy",
      "server": "server",
      "guild": "server",
      "profile": "profile",
      "user": "profile",
      "friends": "friends",
      "friend": "friends",
      "dm": "friends",
      "direct message": "friends",
      "settings": "notification" // Default to notifications for generic "settings"
    };
    
    // Find matching navigation guide
    for (const [term, key] of Object.entries(termMappings)) {
      if (normalizedQuery.includes(term)) {
        return navigationDatabase[key] || null;
      }
    }
    
    return null;
  }
  
  static formatNavigationResponse(guide: NavigationGuide, originalQuery: string): string {
    let response = `🧭 **ROVER Navigation Guide** 🧭\n\n`;
    response += `**Finding: ${guide.title}**\n`;
    response += `*${guide.description}*\n\n`;
    
    // Add methods
    guide.methods.forEach((method, index) => {
      const methodIcon = method.recommended ? "📍 **Method 1: " : `📍 **Method ${index + 1}: `;
      const recommendedText = method.recommended ? " (Recommended)" : "";
      response += `${methodIcon}${method.name}${recommendedText}**\n`;
      
      method.steps.forEach(step => {
        const icon = step.icon || "•";
        const location = step.location ? ` (${step.location})` : "";
        response += `${step.step}. ${icon} ${step.description}${location}\n`;
      });
      
      response += "\n";
    });
    
    // Add what they'll find there
    response += `🎯 **What you'll find there:**\n`;
    if (guide.relatedFeatures) {
      guide.relatedFeatures.forEach(feature => {
        response += `• ${feature}\n`;
      });
    }
    response += "\n";
    
    // Add pro tips
    if (guide.proTips && guide.proTips.length > 0) {
      guide.proTips.forEach(tip => {
        response += `💡 **Pro Tip**: ${tip}\n`;
      });
      response += "\n";
    }
    
    response += `❓ **Still can't find it?** Reply with "still stuck" and I'll provide more help!`;
    
    return response;
  }
  
  static isNavigationQuery(query: string): boolean {
    const navigationPatterns = [
      /help me (navigate|find|get to|access)/i,
      /where (is|are|can I find)/i,
      /how do I (get to|access|find)/i,
      /navigate to/i,
      /show me (how to|where)/i,
      /take me to/i,
      /(find|locate) (my|the)/i
    ];
    
    return navigationPatterns.some(pattern => pattern.test(query));
  }
}