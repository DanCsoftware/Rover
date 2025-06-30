export interface Message {
  id: number;
  user: string;
  time: string;
  content: string;
  isBot?: boolean;
  hasButton?: boolean;
  buttonText?: string;
  hasButtons?: boolean;
  buttons?: string[];
  hasInvite?: boolean;
  hasLinks?: boolean;
  links?: string[];
  isWelcome?: boolean;
  hasReactions?: boolean;
  reactions?: { emoji: string; count: number }[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'dm';
  messages: Message[];
  description?: string;
  serverId?: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  aboutMe: string;
  createdOn: string;
  status?: string;
  members?: string;
}

export interface VoiceChannel {
  name: string;
  users: number;
  userList?: string[];
}

export interface Server {
  id: number;
  name: string;
  icon: string;
  textChannels: Channel[];
  voiceChannels: VoiceChannel[];
}

const MALICIOUS_DOMAINS = [
  'bit.ly/malware',
  'suspicious-discord.com',
  'fake-steam.com',
  'phishing-site.net',
  'malware-download.org'
];

const SUSPICIOUS_PATTERNS = [
  /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP addresses
  /[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+\.(tk|ml|ga|cf)/, // Suspicious TLDs
  /discord[0-9a-z-]*\.(com|org|net)/, // Discord impersonation
  /steam[0-9a-z-]*\.(com|org|net)/, // Steam impersonation
];

const SAFE_DOMAINS = [
  'discord.com',
  'discord.gg',
  'github.com',
  'youtube.com',
  'twitter.com',
  'reddit.com',
  'stackoverflow.com',
  'google.com',
  'microsoft.com',
  'steam.com'
];

// Server 2 - Gaming Server
const gamingChannels: Channel[] = [
  {
    id: 'game-announcements',
    name: '📢-announcements',
    type: 'text',
    serverId: 2,
    description: 'Gaming announcements and updates',
    messages: [
      {
        id: 1,
        user: 'GameBot',
        time: '9:00 AM',
        content: 'Welcome to Gaming Hub! 🎮\n\nThis is where gamers unite to play, compete, and have fun together!',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'GuildMaster',
        time: '10:30 AM',
        content: '🏆 **WEEKLY TOURNAMENT ANNOUNCED!**\n\nJoin our Valorant tournament this Friday at 8 PM EST!\n\nPrizes:\n🥇 $100 Steam Gift Card\n🥈 $50 Steam Gift Card\n🥉 $25 Steam Gift Card\n\nRegister by reacting with ⚔️!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '⚔️', count: 147 }, { emoji: '🔥', count: 89 }, { emoji: '💰', count: 76 }]
      },
      {
        id: 3,
        user: 'ModeratorX',
        time: '2:15 PM',
        content: '🎯 New game night schedule:\n\n**Monday**: Valorant Ranked\n**Wednesday**: Among Us\n**Friday**: Tournament Night\n**Saturday**: Variety Games\n\nSee you in the voice channels!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎮', count: 234 }, { emoji: '📅', count: 67 }]
      }
    ]
  },
  {
    id: 'general-gaming',
    name: 'general-gaming',
    type: 'text',
    serverId: 2,
    description: 'General gaming discussion',
    messages: [
      {
        id: 1,
        user: 'ProGamer99',
        time: '2:15 PM',
        content: 'Just hit Diamond in Valorant! 💎 Anyone want to duo queue?',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💎', count: 12 }, { emoji: '🔥', count: 8 }]
      },
      {
        id: 2,
        user: 'GamerGirl2024',
        time: '2:18 PM',
        content: 'Congrats! I\'m still stuck in Gold 😅 Need to work on my aim',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😅', count: 5 }]
      },
      {
        id: 3,
        user: 'AimBot_Not',
        time: '2:20 PM',
        content: '@GamerGirl2024 Let\'s practice in the aim trainer together! I\'ll be in the Gaming Lounge VC',
        isBot: false
      },
      {
        id: 4,
        user: 'RageQuit',
        time: '2:25 PM',
        content: 'Who\'s playing the new Call of Duty? The campaign is insane! 🎯',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎯', count: 15 }, { emoji: '💥', count: 9 }]
      }
    ]
  },
  {
    id: 'valorant-lfg',
    name: '🎯-valorant-lfg',
    type: 'text',
    serverId: 2,
    description: 'Looking for group - Valorant',
    messages: [
      {
        id: 1,
        user: 'ValorantBot',
        time: '1:00 PM',
        content: 'Welcome to Valorant LFG! 🎯\n\nFind teammates for ranked, unrated, or custom games here!',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'IronToRadiant',
        time: '3:45 PM',
        content: 'LF2M for ranked queue - currently Gold 2, looking for similar rank players. Must have mic! 🎤',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎤', count: 3 }, { emoji: '⚔️', count: 7 }]
      },
      {
        id: 3,
        user: 'SageMain',
        time: '3:50 PM',
        content: 'Sage main here! Gold 3, can play support. Add me: SageMain#VAL',
        isBot: false
      }
    ]
  },
  {
    id: 'minecraft-builds',
    name: '🏗️-minecraft-builds',
    type: 'text',
    serverId: 2,
    description: 'Show off your Minecraft creations',
    messages: [
      {
        id: 1,
        user: 'BuildMaster',
        time: '11:30 AM',
        content: 'Just finished my medieval castle! 🏰 Took me 3 weeks but totally worth it. Check it out on our server!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🏰', count: 45 }, { emoji: '🔥', count: 23 }, { emoji: '😍', count: 31 }]
      },
      {
        id: 2,
        user: 'RedstoneWiz',
        time: '12:15 PM',
        content: 'Working on an automatic farm design. Anyone know how to optimize hopper timing?',
        isBot: false
      }
    ]
  }
];

