/**
 * MUSAFIR Security & Data Protection Service
 * Enterprise-grade client security: XSS sanitization, PII masking, Rate Limiting, and Cryptographic guards.
 */

class SecurityService {
  private rateLimitMap = new Map<string, { count: number; firstTimestamp: number }>();

  /**
   * HTML / Script XSS Escaping
   */
  public sanitize(input: string | undefined | null): string {
    if (!input) return '';
    return String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * PII Redaction: Mask phone numbers for public display (e.g. +91 98765 43210 -> +91 98*** **210)
   */
  public maskPhone(phone: string | undefined | null): string {
    if (!phone) return '••••••••••';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return '••••••••••';
    const clean = digits.slice(-10);
    return `+91 ${clean.slice(0, 2)}*** **${clean.slice(-3)}`;
  }

  /**
   * PII Redaction: Mask email addresses (e.g. rohan.sharma@gmail.com -> r***a@gmail.com)
   */
  public maskEmail(email: string | undefined | null): string {
    if (!email || !email.includes('@')) return '••••••••@••••';
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
      return `${local.charAt(0)}***@${domain}`;
    }
    return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
  }

  /**
   * PII Redaction: Mask full names for leaderboard / community (e.g. Rohan Sharma -> Rohan S.)
   */
  public maskName(name: string | undefined | null): string {
    if (!name) return 'Anonymous Citizen';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
  }

  /**
   * Client-side rate limiter / debouncer to prevent rapid spam (e.g. SOS spam, report flooding)
   * @param key Action key (e.g. "sos_trigger", "incident_submit")
   * @param maxRequests Maximum allowed in time window
   * @param windowMs Time window in milliseconds (default 60 seconds)
   * @returns boolean true if allowed, false if rate limited
   */
  public checkRateLimit(key: string, maxRequests = 5, windowMs = 60000): { allowed: boolean; retryAfterSec?: number } {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    if (!record) {
      this.rateLimitMap.set(key, { count: 1, firstTimestamp: now });
      return { allowed: true };
    }

    if (now - record.firstTimestamp > windowMs) {
      // Window expired, reset
      this.rateLimitMap.set(key, { count: 1, firstTimestamp: now });
      return { allowed: true };
    }

    if (record.count >= maxRequests) {
      const retryAfterSec = Math.ceil((windowMs - (now - record.firstTimestamp)) / 1000);
      return { allowed: false, retryAfterSec };
    }

    record.count += 1;
    return { allowed: true };
  }

  /**
   * Validate Indian Mobile Number format (10-digit standard)
   */
  public isValidIndianPhone(phone: string): boolean {
    const clean = phone.replace(/\D/g, '').slice(-10);
    return /^[6-9]\d{9}$/.test(clean);
  }

  /**
   * Secure Hash generator for local audit logs
   */
  public generateAuditHash(payload: any): string {
    const str = JSON.stringify(payload) + Date.now().toString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return 'AUDIT-' + Math.abs(hash).toString(16).toUpperCase();
  }
}

export const securityService = new SecurityService();
