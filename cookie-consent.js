// Cookie Consent Configuration
const cookieConfig = {
    banner: {
        position: 'bottom',
        theme: 'light',
        message: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
        acceptButton: 'Accept All',
        rejectButton: 'Reject All',
        customizeButton: 'Customize',
        policyLink: '/privacy-policy.html'
    },
    cookies: {
        necessary: {
            name: 'necessary',
            description: 'Essential cookies that enable basic functionality and security features',
            required: true
        },
        analytics: {
            name: 'analytics',
            description: 'Cookies that help us understand how visitors interact with our website',
            required: false
        },
        marketing: {
            name: 'marketing',
            description: 'Cookies used to track visitors across websites for marketing purposes',
            required: false
        }
    }
};

class CookieConsent {
    constructor() {
        this.consent = this.getConsent();
        this.init();
    }

    init() {
        if (!this.consent) {
            this.showBanner();
        }
        this.setupEventListeners();
    }

    getConsent() {
        return JSON.parse(localStorage.getItem('cookieConsent'));
    }

    setConsent(consent) {
        localStorage.setItem('cookieConsent', JSON.stringify(consent));
        this.consent = consent;
        this.updateCookies();
    }

    showBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>${cookieConfig.banner.message}</p>
                <div class="cookie-buttons">
                    <button class="btn btn-primary" id="acceptAll">${cookieConfig.banner.acceptButton}</button>
                    <button class="btn btn-outline-primary" id="customize">${cookieConfig.banner.customizeButton}</button>
                    <button class="btn btn-outline-secondary" id="rejectAll">${cookieConfig.banner.rejectButton}</button>
                </div>
                <a href="${cookieConfig.banner.policyLink}" class="cookie-policy-link">Privacy Policy</a>
            </div>
        `;
        document.body.appendChild(banner);
    }

    showPreferences() {
        const modal = document.createElement('div');
        modal.className = 'cookie-preferences-modal';
        modal.innerHTML = `
            <div class="cookie-preferences-content">
                <h3>Cookie Preferences</h3>
                <div class="cookie-options">
                    ${Object.entries(cookieConfig.cookies).map(([key, cookie]) => `
                        <div class="cookie-option">
                            <div class="cookie-option-header">
                                <h4>${cookie.name}</h4>
                                <label class="switch">
                                    <input type="checkbox" 
                                           id="${key}" 
                                           ${cookie.required ? 'disabled checked' : ''}
                                           ${this.consent?.[key] ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <p>${cookie.description}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="cookie-preferences-buttons">
                    <button class="btn btn-primary" id="savePreferences">Save Preferences</button>
                    <button class="btn btn-outline-secondary" id="cancelPreferences">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'acceptAll') {
                this.acceptAll();
            } else if (e.target.id === 'rejectAll') {
                this.rejectAll();
            } else if (e.target.id === 'customize') {
                this.showPreferences();
            } else if (e.target.id === 'savePreferences') {
                this.savePreferences();
            } else if (e.target.id === 'cancelPreferences') {
                this.closePreferences();
            }
        });
    }

    acceptAll() {
        const consent = {};
        Object.keys(cookieConfig.cookies).forEach(key => {
            consent[key] = true;
        });
        this.setConsent(consent);
        this.removeBanner();
    }

    rejectAll() {
        const consent = {};
        Object.keys(cookieConfig.cookies).forEach(key => {
            consent[key] = cookieConfig.cookies[key].required;
        });
        this.setConsent(consent);
        this.removeBanner();
    }

    savePreferences() {
        const consent = {};
        Object.keys(cookieConfig.cookies).forEach(key => {
            const checkbox = document.getElementById(key);
            consent[key] = checkbox.checked;
        });
        this.setConsent(consent);
        this.closePreferences();
        this.removeBanner();
    }

    closePreferences() {
        const modal = document.querySelector('.cookie-preferences-modal');
        if (modal) {
            modal.remove();
        }
    }

    removeBanner() {
        const banner = document.querySelector('.cookie-banner');
        if (banner) {
            banner.remove();
        }
    }

    updateCookies() {
        // Update Google Analytics
        if (this.consent.analytics) {
            window['ga-disable-G-XXXXXXXXXX'] = false;
        } else {
            window['ga-disable-G-XXXXXXXXXX'] = true;
        }

        // Update marketing cookies
        if (this.consent.marketing) {
            // Enable marketing cookies
        } else {
            // Disable marketing cookies
        }
    }
}

// Initialize cookie consent
const cookieConsent = new CookieConsent();

export { cookieConsent, cookieConfig }; 