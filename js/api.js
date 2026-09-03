let backendConnected = false;

async function syncToBackend() {
    try {
        const upsert = (url, data) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const results = await Promise.all([
            ...appData.orders.map(o => upsert('/api/orders', o)),
            ...appData.sales.map(s => upsert('/api/sales', s)),
            ...appData.expenses.map(e => upsert('/api/expenses', e)),
            fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(appData.settings) })
        ]);
        backendConnected = results.every(r => r.ok);
        const el = document.getElementById('db-status');
        if (el) el.classList.add('show');
    } catch (e) {
        backendConnected = false;
    }
}

async function removeFromBackend(type, id) {
    try { await fetch(`/api/${type}/${id}`, { method: 'DELETE' }); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', async () => {
    const ok = await loadFromBackend();
    if (ok) {
        backendConnected = true;
        const el = document.getElementById('db-status');
        if (el) el.classList.add('show');
        if (typeof initOnBackendLoad === 'function') initOnBackendLoad();
    }
});

window.__syncToBackend = syncToBackend;
window.__removeFromBackend = removeFromBackend;