// Server 3 - Music Server
const musicChannels: Channel[] = [
  {
    id: 'music-announcements',
    name: '🎵-announcements',
    type: 'text',
    serverId: 3,
    description: 'Music community announcements',
    messages: [
      {
        id: 1,
        user: 'MusicBot',
        time: '7:00 AM',
        content: 'Welcome to Music Lovers! 🎵\n\nShare your passion for music, discover new artists, and vibe together!',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'DJ_Phoenix',
        time: '11:45 AM',
        content: '🎧 **LIVE DJ SET TONIGHT!**\n\nJoin me at 9 PM EST for a 3-hour progressive house journey!\n\n🎶 Featured artists: Deadmau5, Eric Prydz, Anjunabeats\n🔊 Broadcasting live in the DJ Booth!\n\nSee you on the dance floor! 💃🕺',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎧', count: 156 }, { emoji: '🔥', count: 89 }, { emoji: '💃', count: 234 }]
      },
      {
        id: 3,
        user: 'VinylCollector',
        time: '3:30 PM',
        content: '📀 **VINYL SWAP MEET THIS WEEKEND!**\n\nBring your rare finds and let\'s trade! Looking for:\n• Pink Floyd - Animals (1977 pressing)\n• Daft Punk - Random Access Memories\n• Any Blue Note jazz records\n\nDM me your collection lists! 🎼',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📀', count: 67 }, { emoji: '🎼', count: 45 }]
      }
    ]
  },
  {
    id: 'song-recommendations',
    name: '🎼-song-recommendations',
    type: 'text',
    serverId: 3,
    description: 'Share and discover new music',
    messages: [
      {
        id: 1,
        user: 'MelodyHunter',
        time: '1:30 PM',
        content: 'Just discovered this amazing indie band! 🌟\n\n**"Midnight Dreams" by Aurora Waves**\n\nAbsolutely ethereal vocals with dreamy synths. Perfect for late night listening! 🌙✨',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌟', count: 23 }, { emoji: '🌙', count: 15 }, { emoji: '❤️', count: 31 }]
      },
      {
        id: 2,
        user: 'ClassicRockFan',
        time: '1:35 PM',
        content: 'Classic recommendation: **Pink Floyd - "Comfortably Numb"** 🎸\n\nDavid Gilmour\'s guitar solo still gives me chills after 40+ years. Pure perfection! 🔥',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎸', count: 78 }, { emoji: '🔥', count: 45 }, { emoji: '🤘', count: 89 }]
      },
      {
        id: 3,
        user: 'ElectroVibes',
        time: '2:10 PM',
        content: 'For all the electronic music lovers:\n\n**Flume - "Never Be Like You"** 🎛️\n\nThe production on this track is insane. Those vocal chops! 🎵',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎛️', count: 34 }, { emoji: '🎵', count: 56 }]
      }
    ]
  },
  {
    id: 'music-production',
    name: '🎛️-music-production',
    type: 'text',
    serverId: 3,
    description: 'Music production tips and tricks',
    messages: [
      {
        id: 1,
        user: 'BeatMaker3000',
        time: '10:15 AM',
        content: 'Working on a new trap beat! 🥁 Any tips for getting that hard-hitting 808 sound? Currently using FL Studio.',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🥁', count: 12 }]
      },
      {
        id: 2,
        user: 'StudioMaster',
        time: '10:30 AM',
        content: '@BeatMaker3000 Try layering your 808s with a sine wave and add some saturation! Also, side-chain compress against your kick for that pumping effect 🔊',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🔊', count: 18 }, { emoji: '🙏', count: 8 }]
      },
      {
        id: 3,
        user: 'SynthWave',
        time: '11:45 AM',
        content: 'Just finished mixing my synthwave track! The 80s vibes are strong with this one 🌆✨\n\nTip: Use analog emulation plugins for that authentic vintage sound!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌆', count: 25 }, { emoji: '✨', count: 19 }]
      }
    ]
  },
  {
    id: 'listening-party',
    name: '🎶-listening-party',
    type: 'text',
    serverId: 3,
    description: 'Synchronized music listening sessions',
    messages: [
      {
        id: 1,
        user: 'PartyHost',
        time: '4:00 PM',
        content: '🎶 **LISTENING PARTY STARTING NOW!**\n\nTonight\'s album: **The Dark Side of the Moon - Pink Floyd**\n\nJoin the "Music Listening" voice channel and let\'s experience this masterpiece together! 🌙',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎶', count: 67 }, { emoji: '🌙', count: 45 }]
      }
    ]
  }
];

