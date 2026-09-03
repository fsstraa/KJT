// ===== Data Store =====
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
    try { const s = localStorage.getItem('kjt_data'); if (s) return { ...DEFAULT_DATA, ...JSON.parse(s), admin: DEFAULT_DATA.admin }; } catch (e) { console.error(e); }
    return { ...DEFAULT_DATA };
}

function saveData() { try { localStorage.setItem('kjt_data', JSON.stringify(appData)); } catch (e) { console.error(e); } }

function formatRupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

function showToast(msg, err = false) {
    const t = document.getElementById('toast'), m = document.getElementById('toast-message');
    m.textContent = msg; t.className = err ? 'toast-bar error' : 'toast-bar'; t.classList.remove('hidden');
    clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.add('hidden'), 2500);
}

function formatDateLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()];
    return `${dayName}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// ===== Page Navigation =====
function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
    const navBtn = document.querySelector(`.bnav-item[data-page="${page}"]`);
    if (navBtn) navBtn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'dashboard') { renderSalesTable(); renderExpensesTable(); renderDailyReport(); renderOrdersList(); }
    if (page === 'my-orders') renderMyOrders();
}

// ===== Products =====
function renderProducts() {
    const scroll = document.getElementById('home-products');
    scroll.innerHTML = '';
    appData.products.forEach(p => {
        const imgSrc = appData.settings.images[p.name];
        const card = document.createElement('div');
        card.className = 'product-scroll-card';
        card.onclick = () => { document.getElementById('order-product').value = p.name; switchPage('order'); };
        card.innerHTML = `<div class="psc-image" style="background: linear-gradient(135deg, ${p.color}15, ${p.color}30);">${imgSrc ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" alt="${p.name}">` : `<span>${p.icon}</span>`}</div><div class="psc-body"><div class="psc-name">${p.name}</div><div class="psc-price">${formatRupiah(p.sellPrice)}<span class="psc-unit"> /${p.unit}</span></div></div>`;
        scroll.appendChild(card);
    });

    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    appData.products.forEach(p => {
        const imgSrc = appData.settings.images[p.name];
        const card = document.createElement('div');
        card.className = 'pgrid-card';
        card.innerHTML = `<div class="pgrid-image" style="background: linear-gradient(135deg, ${p.color}15, ${p.color}30);">${imgSrc ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" alt="${p.name}">` : `<span>${p.icon}</span>`}</div><div class="pgrid-body"><div class="pgrid-name">${p.name}</div><div class="pgrid-price">${formatRupiah(p.sellPrice)}</div><span class="pgrid-unit">per ${p.unit}</span><button class="btn-order-sm" onclick="document.getElementById('order-product').value='${p.name}'; switchPage('order');"><i class="fab fa-whatsapp"></i> Pesan</button></div>`;
        grid.appendChild(card);
    });
}

// ===== Order Form (Customer) =====
document.getElementById('order-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const location = document.getElementById('order-location').value.trim();
    const product = document.getElementById('order-product').value;
    const quantity = parseInt(document.getElementById('order-quantity').value);
    const note = document.getElementById('order-note').value.trim();

    if (!name || !phone || !location || !product || !quantity) { showToast('Isi semua field yang diperlukan!', true); return; }

    const prod = appData.products.find(p => p.name === product);
    const total = prod ? prod.sellPrice * quantity : 0;

    const order = { id: genId(), name, phone, location, product, quantity, note, total, status: 'pending', timestamp: new Date().toISOString(), date: getTodayStr() };
    appData.orders.push(order);
    saveData();

    showOrderPopup(order);

    const waMsg = encodeURIComponent(`*PESANAN BARU - KIOS JURUS TANDUR*\n\nNama: ${name}\nNo. HP: ${phone}\nLokasi: ${location}\nProduk: ${product}\nJumlah: ${quantity} ${prod ? prod.unit : ''}\nTotal: ${formatRupiah(total)}\n${note ? `Catatan: ${note}\n` : ''}\nTerima kasih sudah memesan!`);
    const waNum = appData.settings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${waNum}?text=${waMsg}`, '_blank');

    this.reset();
    showToast('Pesanan berhasil dikirim!');
});

