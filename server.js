const express = require('express');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'server-data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

const DEFAULT_DATA = {
    products: [
        { id: 1, name: 'Pertalite', buyPrice: 10000, sellPrice: 12000, unit: 'Liter', color: '#10B981', icon: '⛽' },
        { id: 2, name: 'Pertamax', buyPrice: 16000, sellPrice: 18000, unit: 'Liter', color: '#3B82F6', icon: '⛽' },
        { id: 3, name: 'Gas LPG 3KG', buyPrice: 19500, sellPrice: 22000, unit: 'Tabung', color: '#F59E0B', icon: '🔥' },
        { id: 4, name: 'Le Minerale', buyPrice: 20000, sellPrice: 22000, unit: 'Karton', color: '#06B6D4', icon: '💧' }
    ],
    sales: [],
    expenses: [],
    orders: [],
    settings: { whatsappNumber: '085778837136', logo: null, images: { Pertalite: null, Pertamax: null, 'Gas LPG 3KG': null, 'Le Minerale': null } },
    updatedAt: null
};

function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }

function readDB() {
    ensureDir();
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ ...DEFAULT_DATA, updatedAt: new Date().toISOString() }, null, 2));
    }
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
    catch (e) { return { ...DEFAULT_DATA }; }
}

function writeDB(db) {
    ensureDir();
    db.updatedAt = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

const app = express();
app.use(express.json({ limit: '25mb' }));

const db = readDB();

app.get('/api/data', (req, res) => res.json(db));

app.post('/api/orders', (req, res) => {
    const order = req.body;
    if (!order || !order.id) return res.status(400).json({ error: 'Order tidak valid' });
    const existing = db.orders.findIndex(o => o.id === order.id);
    if (existing >= 0) db.orders[existing] = order; else db.orders.unshift(order);
    writeDB(db);
    res.json({ ok: true, data: db });
});

app.post('/api/sales', (req, res) => {
    const sale = req.body;
    if (!sale || !sale.id) return res.status(400).json({ error: 'Data tidak valid' });
    const existing = db.sales.findIndex(s => s.id === sale.id);
    if (existing >= 0) db.sales[existing] = sale; else db.sales.unshift(sale);
    writeDB(db);
    res.json({ ok: true, data: db });
});

app.post('/api/expenses', (req, res) => {
    const exp = req.body;
    if (!exp || !exp.id) return res.status(400).json({ error: 'Data tidak valid' });
    const existing = db.expenses.findIndex(e => e.id === exp.id);
    if (existing >= 0) db.expenses[existing] = exp; else db.expenses.unshift(exp);
    writeDB(db);
    res.json({ ok: true, data: db });
});

app.post('/api/settings', (req, res) => {
    db.settings = req.body || db.settings;
    writeDB(db);
    res.json({ ok: true, data: db });
});

app.delete('/api/orders/:id', (req, res) => {
    db.orders = db.orders.filter(o => o.id !== req.params.id);
    writeDB(db);
    res.json({ ok: true, data: db });
});

app.delete('/api/sales/:id', (req, res) => {
    db.sales = db.sales.filter(s => s.id !== req.params.id);
    writeDB(db);
    res.json({ ok: true, data: db });
});

app.delete('/api/expenses/:id', (req, res) => {
    db.expenses = db.expenses.filter(e => e.id !== req.params.id);
    writeDB(db);
    res.json({ ok: true, data: db });
});

app.use(express.static(__dirname));

const PORT = 3001;
app.listen(PORT, () => {
    console.log('==================================');
    console.log('  KIOS JURUS TANDUR  (Database Laptop)');
    console.log('  Server jalan di: http://localhost:' + PORT);
    console.log('  Buka browser: http://localhost:' + PORT);
    console.log('  Data tersimpan di: ' + DATA_FILE);
    console.log('==================================');
});