// Midjourney Server (Server 4) - Updated with more specific content per channel
const midjourneyChannels: Channel[] = [
  {
    id: 'general',
    name: 'general',
    type: 'text',
    serverId: 4,
    description: 'General discussion for the community',
    messages: [
      {
        id: 1,
        user: 'ModBot',
        time: '12:00 PM',
        content: 'Welcome to #general! This is where our community comes together to chat about anything and everything.',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'DigitalArtist',
        time: '3:45 PM',
        content: 'Hey everyone! Just joined the community. Really excited to learn about AI art generation! 🎨',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '👋', count: 15 }, { emoji: '🎨', count: 23 }]
      },
      {
        id: 3,
        user: 'MidJourneyPro',
        time: '3:47 PM',
        content: 'Welcome @DigitalArtist! Make sure to check out #newbies for beginner tips and #showcase for inspiration!',
        isBot: false
      },
      {
        id: 4,
        user: 'AIEnthusiast',
        time: '3:50 PM',
        content: 'The new V6 model is absolutely incredible! The detail and coherence improvements are mind-blowing 🤯',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🤯', count: 34 }, { emoji: '🔥', count: 28 }]
      }
    ]
  },
  {
    id: 'official-links',
    name: '🔗-official-links',
    type: 'text',
    serverId: 4,
    description: 'Official links and resources',
    messages: [
      {
        id: 1,
        user: 'Admin',
        time: '8:15 PM',
        content: 'Welcome to #🔗-official-links!\n\nThis channel contains all verified official links and resources for our community.',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'ProjectBot',
        time: '8:16 PM',
        content: '⚠️ **SECURITY NOTICE**\n\nThese are the ONLY official links for our project. Do not interact with any other links claiming to be official.',
        isBot: true,
        hasReactions: true,
        reactions: [{ emoji: '⚠️', count: 89 }, { emoji: '📌', count: 145 }]
      },
      {
        id: 3,
        user: 'ProjectBot',
        time: '8:17 PM',
        content: '🔗 **OFFICIAL RESOURCES**\n\n🌐 Main Website: https://midjourney.com\n📚 Documentation: https://docs.midjourney.com\n💻 GitHub Repository: https://github.com/midjourney/community\n📱 Mobile App: https://app.midjourney.com\n🔗 Status Page: https://status.midjourney.com\n💬 Support Portal: https://support.midjourney.com',
        isBot: true,
        hasLinks: true,
        links: ['https://midjourney.com', 'https://docs.midjourney.com', 'https://github.com/midjourney/community', 'https://app.midjourney.com', 'https://status.midjourney.com', 'https://support.midjourney.com'],
        hasReactions: true,
        reactions: [{ emoji: '🔗', count: 234 }, { emoji: '📌', count: 189 }, { emoji: '✅', count: 345 }]
      },
      {
        id: 4,
        user: 'SecurityBot',
        time: '8:20 PM',
        content: '🛡️ **PHISHING PROTECTION**\n\nAlways verify URLs before clicking! Official domains:\n• midjourney.com\n• docs.midjourney.com\n• app.midjourney.com\n\nReport suspicious links to moderators immediately!',
        isBot: true,
        hasReactions: true,
        reactions: [{ emoji: '🛡️', count: 67 }, { emoji: '✅', count: 123 }]
      },
      {
        id: 5,
        user: 'Admin',
        time: '8:25 PM',
        content: '📋 **QUICK ACCESS LINKS**\n\n🎯 Prompt Guide: https://docs.midjourney.com/prompts\n🎨 Gallery: https://midjourney.com/gallery\n💡 Tips & Tricks: https://docs.midjourney.com/tips\n🔧 Settings: https://docs.midjourney.com/settings',
        isBot: true,
        hasLinks: true,
        links: ['https://docs.midjourney.com/prompts', 'https://midjourney.com/gallery', 'https://docs.midjourney.com/tips', 'https://docs.midjourney.com/settings'],
        hasReactions: true,
        reactions: [{ emoji: '📋', count: 156 }, { emoji: '🎯', count: 89 }]
      },
      {
        id: 6,
        user: 'CommunityMod',
        time: '8:30 PM',
        content: '🔗 **COMMUNITY LINKS**\n\n💬 Discord Server: https://discord.gg/midjourney\n🐦 Twitter: https://twitter.com/midjourney\n📘 Facebook: https://facebook.com/midjourney\n📸 Instagram: https://instagram.com/midjourney',
        isBot: false,
        hasLinks: true,
        links: ['https://discord.gg/midjourney', 'https://twitter.com/midjourney', 'https://facebook.com/midjourney', 'https://instagram.com/midjourney'],
        hasReactions: true,
        reactions: [{ emoji: '💬', count: 78 }, { emoji: '🐦', count: 45 }]
      },
      {
        id: 7,
        user: 'TechSupport',
        time: '8:35 PM',
        content: '⚠️ **WARNING - SUSPICIOUS LINKS DETECTED**\n\nDo NOT click these links - they are for testing purposes only:\n• https://fake-midjourney.com\n• https://phishing-site.net/midjourney\n• https://suspicious-discord.com/invite\n\nAlways verify links before clicking!',
        isBot: false,
        hasLinks: true,
        links: ['https://fake-midjourney.com', 'https://phishing-site.net/midjourney', 'https://suspicious-discord.com/invite'],
        hasReactions: true,
        reactions: [{ emoji: '⚠️', count: 234 }, { emoji: '🚨', count: 156 }]
      },
      {
        id: 8,
        user: 'DevTeam',
        time: '8:40 PM',
        content: '🛠️ **DEVELOPER RESOURCES**\n\n📄 API Documentation: https://docs.midjourney.com/api\n🔧 Developer Tools: https://github.com/midjourney/tools\n💾 Sample Code: https://github.com/midjourney/examples\n🧪 Sandbox Environment: https://sandbox.midjourney.com',
        isBot: false,
        hasLinks: true,
        links: ['https://docs.midjourney.com/api', 'https://github.com/midjourney/tools', 'https://github.com/midjourney/examples', 'https://sandbox.midjourney.com'],
        hasReactions: true,
        reactions: [{ emoji: '🛠️', count: 89 }, { emoji: '💾', count: 67 }]
      }
    ]
  },
  {
    id: 'newbies',
    name: 'newbies',
    type: 'text',
    serverId: 4,
    description: 'Help and support for new members',
    messages: [
      {
        id: 1,
        user: 'HelperBot',
        time: '10:30 AM',
        content: 'Welcome to #newbies! This is a safe space for beginners to ask questions and get help from our community.',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'NewUser2024',
        time: '2:35 PM',
        content: 'Hi everyone! I\'m completely new to AI art generation. Can someone explain how to write effective prompts?',
        isBot: false
      },
      {
        id: 3,
        user: 'HelpfulMember',
        time: '2:37 PM',
        content: 'Welcome! Start with our beginner guide: https://docs.midjourney.com/beginners\n\nFor prompts, be descriptive but concise. Try: "a majestic lion, digital art, highly detailed, 4k" as a starting point!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '❤️', count: 12 }, { emoji: '🙏', count: 8 }]
      },
      {
        id: 4,
        user: 'PromptMaster',
        time: '2:40 PM',
        content: 'Also check out the #showcase channel for inspiration and see what prompts others are using! Learning from examples is the best way 🎨',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎨', count: 15 }]
      }
    ]
  },
  {
    id: 'showcase',
    name: '🎨-showcase',
    type: 'text',
    serverId: 4,
    description: 'Show off your creations and projects',
    messages: [
      {
        id: 1,
        user: 'ShowcaseBot',
        time: '9:00 AM',
        content: 'Welcome to #🎨-showcase! Share your amazing creations and projects here!',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'CreativeGenius',
        time: '1:15 PM',
        content: 'Just created this surreal landscape! 🌄\n\nPrompt: "floating islands in a purple sky, waterfalls cascading into clouds, fantasy art, ethereal lighting, 8k quality"\n\nI\'m amazed by how V6 handles complex scenes!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌄', count: 89 }, { emoji: '🔥', count: 67 }, { emoji: '✨', count: 45 }]
      },
      {
        id: 3,
        user: 'PortraitPro',
        time: '1:20 PM',
        content: 'Wow @CreativeGenius! The atmospheric perspective is incredible. How long did it take to get the composition right?',
        isBot: false
      },
      {
        id: 4,
        user: 'CreativeGenius',
        time: '1:22 PM',
        content: 'Thanks! About 15 iterations. The key was adding "rule of thirds" and "golden ratio composition" to the prompt.',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💡', count: 23 }]
      },
      {
        id: 5,
        user: 'DigitalArtist',
        time: '1:30 PM',
        content: 'Here\'s my latest portrait work! 🖼️\n\n"elderly wizard with wise eyes, long white beard, magical aura, renaissance painting style, chiaroscuro lighting, oil painting texture"\n\nThe detail in the eyes came out perfect!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🖼️', count: 156 }, { emoji: '🧙‍♂️', count: 89 }, { emoji: '👁️', count: 67 }]
      },
      {
        id: 6,
        user: 'AbstractArtist',
        time: '2:45 PM',
        content: 'Abstract experiment today! 🎭\n\n"geometric shapes melting into organic forms, vibrant colors, surreal, salvador dali meets mondrian"\n\nAI art is pushing the boundaries of creativity!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎭', count: 45 }, { emoji: '🌈', count: 67 }]
      }
    ]
  },
  {
    id: 'rules',
    name: '🚨-rules',
    type: 'text',
    serverId: 4,
    description: 'Community rules and guidelines',
    messages: [
      {
        id: 1,
        user: 'Admin',
        time: '12:00 PM',
        content: 'Welcome to #🚨-rules!\n\nPlease read and follow all community guidelines to maintain a positive environment for everyone.',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'Admin',
        time: '12:01 PM',
        content: '📋 **COMMUNITY RULES**\n\n1. **Be Respectful** - Treat everyone with kindness and respect\n2. **No Spam** - Keep conversations meaningful and on-topic\n3. **No NSFW Content** - Keep all content appropriate for all ages\n4. **Use Appropriate Channels** - Post in the right channels for your content\n5. **No Self-Promotion** - Don\'t advertise without permission\n6. **Help Others** - Be supportive of fellow community members\n7. **Follow Discord ToS** - All Discord Terms of Service apply\n\nViolation of these rules may result in warnings, mutes, or bans.',
        isBot: true,
        hasReactions: true,
        reactions: [{ emoji: '📌', count: 456 }, { emoji: '✅', count: 289 }, { emoji: '👍', count: 334 }]
      },
      {
        id: 3,
        user: 'ModeratorAlpha',
        time: '12:05 PM',
        content: '⚖️ **MODERATION POLICY**\n\n• First violation: Warning\n• Second violation: Temporary mute (24h)\n• Third violation: Temporary ban (7 days)\n• Serious violations: Immediate permanent ban\n\nWe aim to be fair but firm. Questions? DM any moderator.',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '⚖️', count: 123 }, { emoji: '📝', count: 89 }]
      },
      {
        id: 4,
        user: 'Admin',
        time: '12:10 PM',
        content: '🎨 **AI ART SPECIFIC RULES**\n\n• No generating explicit or harmful content\n• Credit original artists when using their style\n• Don\'t claim AI art as hand-drawn\n• Share prompts when asked (help others learn!)\n• Respect copyright and intellectual property',
        isBot: true,
        hasReactions: true,
        reactions: [{ emoji: '🎨', count: 234 }, { emoji: '📋', count: 167 }]
      }
    ]
  },
  {
    id: 'announcements',
    name: '📢-announcements',
    type: 'text',
    serverId: 4,
    description: 'Important announcements and updates',
    messages: [
      {
        id: 1,
        user: 'Admin',
        time: '9:00 AM',
        content: 'Welcome to #📢-announcements! Stay updated with the latest news and important updates.',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'Admin',
        time: '2:30 PM',
        content: '🎉 **MIDJOURNEY V6 IS NOW LIVE!**\n\nMajor improvements include:\n\n• Enhanced prompt understanding\n• Better coherence in complex scenes\n• Improved text rendering\n• Higher resolution outputs\n• More realistic lighting\n\nTry it now with --v 6 in your prompts!',
        isBot: true,
        hasReactions: true,
        reactions: [{ emoji: '🎉', count: 1234 }, { emoji: '🔥', count: 789 }, { emoji: '🚀', count: 567 }]
      },
      {
        id: 3,
        user: 'TechTeam',
        time: '4:15 PM',
        content: '🔧 **SCHEDULED MAINTENANCE**\n\nWe\'ll be performing server maintenance tomorrow (Dec 1st) from 2-4 AM EST.\n\nExpected improvements:\n• Faster image generation\n• Reduced queue times\n• Bug fixes for prompt parsing\n\nThank you for your patience!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🔧', count: 345 }, { emoji: '⏰', count: 234 }, { emoji: '👍', count: 456 }]
      },
      {
        id: 4,
        user: 'CommunityManager',
        time: '6:45 PM',
        content: '🏆 **MONTHLY ART CONTEST WINNERS!**\n\nCongratulations to our November winners:\n\n🥇 1st Place: @CreativeGenius - "Cyberpunk Cityscape"\n🥈 2nd Place: @DigitalArtist - "Mystical Forest"\n🥉 3rd Place: @AbstractArtist - "Geometric Dreams"\n\nDecember contest theme: "Winter Wonderland" ❄️\nSubmissions open now in #showcase!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🏆', count: 567 }, { emoji: '🎨', count: 423 }, { emoji: '❄️', count: 234 }]
      },
      {
        id: 5,
        user: 'Admin',
        time: '8:00 PM',
        content: '📊 **COMMUNITY MILESTONE!**\n\nWe\'ve reached 100,000 members! 🎊\n\nTo celebrate, we\'re offering:\n• 2x generation speed this weekend\n• Exclusive beta access to V7 features\n• Special community badges for active members\n\nThank you for making this community amazing!',
        isBot: true,
        hasReactions: true,
        reactions: [{ emoji: '🎊', count: 2345 }, { emoji: '💯', count: 1000 }, { emoji: '🚀', count: 876 }]
      }
    ]
  }
];

