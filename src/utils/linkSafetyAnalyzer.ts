
export interface LinkSafetyResult {
  url: string;
  status: 'safe' | 'suspicious' | 'dangerous';
  reasons: string[];
  confidence: number;
}

export interface LinkAnalysisResult {
  url: string;
  purpose: string;
  category: 'registration' | 'learning' | 'product' | 'support' | 'community' | 'download' | 'documentation' | 'pricing' | 'blog' | 'social' | 'other';
  description: string;
  relevance: number;
}

export interface LinkSafetyReport {
  totalLinks: number;
  safeLinks: number;
  suspiciousLinks: number;
  dangerousLinks: number;
  results: LinkSafetyResult[];
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

export const extractLinksFromText = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches.map(url => url.replace(/[.,;:]$/, '')) : [];
};

export const analyzeLinkPurpose = (url: string): LinkAnalysisResult => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();
    const fullUrl = url.toLowerCase();

    // Registration/Signup patterns
    if (path.includes('signup') || path.includes('register') || path.includes('join') || path.includes('create-account')) {
      return {
        url,
        purpose: 'Account registration and signup',
        category: 'registration',
        description: 'Create a new account or register for the service',
        relevance: 0.95
      };
    }

    // Learning/Tutorial patterns
    if (path.includes('learn') || path.includes('tutorial') || path.includes('guide') || path.includes('getting-started') || path.includes('docs')) {
      return {
        url,
        purpose: 'Learning resources and tutorials',
        category: 'learning',
        description: 'Educational content, guides, and learning materials',
        relevance: 0.9
      };
    }

    // Product information
    if (path.includes('product') || path.includes('features') || path.includes('about') || domain.includes('midjourney')) {
      return {
        url,
        purpose: 'Product information and features',
        category: 'product',
        description: 'Learn about product features and capabilities',
        relevance: 0.85
      };
    }

    // Support patterns
    if (path.includes('support') || path.includes('help') || path.includes('faq') || path.includes('contact')) {
      return {
        url,
        purpose: 'Customer support and help',
        category: 'support',
        description: 'Get help, support, or contact information',
        relevance: 0.8
      };
    }

    // Community patterns
    if (path.includes('community') || path.includes('forum') || domain.includes('discord') || domain.includes('reddit')) {
      return {
        url,
        purpose: 'Community and social interaction',
        category: 'community',
        description: 'Join communities, forums, and social discussions',
        relevance: 0.75
      };
    }

    // Documentation
    if (path.includes('documentation') || path.includes('api') || path.includes('reference')) {
      return {
        url,
        purpose: 'Technical documentation',
        category: 'documentation',
        description: 'Technical docs, API references, and developer resources',
        relevance: 0.7
      };
    }

    // Pricing
    if (path.includes('pricing') || path.includes('plans') || path.includes('subscribe')) {
      return {
        url,
        purpose: 'Pricing and subscription plans',
        category: 'pricing',
        description: 'View pricing options and subscription plans',
        relevance: 0.85
      };
    }

    // Download patterns
    if (path.includes('download') || path.includes('install') || path.includes('app')) {
      return {
        url,
        purpose: 'Downloads and applications',
        category: 'download',
        description: 'Download software, apps, or files',
        relevance: 0.8
      };
    }

    // Blog/News
    if (path.includes('blog') || path.includes('news') || path.includes('updates')) {
      return {
        url,
        purpose: 'Blog and news updates',
        category: 'blog',
        description: 'Latest news, updates, and blog posts',
        relevance: 0.6
      };
    }

    // Social media
    if (domain.includes('twitter') || domain.includes('instagram') || domain.includes('facebook') || domain.includes('linkedin')) {
      return {
        url,
        purpose: 'Social media presence',
        category: 'social',
        description: 'Follow on social media platforms',
        relevance: 0.5
      };
    }

    // Default case
    return {
      url,
      purpose: 'General website or resource',
      category: 'other',
      description: 'General web resource or information',
      relevance: 0.3
    };

  } catch (error) {
    return {
      url,
      purpose: 'Unknown or invalid link',
      category: 'other',
      description: 'Unable to analyze this link',
      relevance: 0.1
    };
  }
};

export const analyzeLinkSafety = (url: string): LinkSafetyResult => {
  const reasons: string[] = [];
  let status: 'safe' | 'suspicious' | 'dangerous' = 'safe';
  let confidence = 0.8;

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();

    // Check against known malicious domains
    if (MALICIOUS_DOMAINS.some(malicious => domain.includes(malicious))) {
      status = 'dangerous';
      reasons.push('Domain is on known malicious list');
      confidence = 0.95;
      return { url, status, reasons, confidence };
    }

    // Check against safe domains
    if (SAFE_DOMAINS.some(safe => domain.includes(safe))) {
      status = 'safe';
      reasons.push('Domain is on trusted list');
      confidence = 0.9;
      return { url, status, reasons, confidence };
    }

    // Check for suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(domain)) {
        status = 'suspicious';
        reasons.push('Domain matches suspicious pattern');
        confidence = 0.7;
        break;
      }
    }

    // Check for Discord invite links
    if (domain.includes('discord.gg') || domain.includes('discord.com/invite')) {
      status = 'safe';
      reasons.push('Official Discord invite link');
      confidence = 0.85;
    }

    // Check URL structure
    if (urlObj.pathname.includes('..') || urlObj.pathname.includes('%')) {
      status = 'suspicious';
      reasons.push('Suspicious URL structure detected');
      confidence = 0.6;
    }

    // Check for file downloads
    if (urlObj.pathname.match(/\.(exe|zip|rar|bat|scr|com|pif)$/i)) {
      status = 'suspicious';
      reasons.push('Direct file download detected - exercise caution');
      confidence = 0.5;
    }

    // Default assessment
    if (reasons.length === 0) {
      reasons.push('No obvious security concerns detected');
    }

  } catch (error) {
    status = 'suspicious';
    reasons.push('Invalid URL format');
    confidence = 0.3;
  }

  return { url, status, reasons, confidence };
};

