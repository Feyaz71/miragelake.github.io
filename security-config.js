// Security Configuration
const securityConfig = {
    // CSRF Protection
    csrf: {
        tokenLength: 32,
        headerName: 'X-CSRF-Token',
        cookieName: 'csrf-token'
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.'
    },
    
    // Security Headers
    headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; img-src 'self' data: https:; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
};

// CSRF Token Generation
function generateCSRFToken() {
    const array = new Uint8Array(securityConfig.csrf.tokenLength);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Rate Limiting Implementation
class RateLimiter {
    constructor() {
        this.requests = new Map();
    }

    isRateLimited(ip) {
        const now = Date.now();
        const windowStart = now - securityConfig.rateLimit.windowMs;
        
        // Clean up old requests
        this.requests.set(ip, (this.requests.get(ip) || [])
            .filter(time => time > windowStart));
        
        const requestCount = this.requests.get(ip).length;
        
        if (requestCount >= securityConfig.rateLimit.maxRequests) {
            return true;
        }
        
        this.requests.get(ip).push(now);
        return false;
    }
}

// Input Sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Export security utilities
export {
    securityConfig,
    generateCSRFToken,
    RateLimiter,
    sanitizeInput
}; 