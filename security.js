// Security Module for JobConnect
// Comprehensive protection against common attacks

class SecurityManager {
    constructor() {
        this.rateLimits = new Map();
        this.suspiciousIPs = new Set();
        this.maxRequestsPerMinute = 60;
        this.maxLoginAttempts = 5;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.initSecurity();
    }

    initSecurity() {
        // Set security headers
        this.setSecurityHeaders();
        
        // Initialize rate limiting
        this.initRateLimiting();
        
        // Add CSRF protection
        this.initCSRFProtection();
        
        // Add XSS protection
        this.initXSSProtection();
        
        // Monitor for suspicious activity
        this.initActivityMonitoring();
    }

    setSecurityHeaders() {
        // Content Security Policy
        const csp = `
            default-src 'self';
            script-src 'self' 'unsafe-inline';
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: https:;
            font-src 'self';
            connect-src 'self';
            frame-ancestors 'none';
            base-uri 'self';
            form-action 'self';
        `.replace(/\s+/g, ' ').trim();

        // Set security headers (would be set by server in production)
        document.querySelector('meta[name="csrf-token"]') || 
            this.createMetaTag('csrf-token', this.generateCSRFToken());
    }

    createMetaTag(name, content) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
    }

    // Input sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .replace(/expression\s*\(/gi, '') // Remove CSS expressions
            .substring(0, 1000); // Limit length
    }

    // Email validation
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const sanitizedEmail = this.sanitizeInput(email);
        return emailRegex.test(sanitizedEmail) ? sanitizedEmail : null;
    }

    // Phone validation
    validatePhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        const sanitizedPhone = this.sanitizeInput(phone);
        return phoneRegex.test(sanitizedPhone) && sanitizedPhone.length >= 10 ? sanitizedPhone : null;
    }

    // Password strength validation
    validatePassword(password) {
        const sanitizedPassword = this.sanitizeInput(password);
        
        if (sanitizedPassword.length < 8) return false;
        if (!/[A-Z]/.test(sanitizedPassword)) return false;
        if (!/[a-z]/.test(sanitizedPassword)) return false;
        if (!/\d/.test(sanitizedPassword)) return false;
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(sanitizedPassword)) return false;
        
        return sanitizedPassword;
    }

    // Job title validation
    validateJobTitle(title) {
        const sanitizedTitle = this.sanitizeInput(title);
        if (sanitizedTitle.length < 3 || sanitizedTitle.length > 100) return null;
        return sanitizedTitle;
    }

    // Salary validation
    validateSalary(salary) {
        const numSalary = parseInt(sanitizedInput(salary));
        if (isNaN(numSalary) || numSalary < 0 || numSalary > 1000000) return null;
        return numSalary;
    }

    // Text area validation (description, requirements)
    validateTextArea(text, maxLength = 2000) {
        const sanitizedText = this.sanitizeInput(text);
        if (sanitizedText.length < 10 || sanitizedText.length > maxLength) return null;
        return sanitizedText;
    }

    // Rate limiting
    initRateLimiting() {
        setInterval(() => {
            this.rateLimits.clear();
        }, 60000); // Clear every minute
    }

    checkRateLimit(ip, action = 'general') {
        const key = `${ip}-${action}`;
        const now = Date.now();
        const requests = this.rateLimits.get(key) || [];
        
        // Remove old requests (older than 1 minute)
        const validRequests = requests.filter(time => now - time < 60000);
        
        if (validRequests.length >= this.maxRequestsPerMinute) {
            this.blockIP(ip);
            return false;
        }
        
        validRequests.push(now);
        this.rateLimits.set(key, validRequests);
        return true;
    }

    blockIP(ip) {
        this.suspiciousIPs.add(ip);
        console.warn(`IP ${ip} blocked due to suspicious activity`);
    }

    // CSRF Protection
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    initCSRFProtection() {
        // Add CSRF token to all forms
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const token = this.generateCSRFToken();
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'csrf_token';
                input.value = token;
                form.appendChild(input);
            });
        });
    }

    // XSS Protection
    initXSSProtection() {
        // Override innerHTML to sanitize content
        const originalSetInnerHTML = Element.prototype.innerHTML;
        Element.prototype.innerHTML = function(content) {
            if (typeof content === 'string') {
                content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                content = content.replace(/on\w+\s*=/gi, '');
            }
            return originalSetInnerHTML.call(this, content);
        };
    }

    // Activity monitoring
    initActivityMonitoring() {
        // Monitor for suspicious patterns
        let failedLogins = 0;
        let lastFailedLogin = 0;
        
        // Track login attempts
        window.addEventListener('message', (event) => {
            if (event.data.type === 'login_attempt') {
                if (!event.data.success) {
                    failedLogins++;
                    lastFailedLogin = Date.now();
                    
                    if (failedLogins >= this.maxLoginAttempts) {
                        this.triggerSecurityAlert('Multiple failed login attempts');
                    }
                } else {
                    failedLogins = 0;
                }
            }
        });
    }

    triggerSecurityAlert(message) {
        console.error('SECURITY ALERT:', message);
        // In production, this would log to security monitoring system
        // and potentially block the user or notify administrators
    }

    // Session management
    createSecureSession(user) {
        const session = {
            id: this.generateSecureToken(),
            userId: user.id,
            email: user.email,
            userType: user.userType,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.sessionTimeout,
            ip: this.getClientIP()
        };
        
        return session;
    }

    validateSession(session) {
        if (!session || !session.id) return false;
        if (Date.now() > session.expiresAt) return false;
        if (this.suspiciousIPs.has(session.ip)) return false;
        return true;
    }

    generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }

    getClientIP() {
        // In production, this would get the real IP from server
        return 'client-ip';
    }

    // Data encryption (basic)
    encryptData(data) {
        // In production, use proper encryption like AES
        return btoa(JSON.stringify(data));
    }

    decryptData(encryptedData) {
        try {
            return JSON.parse(atob(encryptedData));
        } catch (e) {
            return null;
        }
    }

    // SQL Injection prevention (for future database use)
    sanitizeSQL(query) {
        // Basic SQL injection prevention
        return query.replace(/['"\\;]/g, '');
    }

    // File upload security
    validateFileUpload(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!allowedTypes.includes(file.type)) {
            throw new Error('File type not allowed');
        }
        
        if (file.size > maxSize) {
            throw new Error('File too large');
        }
        
        // Validate file name
        const fileName = file.name.toLowerCase();
        if (fileName.includes('../') || fileName.includes('..\\')) {
            throw new Error('Invalid file name');
        }
        
        return true;
    }

    // API security
    validateAPIRequest(req, res) {
        // Validate request origin
        const origin = req.headers.origin;
        const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
        
        if (!allowedOrigins.includes(origin)) {
            res.writeHead(403);
            res.end('Forbidden');
            return false;
        }
        
        return true;
    }
}

// Initialize security manager
const securityManager = new SecurityManager();

// Export for use in other files
window.SecurityManager = SecurityManager;
window.securityManager = securityManager;
