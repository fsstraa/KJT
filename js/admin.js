function renderOverview() {
    const today = getTodayStr();
    const todaySales = appData.sales.filter(s => s.date === today);
    const todayExpenses = appData.expenses.filter(e => e.date === today);

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
}

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
        row.style.background = isEditing ? 'rgba(185,28,28,0.06)' : '';
        row.innerHTML = `<td>${sale.date}</td><td><strong>${sale.product}</strong></td><td>${sale.quantity} ${prod.unit}</td><td>${formatRupiah(total)}</td><td><button class="btn-tbl btn-tbl-edit" onclick="editSale('${sale.id}')"><i class="fas fa-pen"></i></button><button class="btn-tbl btn-tbl-del" onclick="deleteSale('${sale.id}')"><i class="fas fa-trash"></i></button></td>`;
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
    appData.sales = appData.sales.filter(s => s.id !== id);
    if (editingSaleId === id) editingSaleId = null;
    saveData(); renderSalesTable(); renderOverview(); showToast('Penjualan dihapus');
}

document.getElementById('expense-date').value = getTodayStr();
let editingExpenseId = null;

document.getElementById('expense-form').addEventListener('submit', function (e) {
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
        row.style.background = isEditing ? 'rgba(185,28,28,0.06)' : '';
        row.innerHTML = `<td>${exp.date}</td><td>${exp.description}</td><td style="color:var(--danger);font-weight:700;">${formatRupiah(exp.amount)}</td><td><button class="btn-tbl btn-tbl-edit" onclick="editExpense('${exp.id}')"><i class="fas fa-pen"></i></button><button class="btn-tbl btn-tbl-del" onclick="deleteExpense('${exp.id}')"><i class="fas fa-trash"></i></button></td>`;
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
