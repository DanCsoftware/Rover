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
  navigationGuide?: any; // For special navigation responses
  specialComponent?: any; // For special UI components like fact-checks and server recommendations
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

// Server 2 - Gaming Hub (Enhanced with Twitch-style content)
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
        user: 'StreamBot',
        time: '6:00 AM',
        content: '🎮 **WELCOME TO GAMING HUB!** 🎮\n\nWhere legends are born and noobs get rekt! Join thousands of gamers for epic battles, tournaments, and endless content creation! 🔥\n\n📺 Follow our streamers!\n🏆 Join weekly tournaments!\n💬 Make new gaming friends!',
        isBot: true,
        isWelcome: true,
        hasReactions: true,
        reactions: [{ emoji: '🎮', count: 1247 }, { emoji: '🔥', count: 892 }, { emoji: '💯', count: 567 }]
      },
      {
        id: 2,
        user: 'TwitchStreamerPro',
        time: '8:15 AM',
        content: '🔴 **GOING LIVE IN 15 MINUTES!** 🔴\n\n**Stream Title:** "RADIANT OR RIOT - Valorant Ranked Grind"\n**Game:** Valorant\n**Goal:** Hit Radiant before the end of the season!\n\n🎯 !followage !socials !discord in chat\n🎁 Sub goal: 500 subs = 24hr stream!\n\nLink: https://twitch.tv/streamerpro\n\nSee you in chat legends! 💜',
        isBot: false,
        hasLinks: true,
        links: ['https://twitch.tv/streamerpro'],
        hasReactions: true,
        reactions: [{ emoji: '🔴', count: 456 }, { emoji: '💜', count: 234 }, { emoji: '🎯', count: 189 }]
      },
      {
        id: 3,
        user: 'EsportsManager',
        time: '10:30 AM',
        content: '⚔️ **WEEKLY TOURNAMENT BRACKET IS LIVE!** ⚔️\n\n**Game:** Valorant 5v5\n**Prize Pool:** $2,500 💰\n**Date:** This Saturday 2 PM EST\n**Format:** Double Elimination\n**Entry Fee:** FREE\n\n**Prizes:**\n🥇 1st Place: $1,200 + Champion Role\n🥈 2nd Place: $800 + Finalist Role  \n🥉 3rd Place: $400 + Bronze Medal Role\n🏅 4th Place: $100 + Participant Role\n\n**Register:** https://challonge.com/gaminghub-weekly\n**Rules:** https://docs.google.com/tournament-rules\n\nReact with ⚔️ to get notified!\n\n@everyone',
        isBot: false,
        hasLinks: true,
        links: ['https://challonge.com/gaminghub-weekly', 'https://docs.google.com/tournament-rules'],
        hasReactions: true,
        reactions: [{ emoji: '⚔️', count: 1834 }, { emoji: '💰', count: 567 }, { emoji: '🔥', count: 892 }]
      },
      {
        id: 4,
        user: 'CommunityManager',
        time: '2:45 PM',
        content: '📊 **SERVER STATS UPDATE!** 📊\n\n🎉 **50,000 MEMBERS MILESTONE REACHED!** 🎉\n\n**This Month:**\n• 🎮 15,847 hours streamed by our community\n• 🏆 127 tournament matches played\n• 💬 2.3M messages sent\n• 🔴 342 streamers went live\n• 🎁 $12,500 in prizes given away\n\n**Top Games This Month:**\n1. 🎯 Valorant - 34%\n2. 🔫 Call of Duty - 22%\n3. ⚡ Fortnite - 18%\n4. 🎲 Minecraft - 12%\n5. 🚗 Rocket League - 8%\n\nThanks for making this community LEGENDARY! 💪',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎉', count: 2456 }, { emoji: '💪', count: 1234 }, { emoji: '🔥', count: 1567 }]
      },
      {
        id: 5,
        user: 'DevTeam',
        time: '6:00 PM',
        content: '🤖 **BOT UPDATE v3.2.1** 🤖\n\n**New Features:**\n✅ Stream notifications now show game thumbnails\n✅ Tournament bracket auto-updates\n✅ Clip sharing with auto-embed\n✅ Rank tracking for 15+ games\n✅ Custom soundboard commands\n\n**Bug Fixes:**\n🔧 Fixed spam detection being too sensitive\n🔧 Resolved tournament registration errors\n🔧 Stream alerts now work properly in all timezones\n\n**Commands:**\n• `!rank [game] [username]` - Check your rank\n• `!clip [url]` - Share your best moments\n• `!tournament` - View current tournaments\n• `!stream` - Get stream setup help\n\nReport bugs in #bug-reports! 🐛',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🤖', count: 345 }, { emoji: '✅', count: 234 }, { emoji: '🔧', count: 156 }]
      }
    ]
  },
  {
    id: 'general-gaming',
    name: 'general-gaming',
    type: 'text',
    serverId: 2,
    description: 'General gaming discussion and community chat',
    messages: [
      {
        id: 1,
        user: 'xXGamerGodXx',
        time: '11:45 AM',
        content: 'YO CHAT IS THE NEW COD WORTH IT??? 👀',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '👀', count: 23 }, { emoji: '🎮', count: 15 }]
      },
      {
        id: 2,
        user: 'ProShooter',
        time: '11:46 AM',
        content: 'nah fam save your money, campaign is mid and multiplayer has too many bugs rn',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💸', count: 8 }]
      },
      {
        id: 3,
        user: 'CasualNoob',
        time: '11:47 AM',
        content: 'but the graphics tho 🔥🔥🔥',
        isBot: false
      },
      {
        id: 4,
        user: 'StreamSniper69',
        time: '11:48 AM',
        content: '@ProShooter facts, ima wait for a sale. Black Friday gonna be lit 💰',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💰', count: 12 }]
      },
      {
        id: 5,
        user: 'RageQuitter2024',
        time: '11:52 AM',
        content: 'anyone tryna run some ranked Val? Im stuck in Gold hell 😭',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😭', count: 34 }]
      },
      {
        id: 6,
        user: 'ClutchMaster',
        time: '11:53 AM',
        content: '@RageQuitter2024 whats ur rank? I can help u escape gold if u got good comms',
        isBot: false
      },
      {
        id: 7,
        user: 'RageQuitter2024',
        time: '11:54 AM',
        content: 'Gold 2, I main Jett but can flex. My aim is decent but game sense needs work',
        isBot: false
      },
      {
        id: 8,
        user: 'TacticalGenius',
        time: '11:55 AM',
        content: 'bro stop instalocking Jett and learn some utility agents. Sova/Omen will carry u to Plat easy',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🧠', count: 67 }, { emoji: '📈', count: 23 }]
      },
      {
        id: 9,
        user: 'ValorantCoach',
        time: '11:58 AM',
        content: 'FR tho, utility > aim in ranked. I coach players from Iron to Immortal and the biggest diff is game sense and team play',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎯', count: 45 }, { emoji: '🏆', count: 28 }]
      },
      {
        id: 10,
        user: 'MinecraftSteve',
        time: '12:15 PM',
        content: 'yall sleeping on the new Minecraft update. The cherry blossom biome hits different 🌸',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌸', count: 89 }, { emoji: '⛏️', count: 67 }]
      },
      {
        id: 11,
        user: 'BuilderPro',
        time: '12:16 PM',
        content: '@MinecraftSteve facts! Already started a Japanese-style village build. The new wood looks so clean',
        isBot: false
      },
      {
        id: 12,
        user: 'RedstoneNerd',
        time: '12:18 PM',
        content: 'meanwhile Im over here trying to build a 64-bit computer in vanilla... send help 💀',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💀', count: 156 }, { emoji: '🤓', count: 78 }]
      },
      {
        id: 13,
        user: 'FortniteKid',
        time: '12:30 PM',
        content: 'NEW FORTNITE SEASON IS INSANE 🚀 Zero Build mode actually makes the game playable again',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🚀', count: 34 }, { emoji: '⚡', count: 67 }]
      },
      {
        id: 14,
        user: 'BuildFighter',
        time: '12:31 PM',
        content: '@FortniteKid imagine not knowing how to build in 2024 💀💀💀',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💀', count: 23 }, { emoji: '🏗️', count: 12 }]
      },
      {
        id: 15,
        user: 'FortniteKid',
        time: '12:32 PM',
        content: 'bro I can build, I just prefer focusing on aim and positioning instead of spamming walls like a crackhead',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎯', count: 45 }]
      },
      {
        id: 16,
        user: 'StreamerWannabe',
        time: '12:45 PM',
        content: 'chat should I start streaming? been thinking about it but idk if im good enough',
        isBot: false
      },
      {
        id: 17,
        user: 'StreamerPro',
        time: '12:46 PM',
        content: '@StreamerWannabe dude just start! You dont need to be cracked to stream. Personality > skill. Some of the biggest streamers are mid at games but entertaining AF',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💯', count: 89 }, { emoji: '🎭', count: 34 }]
      },
      {
        id: 18,
        user: 'ViewerSupreme',
        time: '12:47 PM',
        content: 'facts @StreamerPro id rather watch someone fun and interactive than a cracked player who ignores chat',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '👑', count: 56 }]
      },
      {
        id: 19,
        user: 'TechNerd',
        time: '1:00 PM',
        content: 'anyone know good streaming software? been using OBS but wondering if theres something better for beginners',
        isBot: false
      },
      {
        id: 20,
        user: 'StreamSetupGuru',
        time: '1:02 PM',
        content: '@TechNerd OBS is still the goat but try Streamlabs if u want something more user-friendly. Has built-in widgets and easier setup',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '⚙️', count: 23 }]
      }
    ]
  },
  {
    id: 'valorant-lfg',
    name: '🎯-valorant-lfg',
    type: 'text',
    serverId: 2,
    description: 'Looking for group - Valorant ranked and unrated',
    messages: [
      {
        id: 1,
        user: 'ValorantBot',
        time: '9:00 AM',
        content: '🎯 **VALORANT LFG CHANNEL** 🎯\n\nFind teammates for ranked, unrated, and custom games!\n\n**Template:**\n```\nRank: [Your Rank]\nRole: [Main Agents]\nRegion: [NA/EU/ASIA]\nLooking for: [Rank/Comp/Fun]\nMic: [Yes/No]\n```\n\nLet\'s climb together! 🚀',
        isBot: true,
        isWelcome: true,
        hasReactions: true,
        reactions: [{ emoji: '🎯', count: 234 }, { emoji: '🚀', count: 167 }]
      },
      {
        id: 2,
        user: 'RadiantChaser',
        time: '2:15 PM',
        content: '**LF2M IMMORTAL+ RANKED**\n\nRank: Immortal 2 (378 RR)\nRole: IGL/Flex (Omen, Sova, Breach)\nRegion: NA West\nLooking for: Serious ranked grind to Radiant\nMic: Required + good comms\n\nMust have:\n• 1.2+ K/D last 20 games\n• Good mental (no rage)\n• Available for 3+ hour sessions\n• Discord for comms\n\nDM me your tracker.gg! 📊',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🔥', count: 23 }, { emoji: '🎯', count: 45 }]
      },
      {
        id: 3,
        user: 'DuelMaster',
        time: '2:18 PM',
        content: '@RadiantChaser yo I\'m Imm1 Jett/Reyna main, 1.4 KD, good comms. Can we run a few unrated first to see if we vibe?',
        isBot: false
      },
      {
        id: 4,
        user: 'SmokeSpammer',
        time: '2:20 PM',
        content: 'Imm3 Omen one-trick here if yall need smokes. 67% winrate this act 💨',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💨', count: 34 }]
      },
      {
        id: 5,
        user: 'GoldGrinder',
        time: '3:30 PM',
        content: '**LF3M GOLD RANKED**\n\nRank: Gold 1 (trying to hit Plat for first time)\nRole: Sage/KJ main but learning Sova\nRegion: NA East\nLooking for: Chill players around my rank\nMic: Yes\n\nI\'m not the best aimer but I have good game sense and always comm callouts. Let\'s climb together! 📈',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📈', count: 67 }, { emoji: '💊', count: 23 }]
      },
      {
        id: 6,
        user: 'FlashBangGod',
        time: '3:32 PM',
        content: '@GoldGrinder Gold 2 Breach main here! Love playing with good support players. Add me: FlashBang#VAL',
        isBot: false
      },
      {
        id: 7,
        user: 'EntryFragger',
        time: '3:35 PM',
        content: 'Gold 3 Jett main, can entry and create space. My game sense is improving but aim is solid. Down to queue!',
        isBot: false
      },
      {
        id: 8,
        user: 'IronToImmortal',
        time: '4:45 PM',
        content: '**BRONZE/SILVER PLAYERS**\n\nAnyone want to duo queue? I\'m Silver 3 trying to hit Gold by end of act. I main:\n• Killjoy (defense)\n• Omen (controller)\n• Breach (initiator)\n\nI watch a lot of pro play so my strats are decent, just need to work on consistency. Positive mental only! 😊',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😊', count: 89 }, { emoji: '📺', count: 34 }]
      },
      {
        id: 9,
        user: 'SilverSurfer',
        time: '4:47 PM',
        content: '@IronToImmortal Silver 2 here! Also trying to hit Gold. I\'m a Reyna main but learning Skye. Let\'s duo!',
        isBot: false
      },
      {
        id: 10,
        user: 'CustomGameMaster',
        time: '6:00 PM',
        content: '🎮 **CUSTOM 10-MAN STARTING NOW!** 🎮\n\nMap: Haven\nMode: Competitive rules\nSkill Level: Any (we\'ll balance teams)\nVoice: Discord required\n\nReact with ⚔️ to join!\nFirst 10 people get in, rest go to queue.\n\nCurrently: 6/10 players',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '⚔️', count: 45 }, { emoji: '🎮', count: 23 }]
      },
      {
        id: 11,
        user: 'SwiftRotation',
        time: '6:02 PM',
        content: '@CustomGameMaster I\'m in! Plat player, can play any role needed',
        isBot: false
      },
      {
        id: 12,
        user: 'AceClutcher',
        time: '6:03 PM',
        content: 'Count me in too! Diamond Sova main',
        isBot: false
      },
      {
        id: 13,
        user: 'NewPlayerHelp',
        time: '7:15 PM',
        content: 'hey guys, complete noob here. Just finished my placement matches (got Iron 2). Anyone willing to play some unrated and give me tips? I know I\'m bad but I\'m eager to learn! 🤗',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🤗', count: 156 }, { emoji: '📚', count: 89 }]
      },
      {
        id: 14,
        user: 'PatientCoach',
        time: '7:17 PM',
        content: '@NewPlayerHelp I help new players all the time! Add me and we can run some games. I\'ll teach you crosshair placement, economy, and basic strats. Everyone starts somewhere! 💪',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💪', count: 234 }, { emoji: '🏆', count: 67 }]
      },
      {
        id: 15,
        user: 'ValorantSage',
        time: '7:20 PM',
        content: 'This community is so wholesome 🥺 Love seeing experienced players help newcomers instead of flaming them',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🥺', count: 345 }, { emoji: '❤️', count: 234 }]
      }
    ]
  },
  {
    id: 'stream-promotion',
    name: '📺-stream-promotion',
    type: 'text',
    serverId: 2,
    description: 'Promote your streams and content',
    messages: [
      {
        id: 1,
        user: 'StreamBot',
        time: '8:00 AM',
        content: '📺 **STREAM PROMOTION CHANNEL** 📺\n\nShare your streams, YouTube videos, and content here!\n\n**Rules:**\n• No spam (max 1 promo per 6 hours)\n• Include game, schedule, and brief description\n• Support other streamers in the community\n• Use !live command for going live notifications\n\nLet\'s grow together! 🚀',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'RisingStreamer',
        time: '11:30 AM',
        content: '🔴 **GOING LIVE NOW!** 🔴\n\n**Stream:** Valorant Competitive Climb\n**Goal:** From Diamond to Immortal in one stream!\n**Duration:** 6-8 hours\n**Vibe:** Chill gameplay with educational commentary\n\n**What to expect:**\n• Aim training warmup\n• Ranked queue with viewer games between\n• Q&A about climbing and improving\n• Maybe some 1v1s with chat\n\n**Link:** https://twitch.tv/risingstreamer\n**Discord:** Come chill in voice chat!\n\nDrop a follow if you enjoy! Every bit of support helps 💜\n\n#Valorant #Twitch #RankedClimb',
        isBot: false,
        hasLinks: true,
        links: ['https://twitch.tv/risingstreamer'],
        hasReactions: true,
        reactions: [{ emoji: '🔴', count: 67 }, { emoji: '💜', count: 234 }, { emoji: '🎯', count: 45 }]
      },
      {
        id: 3,
        user: 'ContentCreator2024',
        time: '2:15 PM',
        content: '📹 **NEW YOUTUBE VIDEO DROPPED!** 📹\n\n**Title:** "How I Went From Iron to Radiant in 3 Months (No Clickbait)"\n**Length:** 24 minutes\n**Content:** Full breakdown of my climb with tips for each rank\n\n**Timestamps:**\n0:00 - Introduction & Proof\n2:30 - Iron to Bronze (Basics)\n6:45 - Silver to Gold (Aim Training)\n12:00 - Gold to Plat (Game Sense)\n17:30 - Plat to Diamond (Team Play)\n21:00 - Diamond to Immortal (Mental Game)\n23:00 - Immortal to Radiant (The Grind)\n\n**Link:** https://youtube.com/watch?v=valorant-climb-guide\n\nHope this helps someone with their climb! Like and sub if it does 🙏',
        isBot: false,
        hasLinks: true,
        links: ['https://youtube.com/watch?v=valorant-climb-guide'],
        hasReactions: true,
        reactions: [{ emoji: '📹', count: 89 }, { emoji: '🙏', count: 156 }, { emoji: '🏆', count: 78 }]
      },
      {
        id: 4,
        user: 'SmallStreamerSupport',
        time: '4:30 PM',
        content: '💜 Went and dropped a follow on @RisingStreamer! The gameplay was actually really educational. Chat was super welcoming too 😊\n\nWe gotta support each other in this community! Who else is streaming today? Drop your links! 👇',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💜', count: 123 }, { emoji: '😊', count: 67 }]
      },
      {
        id: 5,
        user: 'VarietyStreamer',
        time: '4:45 PM',
        content: '🎮 **VARIETY NIGHT STREAM!** 🎮\n\n**Tonight 8 PM EST:**\n• Fall Guys with viewers (custom lobbies)\n• Among Us community games\n• Jackbox party games\n• Maybe some horror if chat wants to see me suffer 👻\n\n**Interactive Stream:**\n• Chat picks the games\n• Discord voice for party games\n• Viewer tournaments with small prizes\n\n**Twitch:** https://twitch.tv/varietystreamer\n**Duration:** 4-6 hours depending on energy\n\nCome hang out and lets have some fun! No skill required, just good vibes 😄',
        isBot: false,
        hasLinks: true,
        links: ['https://twitch.tv/varietystreamer'],
        hasReactions: true,
        reactions: [{ emoji: '🎮', count: 234 }, { emoji: '😄', count: 89 }, { emoji: '👻', count: 156 }]
      },
      {
        id: 6,
        user: 'MinecraftBuilder',
        time: '6:00 PM',
        content: '⛏️ **MINECRAFT BUILD STREAM TOMORROW!** ⛏️\n\n**Project:** Recreating the entire map of Valorant\'s Haven in Minecraft\n**Time:** Saturday 12 PM EST\n**Duration:** All day (10+ hours)\n**Style:** Chill building with lofi music\n\n**Stream Features:**\n• Time-lapse segments\n• Chat can suggest details to add\n• Behind-the-scenes building techniques\n• Maybe some mini-games between build sessions\n\n**Progress so far:** A site is 60% done, looks incredible!\n\n**YouTube:** https://youtube.com/minecraftbuilder (for time-lapses)\n**Twitch:** https://twitch.tv/minecraftbuilder (for live building)\n\nPerfect stream to have in the background while you game! 🎵',
        isBot: false,
        hasLinks: true,
        links: ['https://youtube.com/minecraftbuilder', 'https://twitch.tv/minecraftbuilder'],
        hasReactions: true,
        reactions: [{ emoji: '⛏️', count: 345 }, { emoji: '🎵', count: 123 }]
      },
      {
        id: 7,
        user: 'CompetitiveCoach',
        time: '7:30 PM',
        content: '🎓 **COACHING STREAM SERIES** 🎓\n\n**Episode 3 Tomorrow:** "Advanced Smoke Executes"\n**Time:** Sunday 3 PM EST\n**Format:** Live demo + viewer Q&A\n\n**What we\'ll cover:**\n• One-way smokes on all maps\n• Coordinating with team utility\n• Post-plant positioning\n• Retake strategies\n• Common mistakes and how to fix them\n\n**Interactive Elements:**\n• Submit your gameplay clips for review\n• Live demonstration in custom games\n• Q&A session at the end\n• Free coaching session giveaway\n\n**Previous Episodes:**\n• Episode 1: Crosshair Placement (250k views)\n• Episode 2: Economy Management (180k views)\n\n**Link:** https://twitch.tv/competitivecoach\n\nBring your questions! Everyone from Iron to Immortal welcome 📚',
        isBot: false,
        hasLinks: true,
        links: ['https://twitch.tv/competitivecoach'],
        hasReactions: true,
        reactions: [{ emoji: '🎓', count: 456 }, { emoji: '📚', count: 234 }]
      }
    ]
  },
  {
    id: 'clips-highlights',
    name: '🎬-clips-highlights',
    type: 'text',
    serverId: 2,
    description: 'Share your best gaming moments and clips',
    messages: [
      {
        id: 1,
        user: 'ClipBot',
        time: '10:00 AM',
        content: '🎬 **CLIPS & HIGHLIGHTS CHANNEL** 🎬\n\nShare your most epic gaming moments here!\n\n**Supported Platforms:**\n• Twitch Clips\n• YouTube Shorts\n• Medal.tv clips\n• Streamable links\n• Direct uploads (up to 50MB)\n\n**Guidelines:**\n• Keep clips under 2 minutes\n• Include game name in title\n• No spam (max 3 clips per day)\n• Constructive feedback only\n\nShow us your best plays! 🔥',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'ClutchKing2024',
        time: '1:45 PM',
        content: '**INSANE 1v5 CLUTCH IN RANKED** 🔥\n\nGame: Valorant\nRank: Diamond 2\nAgent: Omen\nMap: Bind\n\nContext: My whole team died to an eco rush and I had to clutch a 1v5 with just a Vandal and some smokes. The last kill through smoke was pure luck but I\'ll take it! 😅\n\n**Clip:** https://clips.twitch.tv/clutchking-1v5-bind\n\nThis is why I love playing Omen! Smokes OP 💨',
        isBot: false,
        hasLinks: true,
        links: ['https://clips.twitch.tv/clutchking-1v5-bind'],
        hasReactions: true,
        reactions: [{ emoji: '🔥', count: 456 }, { emoji: '💨', count: 123 }, { emoji: '🤯', count: 234 }]
      },
      {
        id: 3,
        user: 'AceCollector',
        time: '1:50 PM',
        content: '@ClutchKing2024 BRO THAT SMOKE KILL WAS NASTY 🤢 Your crosshair placement in smokes is actually cracked',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🤢', count: 89 }]
      },
      {
        id: 4,
        user: 'HighlightHunter',
        time: '2:15 PM',
        content: '**TRIPLE COLLATERAL WITH AWP** 💥\n\nGame: CS2\nMap: Mirage\nSituation: 3 enemies peeked connector at same time\n\n**Clip:** https://medal.tv/highlight-triple-collat\n\nI\'ve been playing CS for 8 years and this is only my second triple collateral ever. The stars aligned perfectly! ⭐\n\n#CS2 #AWP #Collateral',
        isBot: false,
        hasLinks: true,
        links: ['https://medal.tv/highlight-triple-collat'],
        hasReactions: true,
        reactions: [{ emoji: '💥', count: 678 }, { emoji: '⭐', count: 345 }, { emoji: '🎯', count: 234 }]
      },
      {
        id: 5,
        user: 'FortniteBuilder',
        time: '3:30 PM',
        content: '**200 IQ EDIT PLAY** 🧠\n\nGame: Fortnite\nMode: Ranked (Champion League)\nPlay: Predicted enemy movement with triple edit\n\n**Clip:** https://streamable.com/fortnite-200iq-edit\n\nThis took me hours of creative practice but it finally paid off in a real game! The opponent never saw it coming 😎\n\n**Tutorial:** https://youtube.com/edit-tutorial-guide\n\n#Fortnite #Creative #Editing',
        isBot: false,
        hasLinks: true,
        links: ['https://streamable.com/fortnite-200iq-edit', 'https://youtube.com/edit-tutorial-guide'],
        hasReactions: true,
        reactions: [{ emoji: '🧠', count: 234 }, { emoji: '😎', count: 156 }]
      },
      {
        id: 6,
        user: 'MinecraftRedstone',
        time: '4:45 PM',
        content: '**WORKING CPU IN MINECRAFT** 🤯\n\nProject: 8-bit computer that can play Pong\nTime to build: 3 months\nRedstone components: 15,000+\n\n**Showcase:** https://youtube.com/minecraft-cpu-showcase\n**World Download:** https://drive.google.com/minecraft-cpu-world\n\n**Features:**\n• 8-bit processing\n• 64 bytes of RAM\n• Simple graphics output\n• Basic input system\n• Can run Pong, Snake, and Calculator\n\nThis was my pandemic project. Learned so much about computer architecture! 💻\n\n#Minecraft #Redstone #Engineering',
        isBot: false,
        hasLinks: true,
        links: ['https://youtube.com/minecraft-cpu-showcase', 'https://drive.google.com/minecraft-cpu-world'],
        hasReactions: true,
        reactions: [{ emoji: '🤯', count: 1234 }, { emoji: '💻', count: 567 }, { emoji: '🏆', count: 890 }]
      },
      {
        id: 7,
        user: 'RocketLeagueFreestyle',
        time: '5:30 PM',
        content: '**CEILING SHOT DOUBLE TAP** 🚗💨\n\nGame: Rocket League\nRank: Grand Champion\nMap: Mannfield\n\n**Clip:** https://gfycat.com/rocket-league-ceiling-double\n\nFinally hit this in ranked after practicing for months! The setup was perfect and the opponent had no chance to save it 🥅\n\n**Training Pack Code:** 4BC7-8F23-1A94-D756\n\nPractice this shot and you\'ll be flying in no time! ✈️',
        isBot: false,
        hasLinks: true,
        links: ['https://gfycat.com/rocket-league-ceiling-double'],
        hasReactions: true,
        reactions: [{ emoji: '🚗', count: 345 }, { emoji: '⚽', count: 234 }, { emoji: '✈️', count: 156 }]
      },
      {
        id: 8,
        user: 'ApexPredator',
        time: '6:15 PM',
        content: '**THIRD PARTY SQUAD WIPE** 🦅\n\nGame: Apex Legends\nLegend: Wraith\nWeapon: R-99 + Wingman\nRank: Predator (Top 500)\n\n**Clip:** https://clips.twitch.tv/apex-third-party-wipe\n\n**Context:** Two squads fighting, I portal flanked and caught them all healing. Sometimes positioning > aim 🧠\n\n**Loadout:**\n• R-99 with Purple Barrel + Purple Stock\n• Wingman with Skullpiercer\n• Purple Armor + Gold Helmet\n\nTiming is everything in Apex! ⏰',
        isBot: false,
        hasLinks: true,
        links: ['https://clips.twitch.tv/apex-third-party-wipe'],
        hasReactions: true,
        reactions: [{ emoji: '🦅', count: 456 }, { emoji: '🧠', count: 234 }, { emoji: '⏰', count: 123 }]
      },
      {
        id: 9,
        user: 'FailCompilation',
        time: '7:00 PM',
        content: '**EPIC FAIL MONTAGE** 😂\n\nGame: Various\nContent: My worst moments from this week\nDuration: 3 minutes of pure pain\n\n**Video:** https://youtube.com/epic-fail-compilation-week3\n\n**Highlights:**\n• Falling off map 5 times in Fall Guys\n• Missing every shot with AWP in CS2\n• Getting jumpscared in horror game\n• Rage quitting after lag death\n\nSometimes you gotta laugh at yourself! We all have bad days 💀\n\n#Fails #Funny #Gaming',
        isBot: false,
        hasLinks: true,
        links: ['https://youtube.com/epic-fail-compilation-week3'],
        hasReactions: true,
        reactions: [{ emoji: '😂', count: 789 }, { emoji: '💀', count: 456 }, { emoji: '🤡', count: 234 }]
      },
      {
        id: 10,
        user: 'SpeedRunner',
        time: '8:30 PM',
        content: '**NEW PERSONAL BEST!** ⏱️\n\nGame: Celeste\nCategory: Any% (Golden Strawberries)\nTime: 32:47.892\nPrevious PB: 33:12.456\n\n**VOD:** https://twitch.tv/speedrunner/vod-celeste-pb\n\n**Splits:**\n• Chapter 1: 2:43 (+0.2s)\n• Chapter 2: 5:21 (-1.8s)\n• Chapter 3: 8:45 (-2.1s)\n• Chapter 4: 12:30 (-0.9s)\n• Final: 32:47 (-24.6s)\n\nAlmost sub-32! The grind continues... 💪\n\n**What went well:**\n• Perfect wavedash sequence in Ch2\n• No deaths in Ch6\n• Clean boss fight\n\n**What to improve:**\n• Chapter 1 still slow\n• Missed optimization in Ch5\n\n#Speedrun #Celeste #PB',
        isBot: false,
        hasLinks: true,
        links: ['https://twitch.tv/speedrunner/vod-celeste-pb'],
        hasReactions: true,
        reactions: [{ emoji: '⏱️', count: 345 }, { emoji: '💪', count: 234 }, { emoji: '🏃‍♂️', count: 156 }]
      }
    ]
  }
];

