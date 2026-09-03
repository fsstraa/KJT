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
