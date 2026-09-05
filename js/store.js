const STORAGE_KEY = 'kjt_data';
const DEFAULT_ADMIN = { username: 'kjt21', password: 'tahan tidur', securityQuestion: '', securityAnswer: '' };

const DEFAULT_DATA = {
    products: [
        { id: 1, name: 'Pertalite', buyPrice: 10000, sellPrice: 12000, unit: 'Liter', color: '#10B981', icon: '⛽', stock: null, stockMin: 3 },
        { id: 2, name: 'Pertamax', buyPrice: 16000, sellPrice: 18000, unit: 'Liter', color: '#3B82F6', icon: '⛽', stock: null, stockMin: 3 },
        { id: 3, name: 'Gas LPG 3KG', buyPrice: 19500, sellPrice: 22000, unit: 'Tabung', color: '#F59E0B', icon: '🔥', stock: null, stockMin: 3 },
        { id: 4, name: 'Le Minerale', buyPrice: 20000, sellPrice: 22000, unit: 'Karton', color: '#06B6D4', icon: '💧', stock: null, stockMin: 3 }
    ],
    sales: [],
    expenses: [],
    settings: { whatsappNumber: '085778837136', logo: null, images: { Pertalite: null, Pertamax: null, 'Gas LPG 3KG': null, 'Le Minerale': null }, modalStart: 0, targetProfit: 0 },
    orders: [],
    isLoggedIn: false
};

let appData = loadData();

function loadData() {
    try {
        const s = localStorage.getItem(STORAGE_KEY);
        if (s) {
            const parsed = JSON.parse(s);
            return {
                ...DEFAULT_DATA,
                ...parsed,
                settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
                admin: { ...DEFAULT_ADMIN, ...(parsed.admin || {}) }
            };
        }
    } catch (e) { console.error(e); }
    return { ...DEFAULT_DATA, admin: DEFAULT_ADMIN };
}

function normalizeAnswer(v) { return String(v || '').trim().toLowerCase(); }

function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); } catch (e) { console.error(e); }
    if (window.__sbPush) window.__sbPush();
}

function productById(name) { return appData.products.find(p => p.name === name); }

function isStockTracked(p) { return !!(p && p.stock != null); }

function ensureProductMeta() {
    appData.products.forEach(p => {
        if (p.stock === undefined) p.stock = null;
        if (p.stockMin === undefined) p.stockMin = 3;
    });
}