// Server 3 - Music Lovers (Enhanced with realistic music community content)
const musicChannels: Channel[] = [
  {
    id: 'music-announcements',
    name: '🎵-announcements',
    type: 'text',
    serverId: 3,
    description: 'Music community announcements and events',
    messages: [
      {
        id: 1,
        user: 'MusicBot',
        time: '6:00 AM',
        content: '🎵 **WELCOME TO MUSIC LOVERS COMMUNITY!** 🎵\n\nWhere melodies meet and beats unite! 🎶\n\n**What we offer:**\n🎧 Daily listening parties\n🎤 Live DJ sets and performances\n💿 Vinyl trading community\n🎼 Music production help\n🎪 Concert meetups worldwide\n📻 24/7 community radio\n\n**Rules:**\n• Respect all genres and tastes\n• No music piracy links\n• Support independent artists\n• Keep discussions music-focused\n\nLet the music bring us together! ✨',
        isBot: true,
        isWelcome: true,
        hasReactions: true,
        reactions: [{ emoji: '🎵', count: 2345 }, { emoji: '🎶', count: 1567 }, { emoji: '✨', count: 1234 }]
      },
      {
        id: 2,
        user: 'CommunityDJ',
        time: '10:30 AM',
        content: '🔥 **EPIC DJ SET TONIGHT!** 🔥\n\n**Event:** "Synthwave Sunday Sessions"\n**DJ:** @NeonNights + @RetroWave80s\n**Time:** 9 PM EST (6 PM PST)\n**Duration:** 4 hours of pure synthwave bliss\n**Location:** DJ Booth voice channel + live stream\n\n**Tonight\'s Journey:**\n🌃 9:00 PM - Dark Synthwave (Perturbator, Dance With The Dead)\n🌆 10:00 PM - Retrowave Classics (FM-84, The Midnight)\n🌅 11:00 PM - Chillwave Vibes (HOME, Mitch Murder)\n🚗 12:00 AM - Outrun Madness (Carpenter Brut, Power Trip)\n\n**Interactive Features:**\n• Song requests via !request command\n• Live chat with DJs\n• Track ID service\n• Download links for mixes\n\n**Stream Links:**\n🔴 Twitch: https://twitch.tv/musiclovers-dj\n📻 YouTube: https://youtube.com/live/synthwave-sunday\n🎵 SoundCloud: Auto-uploaded after stream\n\nBring your neon lights and get ready to cruise! 🏎️💨',
        isBot: false,
        hasLinks: true,
        links: ['https://twitch.tv/musiclovers-dj', 'https://youtube.com/live/synthwave-sunday'],
        hasReactions: true,
        reactions: [{ emoji: '🔥', count: 567 }, { emoji: '🌃', count: 234 }, { emoji: '🏎️', count: 345 }]
      },
      {
        id: 3,
        user: 'VinylVault',
        time: '2:15 PM',
        content: '📀 **MONTHLY VINYL SWAP MEET!** 📀\n\n**Date:** This Saturday, December 2nd\n**Time:** 2 PM - 8 PM EST\n**Location:** Virtual trading floor + local meetups\n\n**How it works:**\n1. Post your trade list in #vinyl-trading\n2. Browse others\' collections\n3. Negotiate trades via DM\n4. Meet up locally or ship with verified traders\n\n**Featured Collections This Month:**\n🎸 **@RockCollector47:** 200+ classic rock LPs (Led Zeppelin first pressings!)\n🎺 **@JazzMaster:** Rare Blue Note catalog (some worth $1000+)\n🏠 **@HouseMusicHead:** Complete Detroit techno collection\n🎼 **@ClassicalConnoisseur:** Deutsche Grammophon rarities\n\n**Safety Reminders:**\n• Use verified trader system\n• Document condition with photos\n• Ship with tracking + insurance\n• Local meetups in public places only\n\n**Success Stories:**\n• 847 successful trades this year\n• $45,000+ in vinyl value exchanged\n• 23 local meetup groups formed\n• 0 reported scams (amazing community!)\n\n**Special Events:**\n🎰 Mystery box auctions\n🔍 Grail hunting sessions\n📚 Price guide discussions\n🎧 Listening parties for rare finds\n\nCan\'t wait to see what treasures surface! 💎',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📀', count: 445 }, { emoji: '💎', count: 234 }, { emoji: '🎸', count: 167 }]
      },
      {
        id: 4,
        user: 'ConcertConnect',
        time: '5:45 PM',
        content: '🎤 **MASSIVE CONCERT ANNOUNCEMENTS!** 🎤\n\n**This Week\'s Drops:**\n\n🔥 **Taylor Swift - Eras Tour**\n📍 Additional dates: Chicago, Denver, Seattle\n🎫 Presale: Tomorrow 10 AM local time\n🔑 Code: SWIFTIE2024\n💰 Tickets: $49.50 - $449.50\n⚠️ Expected to sell out in minutes!\n\n⚡ **Metallica - M72 World Tour**\n📍 Summer stadium tour announced\n🎫 General sale: Friday 12 PM EST\n🎸 Special: 2 nights, no repeat songs!\n💰 Tickets: $89.50 - $750\n\n🎵 **Coachella 2024 Lineup Leak**\n📱 Headliners rumored: Bad Bunny, Billie Eilish, Frank Ocean\n🎪 Dates: April 12-14 & 19-21\n🎫 Presale registration open now\n💰 Weekend passes: $429 + fees\n\n🏠 **Underground Electronic Scene**\n🕺 Warehouse parties every weekend\n📍 Detroit, Berlin, London hotspots\n🎧 DJs: Charlotte de Witte, Amelie Lens confirmed\n💫 Secret locations revealed 24hrs before\n\n**Concert Buddy System:**\n• Find travel companions in #concert-meetups\n• Share rides, hotels, and experiences\n• Safety in numbers for unknown venues\n• Group discounts for bulk tickets\n\n**Ticket Bot Protection:**\n🤖 We monitor for bot activity\n⚡ Real-time stock alerts\n💡 Tips for beating queues\n🎯 Alternative vendor suggestions\n\nWho\'s trying to see live music this year? 🙋‍♀️🙋‍♂️',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎤', count: 1234 }, { emoji: '🔥', count: 890 }, { emoji: '⚡', count: 567 }]
      },
      {
        id: 5,
        user: 'NewMusicFriday',
        time: '8:00 PM',
        content: '🆕 **NEW MUSIC FRIDAY MEGATHREAD!** 🆕\n\n**Major Releases This Week:**\n\n🎭 **Drake - "For All The Dogs Deluxe"**\n💿 Genre: Hip-Hop/Rap\n⏱️ Runtime: 1hr 23min (23 tracks)\n⭐ Standout: "First Person Shooter" ft. J. Cole\n🔥 Already trending #1 globally\n\n🌊 **Lana Del Rey - "Ocean Blvd Sessions"**\n💿 Genre: Alternative/Indie Pop\n⏱️ Runtime: 47min (11 tracks)\n⭐ Standout: "Margaret" ft. Bleachers\n🌙 Perfect late-night listening\n\n⚡ **Porter Robinson - "Nurture (Remix Album)"**\n💿 Genre: Electronic/Future Bass\n⏱️ Runtime: 52min (12 tracks)\n⭐ Standout: "Look at the Sky (Hex Cougar Remix)"\n🎨 Each track reimagined by different artists\n\n🎸 **Arctic Monkeys - "Live at Royal Albert Hall"**\n💿 Genre: Indie Rock (Live Album)\n⏱️ Runtime: 1hr 8min (16 tracks)\n⭐ Standout: 12-minute "Do I Wanna Know?" extension\n🏛️ Recorded during their sold-out residency\n\n**Hidden Gems:**\n\n🌟 **Remi Wolf - "Juno Demos"**\n• Unreleased bedroom recordings\n• Raw, emotional versions of hits\n• Limited pressing vinyl available\n\n🎺 **Kamasi Washington - "Fearless Movement"**\n• 84-minute jazz odyssey\n• Features 32-piece orchestra\n• Already Grammy buzz\n\n🔮 **100 gecs - "10,000 gecs and the Tree of Clues"**\n• Hyperpop chaos as usual\n• Somehow even more experimental\n• Love it or hate it, no middle ground\n\n**Community Listening Party:**\n📅 Tonight 10 PM EST\n🎧 We\'ll go through each major release\n💬 Live discussion and reactions\n🗳️ Vote for weekly favorites\n\n**Stats from Last Week:**\n• 2.3M collective streams from our community\n• #ice-spice-new dominated discussions\n• 89% approval rating for SZA\'s surprise drop\n• 431 new songs added to community playlists\n\nWhat\'s first on your queue? 🎶',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🆕', count: 678 }, { emoji: '🎶', count: 445 }, { emoji: '🔥', count: 523 }]
      }
    ]
  },
  {
    id: 'general-music',
    name: 'general-music',
    type: 'text',
    serverId: 3,
    description: 'General music discussion and discovery',
    messages: [
      {
        id: 1,
        user: 'MelodyExplorer',
        time: '9:30 AM',
        content: 'morning music fam! ☕🎵 what\'s everyone listening to while they work/study today?',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '☕', count: 34 }, { emoji: '🎵', count: 67 }]
      },
      {
        id: 2,
        user: 'LoFiVibes',
        time: '9:32 AM',
        content: 'got this lofi hip hop playlist on repeat: https://open.spotify.com/playlist/lofi-study-vibes\n\nperfect for coding sessions 💻🎧',
        isBot: false,
        hasLinks: true,
        links: ['https://open.spotify.com/playlist/lofi-study-vibes'],
        hasReactions: true,
        reactions: [{ emoji: '💻', count: 45 }, { emoji: '🎧', count: 78 }]
      },
      {
        id: 3,
        user: 'MetalHead666',
        time: '9:35 AM',
        content: '@LoFiVibes bro how do you concentrate with that sleepy music? I need ENERGY 🔥\n\ncurrently blasting some Gojira - "Amazonia" to wake up properly 🤘',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🔥', count: 23 }, { emoji: '🤘', count: 56 }]
      },
      {
        id: 4,
        user: 'ClassicalMind',
        time: '9:40 AM',
        content: 'Interesting how we all have different focus music! For me it\'s Bach\'s Goldberg Variations. The mathematical precision actually helps with problem-solving 🧠\n\nGlenn Gould\'s 1981 recording is *chef\'s kiss* 👌',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🧠', count: 34 }, { emoji: '👌', count: 67 }]
      },
      {
        id: 5,
        user: 'PopPrincess',
        time: '10:15 AM',
        content: 'OK BUT CAN WE TALK ABOUT HOW GOOD THE NEW OLIVIA RODRIGO ALBUM IS??? 😭💜\n\n"vampire" has been on repeat for 3 days straight and I\'m not even sorry',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😭', count: 145 }, { emoji: '💜', count: 234 }]
      },
      {
        id: 6,
        user: 'IndieDiscoverer',
        time: '10:18 AM',
        content: '@PopPrincess her songwriting has seriously evolved! the bridge in "vampire" is pure poetry\n\nalso if you like that emotional rawness, check out Phoebe Bridgers - "Motion Sickness". similar energy but indie flavor 🌱',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌱', count: 78 }]
      },
      {
        id: 7,
        user: 'HipHopHead2024',
        time: '11:00 AM',
        content: 'yall sleeping on the underground scene fr 💯\n\njust discovered this rapper called JID and his wordplay is INSANE. "Dance Now" goes so hard 🔥\n\nwhy mainstream radio only plays the same 10 songs tho? 😤',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💯', count: 89 }, { emoji: '🔥', count: 123 }, { emoji: '😤', count: 45 }]
      },
      {
        id: 8,
        user: 'RadioRebel',
        time: '11:03 AM',
        content: '@HipHopHead2024 FACTS! mainstream radio is dead 💀\n\nthats why I only listen to:\n• independent radio stations\n• community playlists\n• bandcamp discoveries\n• live sessions on youtube\n\nreal music is out there, you just gotta dig! ⛏️',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💀', count: 67 }, { emoji: '⛏️', count: 34 }]
      },
      {
        id: 9,
        user: 'VinylCollector',
        time: '11:30 AM',
        content: 'just picked up an original pressing of Pink Floyd - "The Dark Side of the Moon" 🌙\n\nthe sound quality difference between vinyl and digital is night and day! you can hear every breath, every guitar string vibration...\n\nwho else collects physical media? 📀💿',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌙', count: 156 }, { emoji: '📀', count: 89 }]
      },
      {
        id: 10,
        user: 'DigitalNomad',
        time: '11:35 AM',
        content: '@VinylCollector respect for the analog experience! but tbh I love the convenience of streaming 📱\n\nSpotify Discover Weekly introduced me to 90% of my favorite artists. algorithm knows me better than I know myself lol 🤖',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📱', count: 45 }, { emoji: '🤖', count: 67 }]
      },
      {
        id: 11,
        user: 'ConcertAddict',
        time: '12:45 PM',
        content: 'nothing beats live music tho!! 🎤✨\n\nsaw Tame Impala last weekend and Kevin\'s guitar tone in person was TRANSCENDENT. studio recordings can\'t capture that energy\n\nwho\'s got concerts coming up? 🎪',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎤', count: 234 }, { emoji: '✨', count: 167 }, { emoji: '🎪', count: 89 }]
      },
      {
        id: 12,
        user: 'BudgetMelomaniac',
        time: '12:48 PM',
        content: '@ConcertAddict seeing Arctic Monkeys next month! saved up for 6 months for decent seats 💸\n\nsometimes I think about how expensive live music has become... but then I remember it supports the artists directly 🎭',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💸', count: 78 }, { emoji: '🎭', count: 45 }]
      },
      {
        id: 13,
        user: 'GenZMusiclover',
        time: '1:30 PM',
        content: 'hot take: TikTok is actually great for music discovery 📱💫\n\nfound so many underground artists through 15-second snippets. yeah the app has issues but it\'s democratizing music exposure\n\nthoughts? 🤔',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📱', count: 123 }, { emoji: '🤔', count: 89 }, { emoji: '💫', count: 67 }]
      },
      {
        id: 14,
        user: 'OldSchoolPurist',
        time: '1:35 PM',
        content: '@GenZMusiclover I see your point but those 15-second clips are ruining song structure! artists now write specifically for TikTok hooks instead of full compositions 😤\n\nmusic is becoming fast food instead of fine dining 🍔➡️🍽️',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😤', count: 45 }, { emoji: '🍔', count: 23 }]
      },
      {
        id: 15,
        user: 'MiddleGroundMelody',
        time: '1:40 PM',
        content: 'both sides have merit tbh 🤷‍♀️\n\nTikTok helps artists reach audiences they never could before, BUT it also creates pressure for instant gratification\n\nmaybe the real magic happens when TikTok discovery leads people to explore full albums? 💭',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🤷‍♀️', count: 67 }, { emoji: '💭', count: 34 }]
      },
      {
        id: 16,
        user: 'NightOwlListener',
        time: '2:15 AM',
        content: '3 AM and I\'m in a deep ambient rabbit hole 🌙🎧\n\nBrian Eno\'s "Music for Airports" hits different at this hour. feels like floating in space\n\nanyone else have specific genres for specific times of day? ⏰',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌙', count: 89 }, { emoji: '🎧', count: 123 }, { emoji: '⏰', count: 45 }]
      },
      {
        id: 17,
        user: 'SunriseSerenader',
        time: '6:00 AM',
        content: '@NightOwlListener totally! my music schedule:\n\n🌅 6 AM: Acoustic folk (bon iver, fleet foxes)\n☕ 9 AM: Upbeat indie pop (vampire weekend, foster the people)\n🌞 12 PM: Whatever fits the mood\n🌆 6 PM: Hip-hop or electronic\n🌙 10 PM: Chill R&B or ambient\n\nmusic is my daily soundtrack 🎬',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌅', count: 78 }, { emoji: '🎬', count: 56 }]
      },
      {
        id: 18,
        user: 'WorkoutBeats',
        time: '7:30 AM',
        content: 'gym playlist question: what gets you more pumped? 💪\n\nA) Heavy metal/rock 🤘\nB) Hip-hop bangers 🎤\nC) Electronic/EDM 🎛️\nD) Pop hits 🎵\n\ncurrently on a Kendrick Lamar kick and "HUMBLE." makes me feel invincible 👑',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💪', count: 145 }, { emoji: '🤘', count: 67 }, { emoji: '🎤', count: 89 }, { emoji: '🎛️', count: 34 }, { emoji: '👑', count: 123 }]
      },
      {
        id: 19,
        user: 'EmotionalSupport',
        time: '4:45 PM',
        content: 'music therapy is real yall 💚\n\nhaving a rough day and Frank Ocean\'s "Pink + White" is healing my soul. sometimes you need songs that match your energy, sometimes you need ones that lift you up\n\nwhat\'s your go-to comfort album? 🤗',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💚', count: 234 }, { emoji: '🤗', count: 167 }]
      },
      {
        id: 20,
        user: 'TherapeuticTunes',
        time: '4:50 PM',
        content: '@EmotionalSupport sending virtual hugs 🫂\n\nmy comfort albums:\n• Norah Jones - "Come Away With Me" (when anxious)\n• Adele - "21" (when heartbroken)\n• Bob Marley - "Legend" (when need positivity)\n• Sigur Rós - "Ágætis byrjun" (when need to cry it out)\n\nmusic understands us when humans don\'t 💫',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🫂', count: 189 }, { emoji: '💫', count: 123 }]
      }
    ]
  }
];

