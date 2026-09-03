function formatRupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

function getTodayStr() { return new Date().toISOString().split('T')[0]; }

function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

function showToast(msg, err = false) {
    const t = document.getElementById('toast'), m = document.getElementById('toast-message');
    m.textContent = msg;
    t.className = err ? 'toast-bar error' : 'toast-bar';
    t.classList.remove('hidden');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.add('hidden'), 2500);
}

function formatDateLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()];
    return `${dayName}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