function showOrderPopup(order) {
    const body = document.getElementById('popup-body');
    const prod = appData.products.find(p => p.name === order.product);
    body.innerHTML = `<div class="dash-list-item"><span class="dli-label">Nama</span><span class="dli-value">${order.name}</span></div><div class="dash-list-item"><span class="dli-label">No. HP</span><span class="dli-value">${order.phone}</span></div><div class="dash-list-item"><span class="dli-label">Lokasi</span><span class="dli-value">${order.location}</span></div><div class="dash-list-item"><span class="dli-label">Produk</span><span class="dli-value">${order.product}</span></div><div class="dash-list-item"><span class="dli-label">Jumlah</span><span class="dli-value">${order.quantity} ${prod ? prod.unit : ''}</span></div><div class="dash-list-item"><span class="dli-label">Total</span><span class="dli-value green">${formatRupiah(order.total)}</span></div><div class="dash-list-item"><span class="dli-label">Status</span><span class="order-status-badge badge-pending">Menunggu</span></div>${order.note ? `<div class="dash-list-item"><span class="dli-label">Catatan</span><span class="dli-value">${order.note}</span></div>` : ''}`;
    document.getElementById('order-popup').classList.remove('hidden');
}

document.getElementById('close-popup').addEventListener('click', () => { document.getElementById('order-popup').classList.add('hidden'); });

// ===== My Orders (Customer View) =====
function renderMyOrders() {
    const container = document.getElementById('my-orders-list');
    const myPhone = document.getElementById('my-orders-phone').value.trim();
    let orders = [...appData.orders].reverse();
    if (myPhone) orders = orders.filter(o => o.phone === myPhone);

    if (!orders.length) {
        container.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--text-muted);"><i class="fas fa-inbox" style="font-size:2.5rem;margin-bottom:12px;display:block;opacity:0.3;"></i>Belum ada pesanan</div>';
        return;
    }

    container.innerHTML = orders.map(o => {
        const prod = appData.products.find(p => p.name === o.product);
        const statusBadge = o.status === 'done'
            ? '<span class="order-status-badge badge-done"><i class="fas fa-check"></i> Selesai</span>'
            : '<span class="order-status-badge badge-pending"><i class="fas fa-clock"></i> Menunggu</span>';
        return `<div class="my-order-card"><div class="my-order-header"><span class="my-order-product">${o.product}</span>${statusBadge}</div><div class="my-order-detail"><span>${o.quantity} ${prod ? prod.unit : ''}</span><span>${formatDateLabel(o.date)}</span></div><div class="my-order-detail"><span>${o.name}</span><span>${o.phone}</span></div>${o.location ? `<div class="my-order-detail"><span style="font-size:0.8rem;"><i class="fas fa-map-marker-alt" style="color:var(--primary);margin-right:4px;"></i>${o.location}</span></div>` : ''}<div class="my-order-total"><span>Total</span><span class="price">${formatRupiah(o.total || 0)}</span></div></div>`;
    }).join('');
}

document.getElementById('my-orders-search').addEventListener('click', renderMyOrders);

// ===== Dashboard Tabs =====
document.querySelectorAll('.dash-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
        if (tab.dataset.tab === 'overview') renderOverview();
        if (tab.dataset.tab === 'sales') renderSalesTable();
        if (tab.dataset.tab === 'expenses') renderExpensesTable();
        if (tab.dataset.tab === 'daily') renderDailyReport();
        if (tab.dataset.tab === 'orders') renderOrdersList();
        if (tab.dataset.tab === 'reports') renderPeriodReports();
    });
});

// ===== Login =====
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const u = document.getElementById('login-username').value, p = document.getElementById('login-password').value;
    if (u === appData.admin.username && p === appData.admin.password) {
        appData.isLoggedIn = true;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-content').classList.remove('hidden');
        renderOverview(); renderSalesTable(); renderExpensesTable(); renderDailyReport(); renderOrdersList();
        showToast('Login berhasil!');
    } else { showToast('Username atau password salah!', true); }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    appData.isLoggedIn = false;
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('dashboard-content').classList.add('hidden');
    document.getElementById('login-form').reset();
    showToast('Berhasil logout');
});

