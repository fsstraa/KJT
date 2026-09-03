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