// Server 4 - Midjourney (Keep existing content)
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

// Server 5 - Tech & Programming
const techChannels: Channel[] = [
  {
    id: 'tech-announcements',
    name: '📢-announcements',
    type: 'text',
    serverId: 5,
    description: 'Tech news and community updates',
    messages: [
      {
        id: 1,
        user: 'TechAdmin',
        time: '7:00 AM',
        content: '💻 **WELCOME TO DEV CENTRAL!** 💻\n\nThe ultimate community for developers, programmers, and tech enthusiasts!\n\n🔧 Get help with your code\n📚 Learn new technologies\n🤝 Network with other devs\n💼 Find job opportunities\n\nCheck out #rules and introduce yourself in #introductions!',
        isBot: true,
        isWelcome: true,
        hasReactions: true,
        reactions: [{ emoji: '💻', count: 2456 }, { emoji: '🚀', count: 1234 }, { emoji: '👨‍💻', count: 987 }]
      },
      {
        id: 2,
        user: 'ModTeam',
        time: '9:30 AM',
        content: '🎉 **NEW CHANNEL ALERT!**\n\nWe\'ve added #rust-lang for all you Rustaceans out there! 🦀\n\nAlso coming soon:\n• Monthly code challenges\n• Live coding sessions with industry pros\n• Resume review workshops\n\nStay tuned!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🦀', count: 567 }, { emoji: '🎉', count: 345 }]
      }
    ]
  },
  {
    id: 'general-tech',
    name: 'general',
    type: 'text',
    serverId: 5,
    description: 'General tech discussion',
    messages: [
      {
        id: 1,
        user: 'ReactDev2024',
        time: '10:15 AM',
        content: 'Has anyone tried the new React 19 features? The use() hook looks promising 🤔',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '⚛️', count: 45 }]
      },
      {
        id: 2,
        user: 'TypeScriptFan',
        time: '10:17 AM',
        content: '@ReactDev2024 Yeah! The Actions API is a game changer for forms. No more useFormState hacks',
        isBot: false
      },
      {
        id: 3,
        user: 'FullStackDev',
        time: '10:20 AM',
        content: 'Honestly the server components thing is still confusing to me. When do I use "use client" vs not?',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🤔', count: 67 }]
      },
      {
        id: 4,
        user: 'NextJSExpert',
        time: '10:22 AM',
        content: '@FullStackDev Simple rule: if it needs browser APIs (useState, onClick, useEffect) = use client. Otherwise server by default. Think of it as: server = data fetching, client = interactivity',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💡', count: 89 }, { emoji: '🙏', count: 34 }]
      },
      {
        id: 5,
        user: 'PythonDev',
        time: '10:45 AM',
        content: 'Meanwhile in Python land, FastAPI just keeps getting better. The new dependency injection system is *chef\'s kiss* 🐍',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🐍', count: 56 }]
      },
      {
        id: 6,
        user: 'GoLangGopher',
        time: '10:48 AM',
        content: '@PythonDev FastAPI is great but have you tried Go? No virtual envs, single binary deployment, blazing fast 🚀',
        isBot: false
      },
      {
        id: 7,
        user: 'PythonDev',
        time: '10:50 AM',
        content: 'Go is nice but I miss my list comprehensions and the ecosystem for ML/AI. Different tools for different jobs!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💯', count: 78 }]
      },
      {
        id: 8,
        user: 'RustEvangelist',
        time: '11:00 AM',
        content: '*laughs in memory safety* 🦀',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🦀', count: 234 }, { emoji: '😂', count: 156 }]
      },
      {
        id: 9,
        user: 'NewbieDev',
        time: '11:30 AM',
        content: 'Hey everyone! I\'m learning to code. Started with Python last week. Any tips for a complete beginner?',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '👋', count: 45 }, { emoji: '🎉', count: 34 }]
      },
      {
        id: 10,
        user: 'SeniorDev',
        time: '11:32 AM',
        content: '@NewbieDev Welcome! Best tips:\n1. Build projects, not just tutorials\n2. Read other people\'s code\n3. Don\'t compare yourself to others\n4. Google is your best friend\n5. Breaks are important - burnout is real',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🙏', count: 189 }, { emoji: '📝', count: 67 }]
      },
      {
        id: 11,
        user: 'OpenSourceContrib',
        time: '12:00 PM',
        content: 'Just got my first PR merged into a major open source project! 🎊 Took 3 weeks of back and forth but worth it',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎊', count: 456 }, { emoji: '👏', count: 234 }]
      },
      {
        id: 12,
        user: 'DevOpsGuru',
        time: '12:15 PM',
        content: 'Anyone else struggling with Kubernetes lately? Our cluster keeps having OOM issues and I can\'t figure out why',
        isBot: false
      },
      {
        id: 13,
        user: 'CloudArchitect',
        time: '12:18 PM',
        content: '@DevOpsGuru Check your resource limits vs requests ratio. Also look at vertical pod autoscaler - saved us so many headaches',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '☁️', count: 23 }]
      }
    ]
  },
  {
    id: 'help-desk',
    name: '🆘-help',
    type: 'text',
    serverId: 5,
    description: 'Get help with your code',
    messages: [
      {
        id: 1,
        user: 'HelpBot',
        time: '6:00 AM',
        content: '🆘 **HELP CHANNEL GUIDELINES** 🆘\n\nTo get the best help:\n\n1. **Describe your problem clearly**\n2. **Share relevant code** (use code blocks!)\n3. **Include error messages**\n4. **Mention what you\'ve tried**\n5. **Be patient and respectful**\n\nUse ``` for code blocks!\n\n```javascript\nconst example = "like this";\n```',
        isBot: true,
        isWelcome: true
      },
      {
        id: 2,
        user: 'StuckDeveloper',
        time: '1:45 PM',
        content: 'Can someone help me? My React app keeps re-rendering infinitely 😭\n\n```jsx\nuseEffect(() => {\n  setData(fetchData());\n}, [data]);\n```',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🔁', count: 23 }]
      },
      {
        id: 3,
        user: 'ReactMentor',
        time: '1:47 PM',
        content: '@StuckDeveloper Classic issue! You have `data` in your dependency array but you\'re also setting `data` inside the effect. This creates an infinite loop.\n\nFix:\n```jsx\nuseEffect(() => {\n  setData(fetchData());\n}, []); // Empty deps = runs once\n```\n\nOr if you need to refetch based on something else, use that as the dependency instead!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💡', count: 45 }, { emoji: '🙏', count: 34 }]
      },
      {
        id: 4,
        user: 'StuckDeveloper',
        time: '1:49 PM',
        content: '@ReactMentor THANK YOU! That fixed it. I was stuck on this for 2 hours 😅',
        isBot: false
      },
      {
        id: 5,
        user: 'CSSNightmare',
        time: '2:30 PM',
        content: 'Why won\'t my div center?? I\'ve tried everything!\n\n```css\n.container {\n  margin: auto;\n  text-align: center;\n}\n```',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😭', count: 89 }]
      },
      {
        id: 6,
        user: 'CSSWizard',
        time: '2:32 PM',
        content: '@CSSNightmare The classic struggle! Try flexbox:\n\n```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh; /* or parent height */\n}\n```\n\nOr grid:\n```css\n.container {\n  display: grid;\n  place-items: center;\n}\n```',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🎯', count: 67 }, { emoji: '✨', count: 45 }]
      }
    ]
  },
  {
    id: 'job-board',
    name: '💼-jobs',
    type: 'text',
    serverId: 5,
    description: 'Job postings and career opportunities',
    messages: [
      {
        id: 1,
        user: 'TechRecruiter',
        time: '9:00 AM',
        content: '🚀 **HIRING: Senior Frontend Developer** 🚀\n\n**Company:** TechCorp (YC-backed startup)\n**Location:** Remote (US/EU timezones)\n**Salary:** $150k-$200k + equity\n\n**Requirements:**\n• 5+ years React experience\n• TypeScript proficiency\n• Experience with design systems\n• Strong communication skills\n\n**Perks:**\n• Unlimited PTO\n• $5k learning budget\n• Latest MacBook Pro\n• Health/dental/vision\n\nDM me for details! 📩',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🚀', count: 234 }, { emoji: '💰', count: 156 }]
      },
      {
        id: 2,
        user: 'StartupFounder',
        time: '11:30 AM',
        content: '👋 **LOOKING FOR CO-FOUNDER**\n\nBuilding an AI-powered developer tool. Looking for a technical co-founder who\'s passionate about DX.\n\n• Pre-seed funded ($500k)\n• 50/50 equity split\n• Fully remote\n• Currently 2 people\n\nIdeal: Full-stack dev with AI/ML interest. Let\'s chat if interested!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🤝', count: 89 }, { emoji: '🧠', count: 45 }]
      },
      {
        id: 3,
        user: 'FreelanceHub',
        time: '2:00 PM',
        content: '💻 **FREELANCE GIG**\n\n**Project:** E-commerce website rebuild\n**Stack:** Next.js, Tailwind, Stripe\n**Budget:** $8,000-$12,000\n**Timeline:** 6 weeks\n\nClient is responsive and knows what they want. Previous site mockups available. Reply here or DM!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💻', count: 67 }]
      }
    ]
  }
];