// ===== Overview =====
function renderOverview() {
    const today = getTodayStr();
    const todaySales = appData.sales.filter(s => s.date === today);
    const todayExpenses = appData.expenses.filter(e => e.date === today);
    const pendingOrders = appData.orders.filter(o => o.status === 'pending').length;

    let totalProfit = 0, totalSalesCount = 0;
    const profitByProduct = {};
    todaySales.forEach(sale => {
        const prod = appData.products.find(p => p.name === sale.product);
        if (prod) {
            const profit = (prod.sellPrice - prod.buyPrice) * sale.quantity;
            totalProfit += profit; totalSalesCount += sale.quantity;
            profitByProduct[sale.product] = (profitByProduct[sale.product] || 0) + profit;
        }
    });
    const totalExpense = todayExpenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalProfit - totalExpense;

    document.getElementById('total-sales').textContent = totalSalesCount;
    document.getElementById('total-profit').textContent = formatRupiah(totalProfit);
    document.getElementById('total-expense').textContent = formatRupiah(totalExpense);
    document.getElementById('total-net').textContent = formatRupiah(netProfit);

    const ps = document.getElementById('profit-summary');
    ps.innerHTML = '';
    appData.products.forEach(p => {
        const profit = profitByProduct[p.name] || 0;
        ps.innerHTML += `<div class="dash-list-item"><span class="dli-label">${p.name}</span><span class="dli-value ${profit > 0 ? 'green' : ''}">${formatRupiah(profit)}</span></div>`;
    });
    ps.innerHTML += `<div class="dash-list-item" style="border-top:2px solid var(--border); margin-top:6px; padding-top:12px;"><span class="dli-label"><strong>Total Keuntungan</strong></span><span class="dli-value green"><strong>${formatRupiah(totalProfit)}</strong></span></div><div class="dash-list-item"><span class="dli-label"><strong>Total Pengeluaran</strong></span><span class="dli-value red"><strong>${formatRupiah(totalExpense)}</strong></span></div><div class="dash-list-item"><span class="dli-label"><strong>Laba Bersih</strong></span><span class="dli-value" style="color:${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}; font-size:1rem;"><strong>${formatRupiah(netProfit)}</strong></span></div>`;

    const rs = document.getElementById('recent-sales');
    rs.innerHTML = '';
    const recent = [...appData.sales].reverse().slice(0, 8);
    if (!recent.length) { rs.innerHTML = '<div class="dash-list-item"><span class="dli-label">Belum ada penjualan</span></div>'; }
    else { recent.forEach(sale => { const prod = appData.products.find(p => p.name === sale.product); const total = prod ? prod.sellPrice * sale.quantity : 0; rs.innerHTML += `<div class="dash-list-item"><span class="dli-label">${sale.product} (${sale.quantity}) - ${sale.date}</span><span class="dli-value green">${formatRupiah(total)}</span></div>`; }); }

    const po = document.getElementById('pending-orders-count');
    if (po) po.textContent = pendingOrders;
}

// ===== Sales =====
document.getElementById('sale-date').value = getTodayStr();
let editingSaleId = null;

document.getElementById('sale-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const product = document.getElementById('sale-product').value;
    const quantity = parseInt(document.getElementById('sale-quantity').value);
    const date = document.getElementById('sale-date').value;
    if (!product || !quantity || !date) { showToast('Isi semua field!', true); return; }
    if (editingSaleId) {
        const sale = appData.sales.find(s => s.id === editingSaleId);
        if (sale) { sale.product = product; sale.quantity = quantity; sale.date = date; sale.timestamp = new Date().toISOString(); }
        editingSaleId = null; showToast('Penjualan berhasil diupdate!');
    } else {
        appData.sales.push({ id: genId(), product, quantity, date, timestamp: new Date().toISOString() });
        showToast('Penjualan tersimpan!');
    }
    saveData(); renderSalesTable(); renderOverview(); this.reset(); document.getElementById('sale-date').value = getTodayStr();
});

function renderSalesTable() {
    const tbody = document.getElementById('sales-tbody');
    tbody.innerHTML = '';
    [...appData.sales].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(sale => {
        const prod = appData.products.find(p => p.name === sale.product);
        if (!prod) return;
        const total = prod.sellPrice * sale.quantity;
        const isEditing = editingSaleId === sale.id;
        const row = document.createElement('tr');
        row.style.background = isEditing ? 'rgba(59,130,246,0.06)' : '';
        row.innerHTML = `<td>${sale.date}</td><td><strong>${sale.product}</strong></td><td>${sale.quantity} ${prod.unit}</td><td>${formatRupiah(total)}</td><td><button class="btn-tbl btn-tbl-edit" onclick="editSale('${sale.id}')" title="Edit"><i class="fas fa-pen"></i></button><button class="btn-tbl btn-tbl-del" onclick="deleteSale('${sale.id}')" title="Hapus"><i class="fas fa-trash"></i></button></td>`;
        tbody.appendChild(row);
    });
}

