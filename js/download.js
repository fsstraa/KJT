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
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = all ? 'Laporan_Semua_Data.csv' : `Laporan_${selDate || getTodayStr()}.csv`;
    a.click();
    showToast('File diunduh!');
}

document.getElementById('download-pdf-daily').addEventListener('click', () => downloadPDF(true));
document.getElementById('download-pdf-all').addEventListener('click', () => downloadPDF(false));

function downloadPDF(dailyOnly = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const selDate = document.getElementById('daily-date').value;
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

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

    doc.setTextColor(26, 26, 46);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DATA PENJUALAN', 15, y);
    y += 8;
    doc.setFontSize(8);
    doc.setFillColor(16, 185, 129);
    doc.rect(15, y - 4, pageW - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Tanggal', 17, y + 1); doc.text('Produk', 45, y + 1); doc.text('Jumlah', 90, y + 1);
    doc.text('Harga Jual', 110, y + 1); doc.text('Modal', 138, y + 1); doc.text('Keuntungan', 162, y + 1);
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
        doc.text(s.date, 17, y); doc.text(s.product, 45, y); doc.text(`${s.quantity} ${p.unit}`, 90, y);
        doc.text(formatRupiah(revenue), 110, y); doc.text(formatRupiah(cost), 138, y);
        doc.setTextColor(5, 150, 105); doc.text(formatRupiah(profit), 162, y);
        doc.setTextColor(26, 26, 46);
        y += 7;
        if (y > 270) { doc.addPage(); y = 20; }
    });

    y += 3;
    doc.setDrawColor(229, 231, 235); doc.line(15, y, pageW - 15, y); y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text('Total:', 17, y);
    doc.text(formatRupiah(totalRevenue), 110, y); doc.text(formatRupiah(totalCost), 138, y);
    doc.setTextColor(5, 150, 105); doc.text(formatRupiah(totalProfit), 162, y);
    y += 12;

    doc.setTextColor(26, 26, 46);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text('DATA PENGELUARAN', 15, y);
    y += 8;
    doc.setFontSize(8);
    doc.setFillColor(239, 68, 68);
    doc.rect(15, y - 4, pageW - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Tanggal', 17, y + 1); doc.text('Keterangan', 45, y + 1); doc.text('Jumlah', 120, y + 1);
    y += 8;

    doc.setTextColor(26, 26, 46); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    let totalExp = 0;
    expenses.forEach((e, i) => {
        totalExp += e.amount;
        if (i % 2 === 0) { doc.setFillColor(254, 242, 242); doc.rect(15, y - 4, pageW - 30, 7, 'F'); }
        doc.text(e.date, 17, y); doc.text(e.description, 45, y);
        doc.setTextColor(239, 68, 68); doc.text(formatRupiah(e.amount), 120, y);
        doc.setTextColor(26, 26, 46);
        y += 7;
        if (y > 270) { doc.addPage(); y = 20; }
    });

    y += 10;
    if (y > 240) { doc.addPage(); y = 20; }
    const net = totalProfit - totalExp;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(15, y - 5, pageW - 30, 35, 3, 3, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(15, y - 5, pageW - 30, 35, 3, 3, 'S');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.setTextColor(16, 185, 129); doc.text('RINGKASAN', 20, y + 3);
    doc.setFontSize(9); doc.setTextColor(26, 26, 46);
    doc.text('Total Pendapatan:', 20, y + 12); doc.text(formatRupiah(totalRevenue), 80, y + 12);
    doc.text('Total Modal:', 20, y + 19); doc.text(formatRupiah(totalCost), 80, y + 19);
    doc.text('Total Keuntungan:', 20, y + 26); doc.text(formatRupiah(totalProfit), 80, y + 26);
    doc.text('Total Pengeluaran:', 20, y + 33); doc.text(formatRupiah(totalExp), 80, y + 33);
    doc.setFontSize(11); doc.setTextColor(5, 150, 105);
    doc.text(`Laba Bersih: ${formatRupiah(net)}`, 120, y + 26);

    doc.save(`Laporan_${dailyOnly ? (selDate || getTodayStr()) : 'Semua_Data'}.pdf`);
    showToast('PDF berhasil diunduh!');
}