// Server 6 - Anime & Manga Community
const animeChannels: Channel[] = [
  {
    id: 'anime-announcements',
    name: '📢-announcements',
    type: 'text',
    serverId: 6,
    description: 'Anime news and server updates',
    messages: [
      {
        id: 1,
        user: 'AnimeAdmin',
        time: '8:00 AM',
        content: '🌸 **WELCOME TO OTAKU PARADISE!** 🌸\n\nYour home for anime, manga, and Japanese culture!\n\n📺 Seasonal anime discussions\n📚 Manga recommendations\n🎌 Japanese language learning\n🎮 Anime games corner\n\nNo spoilers without tags! Use ||spoiler|| format.',
        isBot: true,
        isWelcome: true,
        hasReactions: true,
        reactions: [{ emoji: '🌸', count: 3456 }, { emoji: '✨', count: 2345 }, { emoji: '🎌', count: 1234 }]
      },
      {
        id: 2,
        user: 'NewsBot',
        time: '10:00 AM',
        content: '📰 **ANIME NEWS ROUNDUP**\n\n🔥 Chainsaw Man Part 2 anime confirmed for 2025!\n⚔️ Demon Slayer final arc movie announced\n🏴‍☠️ One Piece live action Season 2 in production\n🌟 Your Name director\'s new film releases next month\n\nDiscuss in #seasonal-anime!',
        isBot: true,
        hasReactions: true,
        reactions: [{ emoji: '🔥', count: 1567 }, { emoji: '⚔️', count: 892 }]
      }
    ]
  },
  {
    id: 'general-anime',
    name: 'general',
    type: 'text',
    serverId: 6,
    description: 'General anime discussion',
    messages: [
      {
        id: 1,
        user: 'AnimeFan2024',
        time: '11:00 AM',
        content: 'Just finished Frieren. That show hit different 🥺 The way it handles grief and the passage of time...',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🥺', count: 234 }, { emoji: '✨', count: 156 }]
      },
      {
        id: 2,
        user: 'MangaReader',
        time: '11:02 AM',
        content: '@AnimeFan2024 The manga goes even deeper! Highly recommend reading it. The art is beautiful',
        isBot: false
      },
      {
        id: 3,
        user: 'WeebSupreme',
        time: '11:05 AM',
        content: 'Frieren is peak but have yall seen Dungeon Meshi? Comfort food anime of the year 🍳',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🍳', count: 89 }, { emoji: '🐉', count: 67 }]
      },
      {
        id: 4,
        user: 'OldSchoolOtaku',
        time: '11:15 AM',
        content: 'Modern anime is great but nothing beats 90s/2000s vibes. Cowboy Bebop, Evangelion, Serial Experiments Lain... that era was special',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🤠', count: 145 }, { emoji: '🚀', count: 78 }]
      },
      {
        id: 5,
        user: 'NewToAnime',
        time: '11:30 AM',
        content: 'Hey! Just started watching anime. Finished Attack on Titan and loved it. What should I watch next?',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '👋', count: 45 }]
      },
      {
        id: 6,
        user: 'AnimeGuide',
        time: '11:32 AM',
        content: '@NewToAnime Great first choice! Based on AoT you might like:\n\n**Action/Drama:**\n• Vinland Saga\n• Jujutsu Kaisen\n• Demon Slayer\n\n**Mind-bending:**\n• Steins;Gate\n• Death Note\n• Code Geass\n\n**Emotional:**\n• Fullmetal Alchemist: Brotherhood\n• Hunter x Hunter\n\nFMAB is often considered the best anime ever, so that\'s a safe pick!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📝', count: 234 }, { emoji: '🙏', count: 156 }]
      },
      {
        id: 7,
        user: 'ShonenJumper',
        time: '12:00 PM',
        content: 'One Piece finally in its peak era 🏴‍☠️ Gear 5 was worth the 20+ year wait',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🏴‍☠️', count: 567 }, { emoji: '⚡', count: 345 }]
      },
      {
        id: 8,
        user: 'SliceOfLifeFan',
        time: '12:15 PM',
        content: 'Yall are sleeping on Spy x Family. Anya is carrying that show on her back 🥜',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🥜', count: 456 }, { emoji: '😂', count: 234 }]
      },
      {
        id: 9,
        user: 'HorrorAnimeEnjoyer',
        time: '12:30 PM',
        content: 'Anyone else hyped for Uzumaki adaptation? Junji Ito finally getting the anime treatment he deserves',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌀', count: 89 }, { emoji: '😱', count: 67 }]
      },
      {
        id: 10,
        user: 'CasualViewer',
        time: '1:00 PM',
        content: 'Hot take: sub > dub for everything except Cowboy Bebop and Ghost Stories 🎤',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🔥', count: 234 }, { emoji: '👎', count: 123 }]
      }
    ]
  },
  {
    id: 'manga-corner',
    name: '📚-manga',
    type: 'text',
    serverId: 6,
    description: 'Manga discussion and recommendations',
    messages: [
      {
        id: 1,
        user: 'MangaCollector',
        time: '10:00 AM',
        content: 'My manga collection just hit 500 volumes! 📚 Starting to run out of shelf space lol',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📚', count: 345 }, { emoji: '😮', count: 156 }]
      },
      {
        id: 2,
        user: 'DigitalReader',
        time: '10:05 AM',
        content: '@MangaCollector That\'s impressive! I went full digital after moving twice. My Kindle has like 2000+ chapters saved',
        isBot: false
      },
      {
        id: 3,
        user: 'PhysicalGang',
        time: '10:08 AM',
        content: 'Nothing beats the feeling of physical volumes though. The smell of new manga pages 👃✨',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '✨', count: 89 }]
      },
      {
        id: 4,
        user: 'WeeklyJumpFan',
        time: '11:00 AM',
        content: 'This week\'s Jump was CRAZY. ||Jujutsu Kaisen chapter had me screaming|| 😱',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😱', count: 234 }]
      }
    ]
  }
];