function editSale(id) {
    const sale = appData.sales.find(s => s.id === id);
    if (!sale) return;
    editingSaleId = id;
    document.getElementById('sale-product').value = sale.product;
    document.getElementById('sale-quantity').value = sale.quantity;
    document.getElementById('sale-date').value = sale.date;
    renderSalesTable();
    document.getElementById('sale-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Sedang edit - ubah data lalu klik Simpan');
}

function deleteSale(id) {
    if (!confirm('Hapus penjualan ini?')) return;
    appData.sales = appData.s mit', function (e) {
    e.preventDefault();
    const desc = document.getElementById('expense-desc').value.trim();
    const amount = parseInt(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    if (!desc || !amount || !date) { showToast('Isi semua field!', true); return; }
    if (editingExpenseId) {
        const exp = appData.expenses.find(x => x.id === editingExpenseId);
        if (exp) { exp.description = desc; exp.amount = amount; exp.date = date; exp.timestamp = new Date().toISOString(); }
        editingExpenseId = null; showToast('Pengeluaran berhasil diupdate!');
    } else {
        appData.expenses.push({ id: genId(), description: desc, amount, date, timestamp: new Date().toISOString() });
        showToast('Pengeluaran tersimpan!');
    }
    saveData(); renderExpensesTable(); renderOverview(); this.reset(); document.getElementById('expense-date').value = getTodayStr();
});

function renderExpensesTable() {
    const tbody = document.getElementById('expenses-tbody');
    tbody.innerHTML = '';
    [...appData.expenses].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(exp => {
        const isEditing = editingExpenseId === exp.id;
        const row = document.createElement('tr');
        row.style.background = isEditing ? 'rgba(59,130,246,0.06)' : '';
        row.innerHTML = `<td>${exp.date}</td><td>${exp.description}</td><td style="color:var(--danger);font-weight:700;">${formatRupiah(exp.amount)}</td><td><button class="btn-tbl btn-tbl-edit" onclick="editExpense('${exp.id}')" title="Edit"><i class="fas fa-pen"></i></button><button class="btn-tbl btn-tbl-del" onclick="deleteExpense('${exp.id}')" title="Hapus"><i class="fas fa-trash"></i></button></td>`;
        tbody.appendChild(row);
    });
}

function editExpense(id) {
    const exp = appData.expenses.find(e => e.id === id);
    if (!exp) return;
    editingExpenseId = id;
    document.getElementById('expense-desc').value = exp.description;
    document.getElementById('expense-amount').value = exp.amount;
    document.getElementById('expense-date').value = exp.date;
    renderExpensesTable();
    document.getElementById('expense-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Sedang edit - ubah data lalu klik Simpan');
}

function deleteExpense(id) {
    if (!confirm('Hapus pengeluaran ini?')) return;
    appData.expenses = appData.expenses.filter(e => e.id !== id);
    if (editingExpenseId === id) editingExpenseId = null;
    saveData(); renderExpensesTable(); renderOverview(); showToast('Pengeluaran dihapus');
}

// ===== Orders Management (Admin) =====
function renderOrdersList() {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';
    const orders = [...appData.orders].reverse();
    if (!orders.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px;">Belum ada pesanan</td></tr>';
        return;
    }
    orders.forEach(o => {
        const prod = appData.products.find(p => p.name === o.product);
        const badge = o.status === 'done'
            ? '<span class="order-status-badge badge-done"><i class="fas fa-check"></i> Selesai</span>'
            : '<span class="order-status-badge badge-pending"><i class="fas fa-clock"></i> Pending</span>';
        const row = document.createElement('tr');
        row.innerHTML = `<td>${o.date}</td><td><strong>${o.name}</strong><br><small style="color:var(--text-muted);">${o.phone}</small></td><td>${o.product}</td><td>${o.quantity} ${prod ? prod.unit : ''}</td><td>${badge}</td><td>${o.status !== 'done' ? `<button class="btn-tbl btn-tbl-edit" onclick="completeOrder('${o.id}')" title="Selesaikan"><i class="fas fa-check"></i></button>` : ''}<button class="btn-tbl btn-tbl-del" onclick="deleteOrder('${o.id}')" title="Hapus"><i class="fas fa-trash"></i></button></td>`;
        tbody.appendChild(row);
    });
}

