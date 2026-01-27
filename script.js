// Currency Converter - DH, Ryal & Frank
// Using ExchangeRate-API for live exchange rates (supports MAD)
// 1 DH = 20 Ryal
// 1 DH = 100 Frank (10 DH = 1000 Frank)

const API_BASE = 'https://open.er-api.com/v6/latest';
const DH_TO_RYAL = 20;
const DH_TO_FRANK = 100;

// DOM Elements
const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency');
const resultDH = document.getElementById('result-dh');
const resultRyal = document.getElementById('result-ryal');
const resultFrank = document.getElementById('result-frank');
const rateDisplay = document.getElementById('rate-display');
const refreshBtn = document.getElementById('refresh-btn');

// Store current exchange rate
let currentRate = null;
let currentCurrency = 'USD';

// Format number with proper separators
function formatNumber(num) {
    if (num >= 1000000) {
        return num.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }
    return num.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

// Fetch exchange rate from ExchangeRate-API
async function fetchExchangeRate(fromCurrency) {
    try {
        // Add loading state
        refreshBtn.classList.add('loading');
        resultDH.classList.add('loading');
        resultRyal.classList.add('loading');
        rateDisplay.textContent = 'Fetching rate...';

        const response = await fetch(`${API_BASE}/${fromCurrency}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rate');
        }

        const data = await response.json();
        
        if (data.result !== 'success') {
            throw new Error('API returned error');
        }

        // Get MAD rate from the response
        currentRate = data.rates.MAD;
        currentCurrency = fromCurrency;

        // Update rate display
        rateDisplay.textContent = `1 ${fromCurrency} = ${formatNumber(currentRate)} DH`;

        // Remove loading states
        refreshBtn.classList.remove('loading');
        resultDH.classList.remove('loading');
        resultRyal.classList.remove('loading');

        return currentRate;
    } catch (error) {
        console.error('Error fetching rate:', error);
        rateDisplay.textContent = 'Error loading rate. Click refresh.';
        refreshBtn.classList.remove('loading');
        resultDH.classList.remove('loading');
        resultRyal.classList.remove('loading');
        return null;
    }
}

// Convert and update results
function updateConversion() {
    const amount = parseFloat(amountInput.value) || 0;
    
    if (currentRate === null) {
        resultDH.textContent = '---';
        resultRyal.textContent = '---';
        resultFrank.textContent = '---';
        return;
    }

    const dhAmount = amount * currentRate;
    const ryalAmount = dhAmount * DH_TO_RYAL;
    const frankAmount = dhAmount * DH_TO_FRANK;

    // Animate the number change
    animateValue(resultDH, dhAmount);
    animateValue(resultRyal, ryalAmount);
    animateValue(resultFrank, frankAmount);
}

// Smooth number animation
function animateValue(element, targetValue) {
    const formattedValue = formatNumber(targetValue);
    element.textContent = formattedValue;
}

// Debounce function for input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event Listeners
amountInput.addEventListener('input', debounce(updateConversion, 100));

currencySelect.addEventListener('change', async (e) => {
    const newCurrency = e.target.value;
    if (newCurrency !== currentCurrency) {
        await fetchExchangeRate(newCurrency);
        updateConversion();
    }
});

refreshBtn.addEventListener('click', async () => {
    await fetchExchangeRate(currencySelect.value);
    updateConversion();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press R to refresh
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey && document.activeElement !== amountInput) {
        refreshBtn.click();
    }
});

// Initialize on page load
async function init() {
    // Focus on amount input
    amountInput.focus();
    amountInput.select();

    // Fetch initial rate
    await fetchExchangeRate(currencySelect.value);
    updateConversion();

    // Auto-refresh rate every 5 minutes
    setInterval(async () => {
        await fetchExchangeRate(currencySelect.value);
        updateConversion();
    }, 5 * 60 * 1000);
}

// Start the app
init();
