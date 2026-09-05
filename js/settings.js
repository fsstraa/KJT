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
    appData.products.forEach(p => p.ts = new Date().toISOString());
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
    const stockPairs = { Pertalite: 'pertalite', Pertamax: 'pertamax', 'Gas LPG 3KG': 'lpg', 'Le Minerale': 'leminerale' };
    Object.entries(stockPairs).forEach(([name, k]) => {
        const p = productById(name);
        const sEl = document.getElementById(`stock-${k}`), mEl = document.getElementById(`smin-${k}`);
        if (sEl) sEl.value = p && isStockTracked(p) ? p.stock : '';
        if (mEl) mEl.value = p && p.stockMin !== undefined ? p.stockMin : 3;
    });
    const msEl = document.getElementById('modal-start'); if (msEl) msEl.value = appData.settings.modalStart || 0;
    const tpEl = document.getElementById('target-profit'); if (tpEl) tpEl.value = appData.settings.targetProfit || 0;
    const sqEl = document.getElementById('security-question'); if (sqEl) sqEl.value = appData.admin.securityQuestion || '';
    const saEl = document.getElementById('security-answer'); if (saEl) saEl.value = appData.admin.securityAnswer || '';
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

const STOCK_MAP = { Pertalite: 'pertalite', Pertamax: 'pertamax', 'Gas LPG 3KG': 'lpg', 'Le Minerale': 'leminerale' };

document.getElementById('save-stock').addEventListener('click', () => {
    Object.entries(STOCK_MAP).forEach(([name, k]) => {
        const p = productById(name);
        const sVal = document.getElementById(`stock-${k}`).value;
        const mVal = document.getElementById(`smin-${k}`).value;
        if (p) {
            p.stock = sVal === '' || sVal === null ? null : Math.max(0, parseInt(sVal) || 0);
            p.stockMin = mVal === '' ? 3 : Math.max(0, parseInt(mVal) || 0);
        }
    });
    appData.products.forEach(p => p.ts = new Date().toISOString());
    saveData(); renderProducts(); renderOverview();
    showToast('Stok tersimpan!');
});

document.getElementById('save-cash').addEventListener('click', () => {
    appData.settings.modalStart = Math.max(0, parseInt(document.getElementById('modal-start').value) || 0);
    appData.settings.targetProfit = Math.max(0, parseInt(document.getElementById('target-profit').value) || 0);
    saveData(); renderOverview();
    showToast('Kas & modal tersimpan!');
});

document.getElementById('save-password').addEventListener('click', () => {
    const cur = document.getElementById('current-password').value;
    const nw = document.getElementById('new-password').value;
    const cf = document.getElementById('confirm-password').value;
    if (cur !== appData.admin.password) { showToast('Password lama salah!', true); return; }
    if (!nw || nw.length < 4) { showToast('Password baru minimal 4 karakter!', true); return; }
    if (nw !== cf) { showToast('Konfirmasi password tidak cocok!', true); return; }
    appData.admin.password = nw;
    appData.admin.ts = new Date().toISOString();
    saveData();
    ['current-password', 'new-password', 'confirm-password'].forEach(id => document.getElementById(id).value = '');
    showToast('Password berhasil diganti!');
});

document.getElementById('save-security').addEventListener('click', () => {
    const q = document.getElementById('security-question').value.trim();
    const a = document.getElementById('security-answer').value;
    if (!q || !a) { showToast('Isi pertanyaan dan jawaban!', true); return; }
    appData.admin.securityQuestion = q;
    appData.admin.securityAnswer = normalizeAnswer(a);
    appData.admin.ts = new Date().toISOString();
    saveData();
    showToast('Pertanyaan keamanan tersimpan!');
});

document.getElementById('download-backup').addEventListener('click', () => {
    const data = { products: appData.products, sales: appData.sales, expenses: appData.expenses, orders: appData.orders, settings: appData.settings, admin: appData.admin };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    const d = new Date();
    const ts = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
    a.href = URL.createObjectURL(blob);
    a.download = `KJT-backup-${ts}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Cadangan berhasil diunduh!');
});

document.getElementById('restore-file').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    if (!confirm('Pulihkan data dari file cadangan? Data saat ini akan DIGANTI. Lanjut?')) { this.value = ''; return; }
    const r = new FileReader();
    r.onload = e => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (!parsed.products || !parsed.settings) throw new Error('File tidak valid');
            appData = {
                ...DEFAULT_DATA,
                ...parsed,
                settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
                admin: { ...DEFAULT_ADMIN, ...(parsed.admin || {}) }
            };
            ensureProductMeta();
            saveData(); renderAll();
            showToast('Data berhasil dipulihkan!');
        } catch (err) { showToast('File cadangan tidak valid!', true); }
        this.value = '';
    };
    r.readAsText(file);
});