function completeOrder(id) {
    const order = appData.orders.find(o => o.id === id);
    if (order) { order.status = 'done'; saveData(); renderOrdersList(); showToast('Pesanan diselesaikan!'); }
}

function deleteOrder(id) {
    if (!confirm('Hapus pesanan ini?')) return;
    appData.orders = appData.orders.filter(o => o.id !== id);
    saveData(); renderOrdersList(); showToast('Pesanan dihapus');
}

// ===== Daily =====
document.getElementById('daily-date').value = getTodayStr();
document.getElementById('view-daily').addEventListener('click', renderDailyReport);

function renderDailyReport() {
    const selDate = document.getElementById('daily-date').value;
    const tbody = document.getElementById('daily-tbody');
    tbody.innerHTML = '';
    const allDates = new Set();
    appData.sales.forEach(s => allDates.add(s.date));
    appData.expenses.forEach(e => allDates.add(e.date));
    const sortedDates = [...allDates].sort().reverse();
    if (!sortedDates.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">Belum ada data</td></tr>'; return; }

    sortedDates.forEach(date => {
        const daySales = appData.sales.filter(s => s.date === date);
        const dayExp = appData.expenses.filter(e => e.date === date);
        let dayTotal = 0, dayProfit = 0;
        daySales.forEach(s => { const p = appData.products.find(x => x.name === s.product); if (p) { dayTotal += p.sellPrice * s.quantity; dayProfit += (p.sellPrice - p.buyPrice) * s.quantity; } });
        const dayExpAmt = dayExp.reduce((s, e) => s + e.amount, 0);
        const net = dayProfit - dayExpAmt;
        const row = document.createElement('tr');
        row.innerHTML = `<td><strong>${formatDateLabel(date)}</strong></td><td>${formatRupiah(dayTotal)}</td><td style="color:var(--success);font-weight:600;">${formatRupiah(dayProfit)}</td><td style="color:var(--danger);font-weight:600;">${formatRupiah(dayExpAmt)}</td><td style="color:${net >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:700;">${formatRupiah(net)}</td>`;
        tbody.appendChild(row);
    });

    const dailySummary = document.getElementById('daily-summary');
    if (selDate) {
        const ds = appData.sales.filter(s => s.date === selDate);
        const de = appData.expenses.filter(e => e.date === selDate);
        let dt = 0, dp = 0;
        ds.forEach(s => { const p = appData.products.find(x => x.name === s.product); if (p) { dt += p.sellPrice * s.quantity; dp += (p.sellPrice - p.buyPrice) * s.quantity; } });
        const deAmt = de.reduce((s, e) => s + e.amount, 0);
        const net = dp - deAmt;
        const d = new Date(selDate + 'T00:00:00');
        const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
        const dateLabel = `${dayName}, ${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][d.getMonth()]} ${d.getFullYear()}`;
        dailySummary.innerHTML = `<div class="dsummary-card" style="grid-column: 1/-1; background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.04)); border: 1px solid rgba(16,185,129,0.15);"><div class="label" style="font-size:0.8rem; color:var(--primary); font-weight:700;">${dateLabel}</div></div><div class="dsummary-card"><div class="label">Penjualan</div><div class="value">${formatRupiah(dt)}</div></div><div class="dsummary-card"><div class="label">Keuntungan</div><div class="value green">${formatRupiah(dp)}</div></div><div class="dsummary-card"><div class="label">Pengeluaran</div><div class="value red">${formatRupiah(deAmt)}</div></div><div class="dsummary-card"><div class="label">Laba Bersih</div><div class="value" style="color:${net >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatRupiah(net)}</div></div>`;
    } else { dailySummary.innerHTML = ''; }
}

// ===== Period Reports (Monthly/Yearly) =====
function renderPeriodReports() {
    const now = new Date();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    // Monthly report for current year
    const year = now.getFullYear();
    const monthlyData = [];
    for (let m = 0; m < 12; m++) {
        let mSales = 0, mProfit = 0, mExpense = 0;
        appData.sales.filter(s => { const d = new Date(s.date + 'T00:00:00'); return d.getFullYear() === year && d.getMonth() === m; }).forEach(s => {
            const p = appData.products.find(x => x.name === s.product);
            if (p) { mSales += p.sellPrice * s.quantity; mProfit += (p.sellPrice - p.buyPrice) * s.quantity; }
        });
        appData.expenses.filter(e => { const d = new Date(e.date + 'T00:00:00'); return d.getFullYear() === year && d.getMonth() === m; }).forEach(e => { mExpense += e.amount; });
        if (mSales > 0 || mExpense > 0) monthlyData.push({ month: monthNames[m], sales: mSales, profit: mProfit, expense: mExpense, net: mProfit - mExpense });
    }

    const tbody = document.getElementById('monthly-tbody');
    tbody.innerHTML = '';
    let totalSalesAll = 0, totalProfitAll = 0, totalExpAll = 0;
    monthlyData.forEach(d => {
        totalSalesAll += d.sales; totalProfitAll += d.profit; totalExpAll += d.expense;
        const row = document.createElement('tr');
        row.innerHTML = `<td><strong>${d.month}</strong></td><td>${formatRupiah(d.sales)}</td><td style="color:var(--success);font-weight:600;">${formatRupiah(d.profit)}</td><td style="color:var(--danger);font-weight:600;">${formatRupiah(d.expense)}</td><td style="color:${d.net >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:700;">${formatRupiah(d.net)}</td>`;
        tbody.appendChild(row);
    });
    if (!monthlyData.length) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">Belum ada data tahun ini</td></tr>';

    document.getElementById('yearly-total-profit').textContent = formatRupiah(totalProfitAll);
    document.getElementById('yearly-total-expense').textContent = formatRupiah(totalExpAll);
    document.getElementById('yearly-total-net').textContent = formatRupiah(totalProfitAll - totalExpAll);

    // All-time summary
    let allProfit = 0, allExpense = 0, allSales = 0;
    appData.sales.forEach(s => { const p = appData.products.find(x => x.name === s.product); if (p) { allSales += p.sellPrice * s.quantity; allProfit += (p.sellPrice - p.buyPrice) * s.quantity; } });
    allExpense = appData.expenses.reduce((s, e) => s + e.amount, 0);
    document.getElementById('alltime-sales').textContent = formatRupiah(allSales);
    document.getElementById('alltime-profit').textContent = formatRupiah(allProfit);
    document.getElementById('alltime-expense').textContent = formatRupiah(allExpense);
    document.getElementById('alltime-net').textContent = formatRupiah(allProfit - allExpense);
}

// ===== Download CSV =====
document.getElementById('download-daily').addEventListener('click', () => downloadCSV(false));
document.getElementById('download-all').addEventListener('click', () => downloadCSV(true));

function downloadCSV(all) {
    const selDate = document.getElementById('daily-date').value;
    let sales = appData.sales, expenses = appData.expenses;
    if (!all && selDate) { sales = sales.filter(s => s.date === selDate); expenses = expenses.filter(e => e.date === selDate); }

    let csv = '\uFEFFLAPORAN DATA PENJUALAN - KIOS JURUS TANDUR\n\nDATA PENJUALAN\nTanggal,Produk,Jumlah,Harga Jual,Modal,Keuntungan\n';
    sales.forEach(s => { const p = appData.products.find(x => x.name === s.product); if (p) csv += `${s.date},${s.product},${s.quantity},${p.sellPrice * s.quantity},${p.buyPrice * s.quantity},${(p.sellPrice - p.buyPrice) * s.quantity}\n`; });
    csv += '\nDATA PENGELUARAN\nTanggal,Keterangan,Jumlah\n';
    expenses.forEach(e => { csv += `${e.date},${e.description},${e.amount}\n`; });
    let tp = 0, te = 0;
    sales.forEach(s => { const p = appData.products.find(x => x.name === s.product); if (p) tp += (p.sellPrice - p.buyPrice) * s.quantity; });
    te = expenses.reduce((s, e) => s + e.amount, 0);
    csv += `\nRINGKASAN\nTotal Keuntungan,${tp}\nTotal Pengeluaran,${te}\nLaba Bersih,${tp - te}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = all ? 'Laporan_Semua_Data.csv' : `Laporan_${selDate || getTodayStr()}.csv`;
    a.click(); showToast('File diunduh!');
}

// ===== PDF Download =====
document.getElementById('download-pdf-all').addEventListener('click', () => downloadPDF());
document.getElementById('download-pdf-daily').addEventListener('click', () => downloadPDF(true));

function downloadPDF(dailyOnly = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const selDate = document.getElementById('daily-date').value;
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setFillColor(59, 130, 246);
    doc.rect(pageW / 2, 0, pageW / 2, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('LAPORAN PENJUALAN', 15, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('KIOS JURUS TANDUR', 15, 26);
    doc.text(dailyOnly ? `Tanggal: ${selDate || getTodayStr()}` : `Laporan Umum - ${new Date().toLocaleDateString('id-ID')}`, 15, 33);
    y = 50;

    let sales = appData.sales, expenses = appData.expenses;
    if (dailyOnly && selDate) { sales = sales.filter(s => s.date === selDate); expenses = expenses.filter(e => e.date === selDate); }

    // Sales table
    doc.setTextColor(26, 26, 46);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DATA PENJUALAN', 15, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFillColor(16, 185, 129);
    doc.rect(15, y - 4, pageW - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Tanggal', 17, y + 1);
    doc.text('Produk', 45, y + 1);
    doc.text('Jumlah', 90, y + 1);
    doc.text('Harga Jual', 110, y + 1);
    doc.text('Modal', 138, y + 1);
    doc.text('Keuntungan', 162, y + 1);
    y += 8;

    doc.setTextColor(26, 26, 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    let totalRevenue = 0, totalCost = 0, totalProfit = 0;
    sales.forEach((s, i) => {
        const p = appData.products.find(x => x.name === s.product);
        if (!p) return;
        const revenue = p.sellPrice * s.quantity;
        const cost = p.buyPrice * s.quantity;
        const profit = revenue - cost;
        totalRevenue += revenue; totalCost += cost; totalProfit += profit;

        if (i % 2 === 0) { doc.setFillColor(240, 253, 244); doc.rect(15, y - 4, pageW - 30, 7, 'F'); }
        doc.text(s.date, 17, y);
        doc.text(s.product, 45, y);
        doc.text(`${s.quantity} ${p.unit}`, 90, y);
        doc.text(formatRupiah(revenue), 110, y);
        doc.text(formatRupiah(cost), 138, y);
        doc.setTextColor(5, 150, 105); doc.text(formatRupiah(profit), 162, y);
        doc.setTextColor(26, 26, 46);
        y += 7;
        if (y > 270) { doc.addPage(); y = 20; }
    });

    // Totals
    y += 3;
    doc.setDrawColor(229, 231, 235); doc.line(15, y, pageW - 15, y); y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text('Total:', 17, y);
    doc.text(formatRupiah(totalRevenue), 110, y);
    doc.text(formatRupiah(totalCost), 138, y);
    doc.setTextColor(5, 150, 105); doc.text(formatRupiah(totalProfit), 162, y);
    y += 12;

    // Expenses
    doc.setTextColor(26, 26, 46);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DATA PENGELUARAN', 15, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFillColor(239, 68, 68);
    doc.rect(15, y - 4, pageW - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Tanggal', 17, y + 1);
    doc.text('Keterangan', 45, y + 1);
    doc.text('Jumlah', 120, y + 1);
    y += 8;

    doc.setTextColor(26, 26, 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    let totalExp = 0;
    expenses.forEach((e, i) => {
        totalExp += e.amount;
        if (i % 2 === 0) { doc.setFillColor(254, 242, 242); doc.rect(15, y - 4, pageW - 30, 7, 'F'); }
        doc.text(e.date, 17, y);
        doc.text(e.description, 45, y);
        doc.setTextColor(239, 68, 68); doc.text(formatRupiah(e.amount), 120, y);
        doc.setTextColor(26, 26, 46);
        y += 7;
        if (y > 270) { doc.addPage(); y = 20; }
    });

    // Summary box
    y += 10;
    if (y > 240) { doc.addPage(); y = 20; }
    const net = totalProfit - totalExp;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(15, y - 5, pageW - 30, 35, 3, 3, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(15, y - 5, pageW - 30, 35, 3, 3, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.text('RINGKASAN', 20, y + 3);
    doc.setFontSize(9);
    doc.setTextColor(26, 26, 46);
    doc.text('Total Pendapatan:', 20, y + 12); doc.text(formatRupiah(totalRevenue), 80, y + 12);
    doc.text('Total Modal:', 20, y + 19); doc.text(formatRupiah(totalCost), 80, y + 19);
    doc.text('Total Keuntungan:', 20, y + 26); doc.text(formatRupiah(totalProfit), 80, y + 26);
    doc.text('Total Pengeluaran:', 20, y + 33); doc.text(formatRupiah(totalExp), 80, y + 33);
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105);
    doc.text(`Laba Bersih: ${formatRupiah(net)}`, 120, y + 26);

    doc.save(`Laporan_${dailyOnly ? (selDate || getTodayStr()) : 'Semua_Data'}.pdf`);
    showToast('PDF berhasil diunduh!');
}

// ===== Settings =====
document.getElementById('save-images').addEventListener('click', () => {
    const logoInput = document.getElementById('logo-upload');
    if (logoInput.files[0]) {
        const r = new FileReader();
        r.onload = e => { appData.settings.logo = e.target.result; document.getElementById('logo-img').src = e.target.result; saveData(); };
        r.readAsDataURL(logoInput.files[0]);
    }
    const map = { 'img-pertalite': 'Pertalite', 'img-pertamax': 'Pertamax', 'img-lpg': 'Gas LPG 3KG', 'img-leminerale': 'Le Minerale' };
    Object.entries(map).forEach(([id, name]) => {
        const input = document.getElementById(id);
        if (input.files[0]) {
            const r = new FileReader();
            r.onload = e => { appData.settings.images[name] = e.target.result; saveData(); renderProducts(); };
            r.readAsDataURL(input.files[0]);
        }
    });
    showToast('Gambar tersimpan!');
});

document.getElementById('save-prices').addEventListener('click', () => {
    appData.products[0].buyPrice = parseInt(document.getElementById('price-pertalite-buy').value) || 10000;
    appData.products[0].sellPrice = parseInt(document.getElementById('price-pertalite-sell').value) || 12000;
    appData.products[1].buyPrice = parseInt(document.getElementById('price-pertamax-buy').value) || 16000;
    appData.products[1].sellPrice = parseInt(document.getElementById('price-pertamax-sell').value) || 18000;
    appData.products[2].buyPrice = parseInt(document.getElementById('price-lpg-buy').value) || 19500;
    appData.products[2].sellPrice = parseInt(document.getElementById('price-lpg-sell').value) || 22000;
    appData.products[3].buyPrice = parseInt(document.getElementById('price-leminerale-buy').value) || 20000;
    appData.products[3].sellPrice = parseInt(document.getElementById('price-leminerale-sell').value) || 22000;
    appData.settings.whatsappNumber = document.getElementById('whatsapp-number').value || '085778837136';
    saveData(); renderProducts(); showToast('Pengaturan tersimpan!');
});

function loadSettings() {
    document.getElementById('price-pertalite-buy').value = appData.products[0].buyPrice;
    document.getElementById('price-pertalite-sell').value = appData.products[0].sellPrice;
    document.getElementById('price-pertamax-buy').value = appData.products[1].buyPrice;
    document.getElementById('price-pertamax-sell').value = appData.products[1].sellPrice;
    document.getElementById('price-lpg-buy').value = appData.products[2].buyPrice;
    document.getElementById('price-lpg-sell').value = appData.products[2].sellPrice;
    document.getElementById('price-leminerale-buy').value = appData.products[3].buyPrice;
    document.getElementById('price-leminerale-sell').value = appData.products[3].sellPrice;
    document.getElementById('whatsapp-number').value = appData.settings.whatsappNumber;
    if (appData.settings.logo) document.getElementById('logo-img').src = appData.settings.logo;
    const previews = { Pertalite: 'preview-pertalite', Pertamax: 'preview-pertamax', 'Gas LPG 3KG': 'preview-lpg', 'Le Minerale': 'preview-leminerale' };
    Object.entries(previews).forEach(([name, id]) => { if (appData.settings.images[name]) { const el = document.getElementById(id); if (el) { el.src = appData.settings.images[name]; el.classList.add('show'); } } });
    const waNum = appData.settings.whatsappNumber.replace(/[^0-9]/g, '');
    document.getElementById('wa-home-btn').href = `https://wa.me/${waNum}`;
}

['logo-upload', 'img-pertalite', 'img-pertamax', 'img-lpg', 'img-leminerale'].forEach(id => {
    document.getElementById(id).addEventListener('change', function () {
        if (this.files[0]) {
            const r = new FileReader();
            r.onload = e => {
                const previewId = { 'logo-upload': 'logo-preview', 'img-pertalite': 'preview-pertalite', 'img-pertamax': 'preview-pertamax', 'img-lpg': 'preview-lpg', 'img-leminerale': 'preview-leminerale' }[id];
                const el = document.getElementById(previewId);
                if (el) { el.src = e.target.result; el.classList.add('show'); }
            };
            r.readAsDataURL(this.files[0]);
        }
    });
});

// ===== Init =====
function init() { renderProducts(); loadSettings(); }
init();
