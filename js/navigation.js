function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');

    document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
    const navBtn = document.querySelector(`.bnav-item[data-page="${page}"]`);
    if (navBtn) navBtn.classList.add('active');

    window.scrollTo(0, 0);

    if (page === 'dashboard') { renderSalesTable(); renderExpensesTable(); renderDailyReport(); renderOrdersList(); }
    if (page === 'my-orders') renderMyOrders();
}

function stockBadge(p) {
    if (!isStockTracked(p)) return '';
    if (p.stock <= 0) return '<span class="b-stock b-stock-habis">Habis</span>';
    if (p.stock <= (p.stockMin || 0)) return `<span class="b-stock b-stock-low">Stok menipis (${p.stock})</span>`;
    return `<span class="b-stock b-stock-ok">Stok ${p.stock}</span>`;
}

function renderProducts() {
    const scroll = document.getElementById('home-products');
    scroll.innerHTML = '';
    appData.products.forEach(p => {
        const imgSrc = appData.settings.images[p.name];
        const out = isStockTracked(p) && p.stock <= 0;
        const card = document.createElement('div');
        card.className = 'product-scroll-card';
        card.onclick = () => { document.getElementById('order-product').value = p.name; switchPage('order'); };
        card.innerHTML = `<div class="psc-image" style="background: linear-gradient(135deg, ${p.color}15, ${p.color}30);">${out ? '<span class="b-stock b-stock-habis" style="position:absolute;top:8px;right:8px;">Habis</span>' : ''}${imgSrc ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" alt="${p.name}">` : `<span>${p.icon}</span>`}</div><div class="psc-body"><div class="psc-name">${p.name}</div><div class="psc-price">${formatRupiah(p.sellPrice)}<span class="psc-unit"> /${p.unit}</span></div>${stockBadge(p)}</div>`;
        scroll.appendChild(card);
    });

    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    appData.products.forEach(p => {
        const imgSrc = appData.settings.images[p.name];
        const out = isStockTracked(p) && p.stock <= 0;
        const card = document.createElement('div');
        card.className = 'pgrid-card';
        card.innerHTML = `<div class="pgrid-image" style="background: linear-gradient(135deg, ${p.color}15, ${p.color}30);">${out ? '<span class="b-stock b-stock-habis" style="position:absolute;top:8px;right:8px;">Habis</span>' : ''}${imgSrc ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" alt="${p.name}">` : `<span>${p.icon}</span>`}</div><div class="pgrid-body"><div class="pgrid-name">${p.name}</div><div class="pgrid-price">${formatRupiah(p.sellPrice)}</div><span class="pgrid-unit">per ${p.unit}</span>${stockBadge(p)}${out ? '<button class="btn-order-sm" disabled style="opacity:.45;cursor:not-allowed;">Habis</button>' : `<button class="btn-order-sm" onclick="document.getElementById('order-product').value='${p.name}'; switchPage('order');"><i class="fab fa-whatsapp"></i> Pesan</button>`}</div>`;
        grid.appendChild(card);
    });
}
