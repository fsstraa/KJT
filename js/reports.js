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

function renderPeriodReports() {
    const year = new Date().getFullYear();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
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
    let ts = 0, tp = 0, te = 0;
    monthlyData.forEach(d => {
        ts += d.sales; tp += d.profit; te += d.expense;
        const row = document.createElement('tr');
        row.innerHTML = `<td><strong>${d.month}</strong></td><td>${formatRupiah(d.sales)}</td><td style="color:var(--success);font-weight:600;">${formatRupiah(d.profit)}</td><td style="color:var(--danger);font-weight:600;">${formatRupiah(d.expense)}</td><td style="color:${d.net >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:700;">${formatRupiah(d.net)}</td>`;
        tbody.appendChild(row);
    });
    if (!monthlyData.length) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">Belum ada data tahun ini</td></tr>';

    document.getElementById('yearly-total-profit').textContent = formatRupiah(tp);
    document.getElementById('yearly-total-expense').textContent = formatRupiah(te);
    document.getElementById('yearly-total-net').textContent = formatRupiah(tp - te);

    let allProfit = 0, allExpense = 0, allSales = 0;
    appData.sales.forEach(s => { const p = appData.products.find(x => x.name === s.product); if (p) { allSales += p.sellPrice * s.quantity; allProfit += (p.sellPrice - p.buyPrice) * s.quantity; } });
    allExpense = appData.expenses.reduce((s, e) => s + e.amount, 0);
    document.getElementById('alltime-sales').textContent = formatRupiah(allSales);
    document.getElementById('alltime-profit').textContent = formatRupiah(allProfit);
    document.getElementById('alltime-expense').textContent = formatRupiah(allExpense);
    document.getElementById('alltime-net').textContent = formatRupiah(allProfit - allExpense);
}
