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

    const waMsg = encodeURIComponent(`*PESANAN BARU - KIOS JURUS TANDUR*\n\nNama: ${name}\nNo. HP: ${phone}\nLokasi: ${location}\nProduk: ${product}\nJumlah: ${quantity} ${prod ? prod.unit : ''}\nTotal: ${formatRupiah(total)}\n${note ? `Catatan: ${note}\n` : ''}\nTerima kasih sudah memesan!`);
    const waNum = appData.settings.whatsappNumber.replace(/[^0-9]/g, '');

    this.reset();
    showOrderPopup(order);
    window.location.href = `https://wa.me/${waNum}?text=${waMsg}`;
});

function showOrderPopup(order) {
    const body = document.getElementById('popup-body');
    const prod = appData.products.find(p => p.name === order.product);
    body.innerHTML = `<div class="dash-list-item"><span class="dli-label">Nama</span><span class="dli-value">${order.name}</span></div><div class="dash-list-item"><span class="dli-label">No. HP</span><span class="dli-value">${order.phone}</span></div><div class="dash-list-item"><span class="dli-label">Lokasi</span><span class="dli-value">${order.location}</span></div><div class="dash-list-item"><span class="dli-label">Produk</span><span class="dli-value">${order.product}</span></div><div class="dash-list-item"><span class="dli-label">Jumlah</span><span class="dli-value">${order.quantity} ${prod ? prod.unit : ''}</span></div><div class="dash-list-item"><span class="dli-label">Total</span><span class="dli-value green">${formatRupiah(order.total)}</span></div>${order.note ? `<div class="dash-list-item"><span class="dli-label">Catatan</span><span class="dli-value">${order.note}</span></div>` : ''}`;
    document.getElementById('order-popup').classList.remove('hidden');
}

document.getElementById('close-popup').addEventListener('click', () => { document.getElementById('order-popup').classList.add('hidden'); });

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
        const badge = o.status === 'done'
            ? '<span class="order-status-badge badge-done"><i class="fas fa-check"></i> Selesai</span>'
            : '<span class="order-status-badge badge-pending"><i class="fas fa-clock"></i> Menunggu</span>';
        return `<div class="my-order-card"><div class="my-order-header"><span class="my-order-product">${o.product}</span>${badge}</div><div class="my-order-detail"><span>${o.quantity} ${prod ? prod.unit : ''}</span><span>${formatDateLabel(o.date)}</span></div><div class="my-order-detail"><span>${o.name}</span><span>${o.phone}</span></div>${o.location ? `<div class="my-order-detail"><span style="font-size:0.8rem;"><i class="fas fa-map-marker-alt" style="color:var(--primary);margin-right:4px;"></i>${o.location}</span></div>` : ''}<div class="my-order-total"><span>Total</span><span class="price">${formatRupiah(o.total || 0)}</span></div></div>`;
    }).join('');
}

document.getElementById('my-orders-search').addEventListener('click', renderMyOrders);

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
        row.innerHTML = `<td>${o.date}</td><td><strong>${o.name}</strong><br><small style="color:var(--text-muted);">${o.phone}</small></td><td>${o.product}</td><td>${o.quantity} ${prod ? prod.unit : ''}</td><td>${badge}</td><td>${o.status !== 'done' ? `<button class="btn-tbl btn-tbl-edit" onclick="completeOrder('${o.id}')"><i class="fas fa-check"></i></button>` : ''}<button class="btn-tbl btn-tbl-del" onclick="deleteOrder('${o.id}')"><i class="fas fa-trash"></i></button></td>`;
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
