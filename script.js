import { securityConfig, generateCSRFToken, RateLimiter, sanitizeInput } from './security-config.js';
import { analyticsConfig, initAnalytics } from './analytics-config.js';

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cookie consent
    const cookieConsent = new CookieConsent();
    cookieConsent.init();

    // Initialize search
    const searchUI = new SearchUI();
    searchUI.init();

    // Initialize analytics if consent is given
    if (cookieConsent.hasConsent('analytics')) {
        initAnalytics();
    }

    // Initialize security features
    const rateLimiter = new RateLimiter();
    rateLimiter.init();

    // Add CSRF tokens to forms
    document.querySelectorAll('form').forEach(form => {
        const csrfToken = generateCSRFToken();
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf_token';
        input.value = csrfToken;
        form.appendChild(input);
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
            });
    }

    // Initialize intersection observer for fade-in effects
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: document.getElementById('countryCode').value + formData.get('phone'),
                message: formData.get('message')
            };

            // Check rate limiting
            if (!rateLimiter.checkLimit('contact_form')) {
                alert('Too many requests. Please try again later.');
                return;
            }

            // Sanitize input
            Object.keys(data).forEach(key => {
                data[key] = sanitizeInput(data[key]);
            });

            try {
                // Check if online
                if (navigator.onLine) {
                    // Store form data for offline submission
                    const offlineData = JSON.parse(localStorage.getItem('offlineFormData') || '[]');
                    offlineData.push(data);
                    localStorage.setItem('offlineFormData', JSON.stringify(offlineData));

                    // Register background sync
                    if ('serviceWorker' in navigator && 'SyncManager' in window) {
                        const registration = await navigator.serviceWorker.ready;
                        await registration.sync.register('submit-contact-form');
                    }

                    alert('Thank you for your message. We will get back to you soon!');
                    contactForm.reset();
                } else {
                    // Store for offline submission
                    const offlineData = JSON.parse(localStorage.getItem('offlineFormData') || '[]');
                    offlineData.push(data);
                    localStorage.setItem('offlineFormData', JSON.stringify(offlineData));
                    alert('You are offline. Your message will be sent when you are back online.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('There was an error sending your message. Please try again later.');
            }
        });
    }
});

// Initialize AOS with enhanced settings
AOS.init({
    duration: 1200,
    once: true,
    offset: 100,
    easing: 'ease-out-cubic'
});

// Handle custom enquiry field
document.getElementById('enquiryType')?.addEventListener('change', function() {
    const customField = document.getElementById('customEnquiry');
    if (this.value === 'custom') {
        customField.classList.remove('d-none');
        customField.required = true;
    } else {
        customField.classList.add('d-none');
        customField.required = false;
    }
});

// Add online/offline status indicator
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const status = document.createElement('div');
    status.className = `connection-status ${navigator.onLine ? 'online' : 'offline'}`;
    status.textContent = navigator.onLine ? 'Online' : 'Offline';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(status);
    
    setTimeout(() => {
        status.remove();
    }, 3000);
}