export const generateSafetyReport = (links: string[]): LinkSafetyReport => {
  const results = links.map(analyzeLinkSafety);
  
  return {
    totalLinks: results.length,
    safeLinks: results.filter(r => r.status === 'safe').length,
    suspiciousLinks: results.filter(r => r.status === 'suspicious').length,
    dangerousLinks: results.filter(r => r.status === 'dangerous').length,
    results
  };
};

export const generateSmartLinkResponse = (userQuery: string, links: string[]): string => {
  if (links.length === 0) {
    return "I don't see any links in the recent messages to analyze. Could you share the links you're asking about?";
  }

  const linkAnalyses = links.map(analyzeLinkPurpose);
  const query = userQuery.toLowerCase();

  // Determine what the user is looking for
  let intent = 'general';
  let relevantLinks: LinkAnalysisResult[] = [];

  if (query.includes('register') || query.includes('signup') || query.includes('create account') || query.includes('join')) {
    intent = 'registration';
    relevantLinks = linkAnalyses.filter(link => link.category === 'registration').sort((a, b) => b.relevance - a.relevance);
  } else if (query.includes('learn') || query.includes('tutorial') || query.includes('guide') || query.includes('how to')) {
    intent = 'learning';
    relevantLinks = linkAnalyses.filter(link => link.category === 'learning' || link.category === 'documentation').sort((a, b) => b.relevance - a.relevance);
  } else if (query.includes('product') || query.includes('features') || query.includes('what is') || query.includes('about')) {
    intent = 'product';
    relevantLinks = linkAnalyses.filter(link => link.category === 'product' || link.category === 'learning').sort((a, b) => b.relevance - a.relevance);
  } else if (query.includes('support') || query.includes('help') || query.includes('problem') || query.includes('issue')) {
    intent = 'support';
    relevantLinks = linkAnalyses.filter(link => link.category === 'support').sort((a, b) => b.relevance - a.relevance);
  } else if (query.includes('pricing') || query.includes('cost') || query.includes('price') || query.includes('subscribe')) {
    intent = 'pricing';
    relevantLinks = linkAnalyses.filter(link => link.category === 'pricing').sort((a, b) => b.relevance - a.relevance);
  } else if (query.includes('download') || query.includes('install') || query.includes('app')) {
    intent = 'download';
    relevantLinks = linkAnalyses.filter(link => link.category === 'download').sort((a, b) => b.relevance - a.relevance);
  } else if (query.includes('community') || query.includes('forum') || query.includes('discuss')) {
    intent = 'community';
    relevantLinks = linkAnalyses.filter(link => link.category === 'community').sort((a, b) => b.relevance - a.relevance);
  }

  // If no specific matches, show all links sorted by relevance
  if (relevantLinks.length === 0) {
    relevantLinks = linkAnalyses.sort((a, b) => b.relevance - a.relevance);
  }

  // Generate response
  let response = `🔍 **Smart Link Analysis**\n\n`;
  
  if (relevantLinks.length > 0) {
    response += `Based on your question about **${intent}**, here are the most relevant links:\n\n`;
    
    relevantLinks.slice(0, 3).forEach((link, index) => {
      const emoji = link.category === 'registration' ? '📝' : 
                   link.category === 'learning' ? '📚' : 
                   link.category === 'product' ? '🚀' : 
                   link.category === 'support' ? '🛟' : 
                   link.category === 'pricing' ? '💰' : 
                   link.category === 'download' ? '⬇️' : 
                   link.category === 'community' ? '👥' : '🔗';
      
      response += `**${index + 1}. ${emoji} ${link.purpose}**\n`;
      response += `   🔗 ${link.url}\n`;
      response += `   📋 ${link.description}\n`;
      if (link.relevance > 0.8) {
        response += `   ⭐ **Highly recommended for your query**\n`;
      }
      response += `\n`;
    });

    // Add specific recommendations
    if (intent === 'registration' && relevantLinks.length > 0) {
      response += `💡 **Recommendation:** Start with the first link to create your account!`;
    } else if (intent === 'learning' && relevantLinks.length > 0) {
      response += `💡 **Recommendation:** Check out the learning resources to get started!`;
    } else if (intent === 'product' && relevantLinks.length > 0) {
      response += `💡 **Recommendation:** These links will help you understand the product better!`;
    }
  } else {
    response += `I found ${links.length} link(s) but none seem specifically related to your query. Here's what I found:\n\n`;
    linkAnalyses.slice(0, 3).forEach((link, index) => {
      response += `**${index + 1}. ${link.purpose}**\n`;
      response += `   🔗 ${link.url}\n`;
      response += `   📋 ${link.description}\n\n`;
    });
  }

  return response;
};

/**
 * Parse links in content and convert them to clickable HTML anchor tags
 * Handles both markdown-style links [text](url) and raw URLs
 */
export const parseLinksInContent = (content: string): string => {
  // First, handle markdown-style links [text](url)
  let result = content.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" class="text-[#00AFF4] hover:underline cursor-pointer" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  
  // Then, handle raw URLs that aren't already in anchor tags
  // Match URLs that aren't preceded by href=" or ">
  result = result.replace(
    /(?<!href="|">)(https?:\/\/[^\s<>"]+)/g,
    '<a href="$1" class="text-[#00AFF4] hover:underline cursor-pointer" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  
  return result;
};