// Server 7 - Fitness & Health
const fitnessChannels: Channel[] = [
  {
    id: 'fitness-announcements',
    name: '📢-announcements',
    type: 'text',
    serverId: 7,
    description: 'Fitness community updates',
    messages: [
      {
        id: 1,
        user: 'FitAdmin',
        time: '5:00 AM',
        content: '💪 **WELCOME TO GAINS NATION!** 💪\n\nYour community for fitness, health, and self-improvement!\n\n🏋️ Workout tips & form checks\n🥗 Nutrition & meal prep\n🏃 Cardio & endurance\n🧘 Mental health & wellness\n\nRemember: Every rep counts, every meal matters, every day is progress! 🔥',
        isBot: true,
        isWelcome: true,
        hasReactions: true,
        reactions: [{ emoji: '💪', count: 4567 }, { emoji: '🔥', count: 3456 }, { emoji: '🏆', count: 2345 }]
      },
      {
        id: 2,
        user: 'ChallengeBot',
        time: '6:00 AM',
        content: '🎯 **JANUARY CHALLENGE: 75 HARD LITE**\n\nModified version for our community:\n\n✅ 45 min workout daily\n✅ Drink 3L water\n✅ No alcohol\n✅ Follow a diet (your choice)\n✅ 10 min reading/learning\n\n**Prize:** Custom role + $50 gift card\n\nSign up in #challenges!',
        isBot: true,
        hasReactions: true,
        reactions: [{ emoji: '🎯', count: 892 }, { emoji: '💪', count: 567 }]
      }
    ]
  },
  {
    id: 'general-fitness',
    name: 'general',
    type: 'text',
    serverId: 7,
    description: 'General fitness discussion',
    messages: [
      {
        id: 1,
        user: 'GymRat2024',
        time: '6:30 AM',
        content: 'Early morning grind! 5AM gym hits different when you\'re the only one there 🌅',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌅', count: 234 }, { emoji: '💪', count: 156 }]
      },
      {
        id: 2,
        user: 'NightOwlLifter',
        time: '6:32 AM',
        content: '@GymRat2024 5AM?? I\'m still at the gym from last night\'s session lol jk. Night gym supremacy 🌙',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🌙', count: 89 }]
      },
      {
        id: 3,
        user: 'BeginnerGains',
        time: '8:00 AM',
        content: 'Been lifting for 3 months now and finally seeing newbie gains! Bench went from 95 to 135 lbs 📈',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📈', count: 456 }, { emoji: '🎉', count: 345 }]
      },
      {
        id: 4,
        user: 'VeteranLifter',
        time: '8:05 AM',
        content: '@BeginnerGains Love to see it! Those newbie gains are amazing. Keep it up and you\'ll hit 225 before you know it',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🙌', count: 78 }]
      },
      {
        id: 5,
        user: 'FormChecker',
        time: '9:00 AM',
        content: 'Posted a squat form check video in #form-checks. Please roast my form, I want to improve before going heavier 🏋️',
        isBot: false
      },
      {
        id: 6,
        user: 'PowerlifterPete',
        time: '9:15 AM',
        content: '@FormChecker Just watched it - depth looks good! Two things:\n1. Keep your chest up more at the bottom\n2. Drive through your whole foot, not just heels\n\nOverall solid though! 👍',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '👍', count: 67 }, { emoji: '📝', count: 34 }]
      },
      {
        id: 7,
        user: 'CardioQueen',
        time: '10:00 AM',
        content: 'Just ran my first half marathon! 2:15 finish time. Never thought I could do it 🏃‍♀️🎉',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🏃‍♀️', count: 567 }, { emoji: '🎉', count: 456 }, { emoji: '🏅', count: 345 }]
      },
      {
        id: 8,
        user: 'MarathonMike',
        time: '10:05 AM',
        content: '@CardioQueen That\'s an amazing first time! The first one is always the hardest. Full marathon next? 😏',
        isBot: false
      },
      {
        id: 9,
        user: 'HomeGymOwner',
        time: '11:00 AM',
        content: 'Finally completed my home gym setup! Power rack, adjustable dumbbells, cable machine. Never need a commercial gym again 🏠💪',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🏠', count: 234 }, { emoji: '💪', count: 156 }]
      },
      {
        id: 10,
        user: 'BudgetFitness',
        time: '11:10 AM',
        content: '@HomeGymOwner How much did that set you back? Been thinking about it but worried about the cost',
        isBot: false
      },
      {
        id: 11,
        user: 'HomeGymOwner',
        time: '11:12 AM',
        content: '@BudgetFitness About $3k total but I bought most stuff used from Facebook Marketplace. Worth it - gym membership was $80/month and I save 2 hours commute time daily',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💰', count: 89 }]
      }
    ]
  },
  {
    id: 'nutrition',
    name: '🥗-nutrition',
    type: 'text',
    serverId: 7,
    description: 'Nutrition, diet, and meal prep',
    messages: [
      {
        id: 1,
        user: 'MealPrepKing',
        time: '7:00 AM',
        content: 'Sunday meal prep done! 15 containers ready for the week:\n\n• Chicken breast + rice + broccoli\n• Ground turkey + sweet potato + green beans\n• Salmon + quinoa + asparagus\n\nTotal: ~2400 calories/day, 180g protein 🍱',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🍱', count: 345 }, { emoji: '🔥', count: 234 }]
      },
      {
        id: 2,
        user: 'BulkingSeason',
        time: '9:00 AM',
        content: 'Trying to eat 3500 calories clean is actually so hard. My stomach can\'t handle this much food 😫',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😫', count: 156 }]
      },
      {
        id: 3,
        user: 'NutritionCoach',
        time: '9:05 AM',
        content: '@BulkingSeason Tips for clean bulk calories:\n• Olive oil in everything (+120 cal/tbsp)\n• Nut butters (calorie dense)\n• Dried fruits\n• Mass gainer shakes\n• Eat more frequently, smaller portions\n\nDon\'t force it - gradual increase works better!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📝', count: 234 }, { emoji: '🙏', count: 156 }]
      },
      {
        id: 4,
        user: 'CuttingCrew',
        time: '10:00 AM',
        content: 'On a 500 cal deficit and the hunger is REAL. Any tips for staying full?',
        isBot: false
      },
      {
        id: 5,
        user: 'SatietyScience',
        time: '10:05 AM',
        content: '@CuttingCrew Volume eating is key:\n• Huge salads with lean protein\n• Air-popped popcorn (snack goat)\n• Greek yogurt + berries\n• Egg whites (17 cal each!)\n• Sugar-free jello\n• WATER. So much water.\n\nAlso caffeine is your friend during cuts 🧊',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🥗', count: 189 }, { emoji: '💡', count: 89 }]
      }
    ]
  }
];

