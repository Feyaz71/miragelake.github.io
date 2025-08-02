// Search Configuration
const searchConfig = {
    minSearchLength: 2,
    maxResults: 10,
    searchDelay: 300,
    highlightClass: 'search-highlight',
    index: {
        title: 2, // Weight for title matches
        content: 1, // Weight for content matches
        tags: 1.5 // Weight for tag matches
    }
};

class SearchIndex {
    constructor() {
        this.index = new Map();
        this.documents = new Map();
    }

    addDocument(id, document) {
        this.documents.set(id, document);
        this.indexDocument(id, document);
    }

    indexDocument(id, document) {
        const tokens = this.tokenize(document.title + ' ' + document.content + ' ' + document.tags.join(' '));
        tokens.forEach(token => {
            if (!this.index.has(token)) {
                this.index.set(token, new Set());
            }
            this.index.get(token).add(id);
        });
    }

    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(token => token.length >= searchConfig.minSearchLength);
    }

    search(query) {
        const tokens = this.tokenize(query);
        const results = new Map();

        tokens.forEach(token => {
            const matches = this.index.get(token) || new Set();
            matches.forEach(id => {
                const document = this.documents.get(id);
                const score = this.calculateScore(document, token);
                results.set(id, (results.get(id) || 0) + score);
            });
        });

        return Array.from(results.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, searchConfig.maxResults)
            .map(([id]) => this.documents.get(id));
    }

    calculateScore(document, token) {
        let score = 0;
        const titleMatch = document.title.toLowerCase().includes(token);
        const contentMatch = document.content.toLowerCase().includes(token);
        const tagMatch = document.tags.some(tag => tag.toLowerCase().includes(token));

        if (titleMatch) score += searchConfig.index.title;
        if (contentMatch) score += searchConfig.index.content;
        if (tagMatch) score += searchConfig.index.tags;

        return score;
    }
}

class SearchUI {
    constructor() {
        this.searchIndex = new SearchIndex();
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.createSearchUI();
        this.indexPages();
        this.setupEventListeners();
    }

    createSearchUI() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-input-container">
                <input type="text" 
                       class="search-input" 
                       placeholder="Search..." 
                       aria-label="Search">
                <button class="search-clear" aria-label="Clear search">×</button>
            </div>
            <div class="search-results" hidden></div>
        `;
        document.body.appendChild(searchContainer);
    }

    indexPages() {
        // Index all pages
        const pages = [
            {
                id: 'home',
                title: 'Home',
                content: document.querySelector('main')?.textContent || '',
                tags: ['home', 'main', 'welcome'],
                url: '/'
            },
            {
                id: 'services',
                title: 'Services',
                content: document.querySelector('#services')?.textContent || '',
                tags: ['services', 'offerings', 'solutions'],
                url: '/services.html'
            },
            // Add more pages as needed
        ];

        pages.forEach(page => this.searchIndex.addDocument(page.id, page));
    }

    setupEventListeners() {
        const searchInput = document.querySelector('.search-input');
        const searchClear = document.querySelector('.search-clear');
        const searchResults = document.querySelector('.search-results');

        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, searchConfig.searchDelay);
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchResults.hidden = true;
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchResults.hidden = true;
            }
        });
    }

    performSearch(query) {
        if (query.length < searchConfig.minSearchLength) {
            this.showResults([]);
            return;
        }

        const results = this.searchIndex.search(query);
        this.showResults(results, query);
    }

    showResults(results, query) {
        const searchResults = document.querySelector('.search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No results found</div>';
            searchResults.hidden = false;
            return;
        }

        const resultsHTML = results.map(result => `
            <a href="${result.url}" class="search-result">
                <h3>${this.highlightText(result.title, query)}</h3>
                <p>${this.highlightText(this.truncateText(result.content, 150), query)}</p>
                <div class="search-tags">
                    ${result.tags.map(tag => 
                        `<span class="search-tag">${this.highlightText(tag, query)}</span>`
                    ).join('')}
                </div>
            </a>
        `).join('');

        searchResults.innerHTML = resultsHTML;
        searchResults.hidden = false;
    }

    highlightText(text, query) {
        const tokens = this.searchIndex.tokenize(query);
        let highlightedText = text;

        tokens.forEach(token => {
            const regex = new RegExp(`(${token})`, 'gi');
            highlightedText = highlightedText.replace(regex, 
                `<span class="${searchConfig.highlightClass}">$1</span>`
            );
        });

        return highlightedText;
    }

    truncateText(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
}

// Initialize search
const search = new SearchUI();

export { search, searchConfig }; 