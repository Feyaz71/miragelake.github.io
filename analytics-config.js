// Analytics Configuration
const analyticsConfig = {
    // Google Analytics
    ga: {
        measurementId: 'G-XXXXXXXXXX', // Replace with your GA4 measurement ID
        debug: false
    },
    
    // Error Tracking
    errorTracking: {
        enabled: true,
        maxErrors: 100,
        ignorePatterns: [
            /Script error/i,
            /Javascript error/i
        ]
    },
    
    // Performance Monitoring
    performance: {
        enabled: true,
        metrics: [
            'first-contentful-paint',
            'largest-contentful-paint',
            'first-input-delay',
            'cumulative-layout-shift'
        ]
    }
};

// Google Analytics Initialization
function initGoogleAnalytics() {
    if (!analyticsConfig.ga.measurementId) return;
    
    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.ga.measurementId}`;
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', analyticsConfig.ga.measurementId, {
        'debug_mode': analyticsConfig.ga.debug
    });
}

// Error Tracking
class ErrorTracker {
    constructor() {
        this.errors = [];
        this.init();
    }
    
    init() {
        if (!analyticsConfig.errorTracking.enabled) return;
        
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
    }
    
    handleError(event) {
        const error = {
            message: event.message,
            source: event.filename,
            line: event.lineno,
            column: event.colno,
            timestamp: new Date().toISOString()
        };
        
        this.logError(error);
    }
    
    handlePromiseError(event) {
        const error = {
            message: event.reason?.message || 'Promise rejected',
            source: 'Promise',
            timestamp: new Date().toISOString()
        };
        
        this.logError(error);
    }
    
    logError(error) {
        // Check if error should be ignored
        if (analyticsConfig.errorTracking.ignorePatterns.some(pattern => 
            pattern.test(error.message))) {
            return;
        }
        
        // Add to local storage
        this.errors.push(error);
        if (this.errors.length > analyticsConfig.errorTracking.maxErrors) {
            this.errors.shift();
        }
        localStorage.setItem('errorLog', JSON.stringify(this.errors));
        
        // Send to analytics
        if (window.gtag) {
            gtag('event', 'error', {
                'error_message': error.message,
                'error_source': error.source,
                'error_line': error.line,
                'error_column': error.column
            });
        }
    }
}

// Performance Monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }
    
    init() {
        if (!analyticsConfig.performance.enabled) return;
        
        // Observe performance metrics
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver(this.handleMetrics.bind(this));
            observer.observe({ entryTypes: analyticsConfig.performance.metrics });
        }
    }
    
    handleMetrics(list) {
        for (const entry of list.getEntries()) {
            this.metrics[entry.name] = entry.startTime;
            
            // Send to analytics
            if (window.gtag) {
                gtag('event', 'performance_metric', {
                    'metric_name': entry.name,
                    'metric_value': entry.startTime
                });
            }
        }
    }
}

// User Behavior Tracking
class UserBehaviorTracker {
    constructor() {
        this.events = [];
        this.init();
    }
    
    init() {
        // Track page views
        this.trackPageView();
        
        // Track clicks
        document.addEventListener('click', this.handleClick.bind(this));
        
        // Track form interactions
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
    }
    
    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString()
        };
        
        this.logEvent('page_view', pageData);
    }
    
    handleClick(event) {
        const target = event.target;
        const eventData = {
            element: target.tagName.toLowerCase(),
            id: target.id,
            class: target.className,
            text: target.textContent?.trim(),
            timestamp: new Date().toISOString()
        };
        
        this.logEvent('click', eventData);
    }
    
    handleFormSubmit(event) {
        const form = event.target;
        const eventData = {
            formId: form.id,
            formAction: form.action,
            timestamp: new Date().toISOString()
        };
        
        this.logEvent('form_submit', eventData);
    }
    
    logEvent(type, data) {
        this.events.push({ type, ...data });
        
        // Send to analytics
        if (window.gtag) {
            gtag('event', type, data);
        }
    }
}

// Initialize all tracking
function initAnalytics() {
    initGoogleAnalytics();
    new ErrorTracker();
    new PerformanceMonitor();
    new UserBehaviorTracker();
}

export {
    analyticsConfig,
    initAnalytics
}; 