// Server 8 - Movie & TV Enthusiasts
const movieChannels: Channel[] = [
  {
    id: 'movie-announcements',
    name: '📢-announcements',
    type: 'text',
    serverId: 8,
    description: 'Movie news and community updates',
    messages: [
      {
        id: 1,
        user: 'CinemaAdmin',
        time: '9:00 AM',
        content: '🎬 **WELCOME TO CINEMA CENTRAL!** 🎬\n\nThe ultimate community for movie & TV lovers!\n\n🍿 Movie reviews & discussions\n📺 TV show watch parties\n🎭 Actor/Director spotlights\n🏆 Awards season coverage\n\n**SPOILER RULES:** Use ||spoiler tags|| for anything less than 2 weeks old!',
        isBot: true,
        isWelcome: true,
        hasReactions: true,
        reactions: [{ emoji: '🎬', count: 2345 }, { emoji: '🍿', count: 1890 }, { emoji: '📺', count: 1456 }]
      }
    ]
  },
  {
    id: 'general-movies',
    name: 'general',
    type: 'text',
    serverId: 8,
    description: 'General movie and TV discussion',
    messages: [
      {
        id: 1,
        user: 'FilmBuff',
        time: '10:00 AM',
        content: 'Just watched Oppenheimer again. Nolan really outdid himself. That practical IMAX footage is insane 🎥',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💣', count: 234 }, { emoji: '🎥', count: 156 }]
      },
      {
        id: 2,
        user: 'CasualViewer',
        time: '10:05 AM',
        content: '@FilmBuff I still need to see it! Is it worth the 3 hour runtime?',
        isBot: false
      },
      {
        id: 3,
        user: 'FilmBuff',
        time: '10:07 AM',
        content: '@CasualViewer Absolutely. Doesn\'t feel like 3 hours honestly. The pacing is incredible. Just don\'t try to watch it on your phone lol',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '👍', count: 67 }]
      },
      {
        id: 4,
        user: 'HorrorFanatic',
        time: '11:00 AM',
        content: 'Horror movie recommendations? Already seen all the classics. Need something obscure 🎃',
        isBot: false
      },
      {
        id: 5,
        user: 'GenreExpert',
        time: '11:05 AM',
        content: '@HorrorFanatic Try these hidden gems:\n• Noroi: The Curse (Japanese, found footage)\n• Lake Mungo (Australian, slow burn)\n• Pontypool (Canadian, unique concept)\n• The Wailing (Korean, absolutely terrifying)\n• Possum (British, disturbing AF)\n\nWarning: These are NOT casual watches 😱',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😱', count: 189 }, { emoji: '📝', count: 134 }]
      },
      {
        id: 6,
        user: 'TVShowAddict',
        time: '12:00 PM',
        content: 'Just binged Shogun in 2 days. Why is nobody talking about this show?? It\'s a masterpiece 🇯🇵',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🇯🇵', count: 345 }, { emoji: '⚔️', count: 234 }]
      },
      {
        id: 7,
        user: 'PeakTVEnjoyer',
        time: '12:05 PM',
        content: '@TVShowAddict RIGHT?? The production value is insane. Hiroyuki Sanada deserves all the awards',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🏆', count: 156 }]
      },
      {
        id: 8,
        user: 'MarvelDCFan',
        time: '1:00 PM',
        content: 'Hot take: The superhero genre isn\'t dead, studios just need to stop making mediocre content and actually try again',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🔥', count: 234 }, { emoji: '💯', count: 178 }]
      },
      {
        id: 9,
        user: 'SuperheroSkeptic',
        time: '1:05 PM',
        content: '@MarvelDCFan Hard disagree. We\'ve had like 50 superhero movies in 10 years. Time for something new',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🤔', count: 89 }]
      },
      {
        id: 10,
        user: 'ClassicCinemaLover',
        time: '2:00 PM',
        content: 'Just introduced my kids to The Princess Bride. Their reaction to "Hello, my name is Inigo Montoya" was priceless 😂⚔️',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '⚔️', count: 456 }, { emoji: '😂', count: 345 }, { emoji: '❤️', count: 234 }]
      }
    ]
  },
  {
    id: 'streaming-recs',
    name: '📺-streaming',
    type: 'text',
    serverId: 8,
    description: 'What to watch on streaming services',
    messages: [
      {
        id: 1,
        user: 'StreamingGuide',
        time: '10:00 AM',
        content: '📺 **THIS WEEK\'S PICKS**\n\n**Netflix:**\n• 3 Body Problem (Sci-fi epic)\n• Ripley (Noir thriller)\n\n**Max:**\n• True Detective: Night Country\n• The Curse\n\n**Apple TV+:**\n• Severance S2 (when it drops)\n• Slow Horses\n\n**Prime:**\n• Fallout (surprisingly good!)\n• Mr. & Mrs. Smith',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📺', count: 567 }, { emoji: '📝', count: 234 }]
      },
      {
        id: 2,
        user: 'BingeWatcher',
        time: '11:00 AM',
        content: 'Can we talk about how Apple TV+ is quietly putting out the best content? Severance, For All Mankind, Slow Horses... all bangers',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🍎', count: 234 }, { emoji: '💯', count: 156 }]
      },
      {
        id: 3,
        user: 'NetflixNerd',
        time: '11:05 AM',
        content: '@BingeWatcher True but their release schedule is painful. One season every 2 years is rough',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😢', count: 89 }]
      }
    ]
  }
];

