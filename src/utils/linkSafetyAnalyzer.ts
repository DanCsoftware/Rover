
export interface LinkSafetyResult {
  url: string;
  status: 'safe' | 'suspicious' | 'dangerous';
  reasons: string[];
  confidence: number;
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