export const servers: Server[] = [
  {
    id: 2,
    name: "Gaming Hub",
    icon: "🔥",
    textChannels: gamingChannels,
    voiceChannels: [
      { name: "Gaming Lounge", users: 5, userList: ["ProGamer99", "AimBot_Not", "GamerGirl2024", "RageQuit", "NoobSlayer"] },
      { name: "Tournament Arena", users: 12, userList: ["GuildMaster", "ValorantPro", "ClutchKing", "HeadshotOnly", "TacticalGenius", "FragMaster", "EcoRound", "SpikeDefuser", "FlashBang", "SmokeScreen", "WallBang", "PistolAce"] },
      { name: "Minecraft Creative", users: 3, userList: ["BuildMaster", "RedstoneWiz", "BlockCrafter"] },
      { name: "Chill Gaming", users: 2, userList: ["CasualGamer", "RelaxedPlayer"] }
    ]
  },
  {
    id: 3,
    name: "Music Lovers",
    icon: "🎵",
    textChannels: musicChannels,
    voiceChannels: [
      { name: "Music Listening", users: 8, userList: ["PartyHost", "VinylCollector", "MelodyHunter", "ClassicRockFan", "ElectroVibes", "JazzCat", "BluesLover", "SynthWave"] },
      { name: "DJ Booth", users: 15, userList: ["DJ_Phoenix", "MixMaster", "BeatDropper", "BassBoosted", "TechnoTrance", "HouseHead", "DubstepDrop", "ChillHop", "LoFiVibes", "DeepHouse", "ProgressiveKing", "TrapLord", "FunkSoul", "DiscoFever", "ElectroSwing"] },
      { name: "Jam Session", users: 4, userList: ["GuitarHero", "BassPlayer", "DrumBeat", "KeyboardMaster"] },
      { name: "Production Talk", users: 2, userList: ["BeatMaker3000", "StudioMaster"] }
    ]
  },
  {
    id: 4,
    name: "Midjourney",
    icon: "/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png",
    textChannels: midjourneyChannels,
    voiceChannels: [
      { name: "General Chat", users: 6, userList: ["DigitalArtist", "MidJourneyPro", "AIEnthusiast", "CreativeGenius", "PortraitPro", "PromptMaster"] },
      { name: "🎨 Creative Session", users: 3, userList: ["ArtDirector", "ConceptArtist", "VisualDesigner"] },
      { name: "Help Desk", users: 2, userList: ["HelpfulMember", "TutorialGuru"] }
    ]
  }
];