// Server 9 - Crypto & Finance
const cryptoChannels: Channel[] = [
  {
    id: 'crypto-announcements',
    name: '📢-announcements',
    type: 'text',
    serverId: 9,
    description: 'Crypto news and market updates',
    messages: [
      {
        id: 1,
        user: 'CryptoAdmin',
        time: '6:00 AM',
        content: '📈 **WELCOME TO CRYPTO CENTRAL!** 📈\n\nYour hub for cryptocurrency and financial discussion!\n\n💰 Market analysis & news\n📊 Trading strategies\n🔐 Security best practices\n💎 Long-term investing\n\n⚠️ **DISCLAIMER:** Not financial advice. DYOR. Never invest more than you can afford to lose.',
        isBot: true,
        isWelcome: true,
        hasReactions: true,
        reactions: [{ emoji: '📈', count: 3456 }, { emoji: '💰', count: 2345 }, { emoji: '💎', count: 1890 }]
      }
    ]
  },
  {
    id: 'general-crypto',
    name: 'general',
    type: 'text',
    serverId: 9,
    description: 'General crypto discussion',
    messages: [
      {
        id: 1,
        user: 'BitcoinMaxi',
        time: '7:00 AM',
        content: 'ETF approval was huge but this is just the beginning. Institutional adoption is going to be massive 📈',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📈', count: 345 }, { emoji: '🚀', count: 234 }]
      },
      {
        id: 2,
        user: 'AltcoinTrader',
        time: '7:05 AM',
        content: 'BTC pumps, alts dump. Then BTC consolidates and alts pump. Same cycle every time 🔄',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🔄', count: 156 }]
      },
      {
        id: 3,
        user: 'DeFiDegen',
        time: '8:00 AM',
        content: 'New yield farm on Arbitrum looking juicy 👀 30% APY on stables. Anyone looked into it?',
        isBot: false
      },
      {
        id: 4,
        user: 'SafetyFirst',
        time: '8:05 AM',
        content: '@DeFiDegen Be careful with those yields. If it seems too good to be true... Check if it\'s audited, how long it\'s been running, and always start small',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '⚠️', count: 89 }, { emoji: '👍', count: 67 }]
      },
      {
        id: 5,
        user: 'HODLer',
        time: '9:00 AM',
        content: 'Remember: Time in the market > timing the market. Been holding since 2017 and not selling until 2030 at least 💎🙌',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💎', count: 456 }, { emoji: '🙌', count: 345 }]
      },
      {
        id: 6,
        user: 'TradingNewbie',
        time: '10:00 AM',
        content: 'Can someone explain what a stop-loss is? I keep seeing it mentioned but don\'t understand',
        isBot: false
      },
      {
        id: 7,
        user: 'TradingMentor',
        time: '10:05 AM',
        content: '@TradingNewbie It\'s an order that automatically sells your position if the price drops to a certain level. Protects you from big losses.\n\nExample: Buy BTC at $50k, set stop-loss at $45k. If BTC drops to $45k, it auto-sells. Max loss = 10%.\n\nAbsolutely essential for risk management!',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '📚', count: 234 }, { emoji: '🙏', count: 156 }]
      },
      {
        id: 8,
        user: 'NFTSkeptic',
        time: '11:00 AM',
        content: 'NFT market is so dead. Remember when people were paying millions for JPEGs? 💀',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💀', count: 345 }, { emoji: '😂', count: 234 }]
      },
      {
        id: 9,
        user: 'NFTBeliever',
        time: '11:05 AM',
        content: '@NFTSkeptic The speculative bubble popped but the tech is still useful. Gaming, ticketing, digital ownership... just needs real utility',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '🤔', count: 89 }]
      }
    ]
  },
  {
    id: 'security-tips',
    name: '🔐-security',
    type: 'text',
    serverId: 9,
    description: 'Crypto security best practices',
    messages: [
      {
        id: 1,
        user: 'SecurityBot',
        time: '12:00 AM',
        content: '🔐 **CRYPTO SECURITY ESSENTIALS**\n\n**Must-Do:**\n✅ Use hardware wallet for large holdings\n✅ Enable 2FA (preferably hardware key)\n✅ Never share seed phrase - EVER\n✅ Use unique passwords everywhere\n✅ Verify URLs before connecting wallet\n\n**Red Flags:**\n🚩 "Send crypto to receive more"\n🚩 "Connect wallet" on random sites\n🚩 DMs asking for seed phrase\n🚩 Too-good-to-be-true yields\n🚩 Urgency/FOMO tactics\n\n**Remember:** Not your keys, not your crypto!',
        isBot: true,
        hasReactions: true,
        reactions: [{ emoji: '🔐', count: 567 }, { emoji: '📝', count: 345 }]
      },
      {
        id: 2,
        user: 'ScamVictim',
        time: '2:00 PM',
        content: 'PSA: Got phished yesterday. Clicked a fake Uniswap link from Google ads. Lost 0.5 ETH 😭 Please triple-check URLs',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '😭', count: 234 }, { emoji: '🙏', count: 156 }]
      },
      {
        id: 3,
        user: 'SecurityExpert',
        time: '2:05 PM',
        content: '@ScamVictim Sorry to hear that. Tip: Bookmark official sites and ONLY use bookmarks. Never Google DeFi platforms - ads are full of scams',
        isBot: false,
        hasReactions: true,
        reactions: [{ emoji: '💡', count: 345 }]
      }
    ]
  }
];

