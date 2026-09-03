const STORAGE_KEY = 'kjt_data';

const DEFAULT_DATA = {
    products: [
        { id: 1, name: 'Pertalite', buyPrice: 10000, sellPrice: 12000, unit: 'Liter', color: '#10B981', icon: '⛽' },
        { id: 2, name: 'Pertamax', buyPrice: 16000, sellPrice: 18000, unit: 'Liter', color: '#3B82F6', icon: '⛽' },
        { id: 3, name: 'Gas LPG 3KG', buyPrice: 19500, sellPrice: 22000, unit: 'Tabung', color: '#F59E0B', icon: '🔥' },
        { id: 4, name: 'Le Minerale', buyPrice: 20000, sellPrice: 22000, unit: 'Karton', color: '#06B6D4', icon: '💧' }
    ],
    sales: [],
    expenses: [],
    settings: { whatsappNumber: '085778837136', logo: null, images: { Pertalite: null, Pertamax: null, 'Gas LPG 3KG': null, 'Le Minerale': null } },
    admin: { username: 'kjt21', password: 'tahan tidur' },
    orders: [],
    isLoggedIn: false
};

let appData = loadData();

function loadData() {
    try {
        const s = localStorage.getItem(STORAGE_KEY);
        if (s) return { ...DEFAULT_DATA, ...JSON.parse(s), admin: DEFAULT_DATA.admin };
    } catch (e) { console.error(e); }
    return { ...DEFAULT_DATA };
}

function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); } catch (e) { console.error(e); }
    if (typeof window.__syncToBackend === 'function') window.__syncToBackend();
}

async function loadFromBackend() {
    try {
        const r = await fetch('/api/data');
        if (!r.ok) return false;
        const server = await r.json();
        if (!server) return false;
        appData.products = server.products || appData.products;
        appData.sales = server.sales || [];
        appData.expenses = server.expenses || [];
        appData.orders = server.orders || [];
        appData.settings = { ...appData.settings, ...server.settings };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        return true;
    } catch (e) { return false; }
}