export const channels: Channel[] = midjourneyChannels;

export const dmUsers: User[] = [
  {
    id: 'user1',
    name: 'User1',
    username: 'User1#1234',
    avatar: '',
    aboutMe: 'Frontend developer passionate about React and TypeScript. Always learning new technologies!',
    createdOn: 'Mar 15, 2023',
    status: 'online'
  },
  {
    id: 'user2', 
    name: 'User2',
    username: 'User2#5678',
    avatar: '',
    aboutMe: 'Full-stack developer with 5 years of experience. Love building scalable web applications.',
    createdOn: 'Jan 8, 2022'
  },
  {
    id: 'user3',
    name: 'User3',
    username: 'User3#9012',
    avatar: '',
    aboutMe: 'UI/UX Designer who codes. Creating beautiful and functional user experiences.',
    createdOn: 'Jul 22, 2023'
  },
  {
    id: 'midjourney-bot',
    name: 'Midjourney Bot',
    username: 'Midjourney Bot#9282',
    avatar: '/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png',
    aboutMe: 'Generate an image based on a text prompt in under 60 seconds using the /imagine command!',
    createdOn: 'Jan 29, 2022'
  }
];

export const dmMessages: Record<string, Message[]> = {
  'user1': [
    {
      id: 1,
      user: 'User1',
      time: '4:30 PM',
      content: 'Hey! How\'s your project going?',
      isBot: false
    },
    {
      id: 2,
      user: 'You',
      time: '4:32 PM',
      content: 'Going well! Just implemented some new features.',
      isBot: false
    },
    {
      id: 3,
      user: 'User1',
      time: '4:33 PM',
      content: 'That\'s awesome! Would love to see it when you\'re ready to share.',
      isBot: false
    }
  ],
  'user2': [
    {
      id: 1,
      user: 'User2',
      time: '2:15 PM',
      content: 'Thanks for helping me with that React question earlier!',
      isBot: false
    },
    {
      id: 2,
      user: 'You',
      time: '2:17 PM',
      content: 'No problem! Always happy to help.',
      isBot: false
    }
  ],
  'user3': [
    {
      id: 1,
      user: 'User3',
      time: '11:45 AM',
      content: 'Check out this cool design I found: https://dribbble.com/shots/example',
      isBot: false
    },
    {
      id: 2,
      user: 'You',
      time: '11:50 AM',
      content: 'Wow, that\'s really clean! I love the color scheme.',
      isBot: false
    }
  ],
  'midjourney-bot': [
    {
      id: 1,
      user: 'Midjourney Bot',
      time: '2:13 AM',
      content: 'Heya! Welcome to Midjourney. I\'m here to help you get started.',
      isBot: true
    },
    {
      id: 2,
      user: 'Midjourney Bot',
      time: '',
      content: 'First, you\'ll need to accept our terms of service. You can review them at https://docs.midjourney.com/docs/terms-of-service',
      isBot: true,
      hasButton: true,
      buttonText: 'Accept TOS'
    },
    {
      id: 3,
      user: 'Midjourney Bot',
      time: '',
      content: 'Let\'s explore the basics of Midjourney',
      isBot: true,
      hasButtons: true,
      buttons: ['Start Tutorial', 'Skip']
    },
    {
      id: 4,
      user: 'Midjourney Bot',
      time: '',
      content: 'Visit the Midjourney server to be inspired by what others are creating, get support, or learn more about creation.',
      isBot: true,
      hasInvite: true
    },
    {
      id: 5,
      user: 'Midjourney Bot',
      time: '',
      content: 'We hope you enjoy Midjourney! You can always learn more by visiting https://docs.midjourney.com/ or get answers to your questions by using /ask',
      isBot: true
    }
  ]
};