// Server member interface for unified member list
export interface ServerMember {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  activity?: string;
  role?: 'owner' | 'admin' | 'moderator' | 'member';
  inVoice?: string;
}

// Server role assignments
const serverRoles: Record<number, Record<string, 'owner' | 'admin' | 'moderator' | 'member'>> = {
  2: { // Gaming Hub
    "EsportsManager": "admin",
    "TwitchStreamerPro": "moderator",
    "CommunityManager": "admin",
    "DevTeam": "admin",
    "GuildMaster": "owner",
    "ModeratorX": "moderator",
    "ValorantCoach": "moderator",
    "StreamerPro": "moderator"
  },
  3: { // Music Lovers
    "CommunityDJ": "owner",
    "VinylCollector": "admin",
    "MelodyExplorer": "moderator",
    "SynthMaster": "moderator"
  },
  4: { // Midjourney
    "MidJourneyPro": "admin",
    "TutorialGuru": "moderator",
    "CreativeGenius": "moderator"
  },
  5: { // Dev Central
    "SeniorDev": "owner",
    "ReactMentor": "admin",
    "DevOpsGuru": "admin",
    "InterviewCoach": "moderator"
  },
  6: { // Otaku Paradise
    "AnimeGuide": "owner",
    "OldSchoolOtaku": "admin",
    "WeebSupreme": "moderator"
  },
  7: { // Gains Nation
    "NutritionCoach": "owner",
    "VeteranLifter": "admin",
    "FormChecker": "moderator"
  },
  8: { // Cinema Central
    "FilmBuff": "owner",
    "GenreExpert": "admin",
    "MovieReviewer": "moderator"
  },
  9: { // Crypto Central
    "TradingMentor": "owner",
    "ChartAnalyst": "admin",
    "SecurityExpert": "moderator",
    "RiskManager": "moderator"
  }
};

// Helper function to get server members
export const getServerMembers = (serverId: number): ServerMember[] => {
  const server = servers.find(s => s.id === serverId);
  if (!server) return [];
  
  const memberMap = new Map<string, ServerMember>();
  const roles = serverRoles[serverId] || {};
  
  // Add voice channel users (they're online with activity)
  server.voiceChannels.forEach(vc => {
    (vc.userList || []).forEach(name => {
      memberMap.set(name, {
        id: name.toLowerCase().replace(/\s/g, '-'),
        name,
        status: 'online',
        activity: `In 🔊 ${vc.name}`,
        role: roles[name] || 'member',
        inVoice: vc.name
      });
    });
  });
  
  // Add message authors from text channels
  server.textChannels.forEach(ch => {
    ch.messages.forEach(msg => {
      if (!msg.isBot && msg.user !== 'You' && !memberMap.has(msg.user)) {
        // Assign varied statuses
        const rand = Math.random();
        let status: 'online' | 'idle' | 'dnd' | 'offline' = 'online';
        if (rand > 0.7) status = 'offline';
        else if (rand > 0.5) status = 'idle';
        else if (rand > 0.4) status = 'dnd';
        
        memberMap.set(msg.user, {
          id: msg.user.toLowerCase().replace(/\s/g, '-'),
          name: msg.user,
          status,
          role: roles[msg.user] || 'member'
        });
      }
    });
  });
  
  return Array.from(memberMap.values());
};

export const servers: Server[] = [
  {
    id: 2,
    name: "Gaming Hub",
    icon: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=64&h=64&fit=crop",
    textChannels: gamingChannels,
    voiceChannels: [
      { name: "Gaming Lounge", users: 4, userList: ["xXGamerGodXx", "ClutchMaster", "TacticalGenius", "StreamerPro"] },
      { name: "Valorant Ranked", users: 5, userList: ["RadiantChaser", "DuelMaster", "SmokeSpammer", "EntryFragger", "ValorantCoach"] },
      { name: "Stream Chat", users: 2, userList: ["TwitchStreamerPro", "ViewerSupreme"] },
      { name: "Tournament Arena", users: 0 },
      { name: "AFK", users: 1, userList: ["RageQuitter2024"] }
    ]
  },
  {
    id: 3,
    name: "Music Lovers",
    icon: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=64&h=64&fit=crop",
    textChannels: musicChannels,
    voiceChannels: [
      { name: "🎧 Listening Party", users: 6, userList: ["MelodyExplorer", "LoFiVibes", "MetalHead666", "VinylCollector", "PopPrincess", "IndieDiscoverer"] },
      { name: "🎤 DJ Booth", users: 2, userList: ["CommunityDJ", "SynthMaster"] },
      { name: "🎸 Jam Session", users: 3, userList: ["GuitarHero", "BassLegend", "DrummingDave"] },
      { name: "💿 Vinyl Corner", users: 0 },
      { name: "🎼 Production Talk", users: 1, userList: ["BeatMaker3000"] }
    ]
  },
  {
    id: 4,
    name: "Midjourney",
    icon: "/lovable-uploads/ca8cef9f-1434-48e7-a22c-29adeb14325a.png",
    textChannels: midjourneyChannels,
    voiceChannels: [
      { name: "General Chat", users: 3, userList: ["MidJourneyPro", "AIEnthusiast", "CreativeGenius"] },
      { name: "🎨 Creative Session", users: 2, userList: ["ArtDirector", "ConceptArtist"] },
      { name: "Help Desk", users: 1, userList: ["TutorialGuru"] }
    ]
  },
  {
    id: 5,
    name: "Dev Central",
    icon: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=64&h=64&fit=crop",
    textChannels: techChannels,
    voiceChannels: [
      { name: "Code Review", users: 4, userList: ["ReactDev2024", "TypeScriptFan", "SeniorDev", "FullStackDev"] },
      { name: "Pair Programming", users: 2, userList: ["NewbieDev", "ReactMentor"] },
      { name: "Interview Prep", users: 0 },
      { name: "Rubber Duck", users: 1, userList: ["DebugDuck"] }
    ]
  },
  {
    id: 6,
    name: "Otaku Paradise",
    icon: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=64&h=64&fit=crop",
    textChannels: animeChannels,
    voiceChannels: [
      { name: "Watch Party", users: 7, userList: ["AnimeFan2024", "MangaReader", "WeebSupreme", "OldSchoolOtaku", "AnimeGuide", "ShonenJumper", "SliceOfLifeFan"] },
      { name: "Manga Readers", users: 3, userList: ["ChapterDropper", "WeeklyWaiter", "VolumeCollector"] },
      { name: "Cosplay Corner", users: 0 },
      { name: "Japanese Learning", users: 2, userList: ["N5Student", "KanjiKing"] }
    ]
  },
  {
    id: 7,
    name: "Gains Nation",
    icon: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=64&h=64&fit=crop",
    textChannels: fitnessChannels,
    voiceChannels: [
      { name: "Gym Talk", users: 5, userList: ["GymRat2024", "VeteranLifter", "FormChecker", "NutritionCoach", "PowerlifterPete"] },
      { name: "Running Club", users: 2, userList: ["CardioQueen", "MarathonMike"] },
      { name: "Yoga & Mobility", users: 0 },
      { name: "Accountability", users: 1, userList: ["DailyChecker"] }
    ]
  },
  {
    id: 8,
    name: "Cinema Central",
    icon: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=64&h=64&fit=crop",
    textChannels: movieChannels,
    voiceChannels: [
      { name: "Watch Party", users: 4, userList: ["FilmBuff", "CasualViewer", "HorrorFanatic", "GenreExpert"] },
      { name: "Film Critics", users: 2, userList: ["MovieReviewer", "CinematographyFan"] },
      { name: "Spoiler Zone", users: 0 }
    ]
  },
  {
    id: 9,
    name: "Crypto Central",
    icon: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=64&h=64&fit=crop",
    textChannels: cryptoChannels,
    voiceChannels: [
      { name: "Market Discussion", users: 6, userList: ["BitcoinMaxi", "TradingMentor", "ChartAnalyst", "HODLer", "DeFiDegen", "MacroTrader"] },
      { name: "Trading Floor", users: 3, userList: ["DayTrader", "SwingTrader", "RiskManager"] },
      { name: "DeFi Discussion", users: 0 },
      { name: "Security Help", users: 1, userList: ["SecurityExpert"] }
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
