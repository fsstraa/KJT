// ============================================================
//  Supabase Sync Engine
//  Data disimpan sebagai satu baris JSON di tabel `kjt_app`.
//  - local-first (localStorage) agar tetap cepat di HP
//  - tulis perubahan ke cloud (Supabase)
//  - realtime: perubahan dari perangkat lain otomatis muncul
//  - migrasi: data lama di localStorage otomatis naik ke cloud
// ============================================================

let supabase = null;
let sbEnabled = false;
let sbLoading = false;
let sbUpsertQueue = false;

const TABLE = 'kjt_app';
const ROW_ID = 'kjt-data';

function setStatus(mode) {
    const el = document.getElementById('db-status');
    if (!el) return;
    const span = el.querySelector('span');
    el.classList.remove('show', 'offline');
    if (mode === 'cloud') {
        span.textContent = 'Database Cloud';
        el.classList.add('show');
    } else if (mode === 'offline') {
        span.textContent = 'Offline - Data Lokal';
        el.classList.add('show');
        el.classList.add('offline');
    } else {
        el.classList.remove('show');
    }
}

async function sbInit() {
    if (sbLoading) return;
    sbLoading = true;
    try {
        let mod;
        try {
            mod = await import('https://esm.sh/@supabase/supabase-js@2');
        } catch (e1) {
            console.warn('[Supabase] esm.sh gagal, coba jsdelivr:', e1);
            mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        }
        const { createClient } = mod;
        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
            console.warn('[Supabase] URL/anonKey belum diisi di js/supabase-config.js');
            setStatus('');
            sbEnabled = false;
            return;
        }
        supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        sbEnabled = true;
        console.log('[Supabase] Terhubung ke cloud');

        // Migrasi + sinkron pertama: data lama dari localStorage naik ke cloud
        await sbPull();
        // Setelah pull, kalau cloud masih kosong/lebih lama -> push data lokal
        await sbPush();
        subscribeRealtime();
        setStatus('cloud');

        // Pantau koneksi internet: kalau offline, tampilkan status lokal
        window.addEventListener('online', () => setStatus('cloud'));
        window.addEventListener('offline', () => setStatus('offline'));
    } catch (e) {
        console.error('[Supabase] Gagal konek:', e);
        sbEnabled = false;
        setStatus('offline');
    } finally {
        sbLoading = false;
    }
}

// Cek apakah payload punya data nyata (bukan kosong)
function hasRealData(d) {
    return (d.orders && d.orders.length) || (d.sales && d.sales.length) || (d.expenses && d.expenses.length);
}

// Ambil data dari cloud.
// Aturan (aman by design):
//  - Pull hanya MENAMBAH data cloud ke lokal (union), TIDAK pernah menghapus/menimpa apa pun dari lokal.
//  - Konflik per item diselesaikan "yang punya timestamp lebih baru menang".
//  - Jadi bagaimanapun urutan/timezone/perangkat, hasil edit tidak akan hilang saat refresh.
async function sbPull() {
    if (!sbEnabled) return;
    try {
        const { data, error } = await supabase.from(TABLE).select('payload, updated_at').eq('id', ROW_ID).single();

        // Baris belum ada di cloud -> biarkan push lokal yang isi
        if (error && error.code === 'PGRST116') return;
        if (error) { console.warn('[Supabase] Pull gagal:', error.message); return; }

        if (data && data.payload) {
            const serverData = data.payload;
            // Jangan gabungkan baris placeholder kosong
            if (hasRealData(serverData)) {
                mergeServerData(serverData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
                if (typeof renderAll === 'function') renderAll();
            }
            // Selain itu: jaga data lokal, nanti sbPush() yang meng-upload ke cloud
        }
    } catch (e) { console.warn('[Supabase] Pull error:', e); }
}

// Gabungkan data cloud ke lokal secara non-destruktif (union).
// Aturan per item: beda id -> ambil; id sama -> ikut yang timestamp-nya lebih baru.
// Produk: lokal menang untuk id yang sama (jarang konflik), cloud mengisi jika lokal kosong.
function mergeServerData(serverData) {
    appData.products = unionById(appData.products, serverData.products, false);
    appData.sales = unionById(appData.sales, serverData.sales);
    appData.expenses = unionById(appData.expenses, serverData.expenses);
    appData.orders = unionById(appData.orders, serverData.orders);
    appData.settings = { ...appData.settings, ...(serverData.settings || {}) };
}

function unionById(localArr, serverArr, newestWins) {
    const local = Array.isArray(localArr) ? localArr : [];
    const server = Array.isArray(serverArr) ? serverArr : [];
    if (!server.length) return local;
    const byId = new Map();
    local.forEach(x => { if (x && x.id !== undefined) byId.set(x.id, x); });
    server.forEach(x => {
        if (!x || x.id === undefined) return;
        const ex = byId.get(x.id);
        if (!ex) { byId.set(x.id, x); return; }
        if (newestWins === false) return;
        const a = new Date(ex.timestamp || 0), b = new Date(x.timestamp || 0);
        if (b > a) byId.set(x.id, x);
    });
    return Array.from(byId.values());
}

let sbDirty = false;

// Request push: kalau lagi ada push berjalan, tandai "perlu push lagi" setelah selesai
async function sbPush() {
    if (!sbEnabled) return;
    sbDirty = true;
    runPush();
}
async function runPush() {
    if (!sbEnabled || sbUpsertQueue) return;
    sbUpsertQueue = true;
    sbDirty = false;
    const payload = {
        products: appData.products,
        sales: appData.sales,
        expenses: appData.expenses,
        orders: appData.orders,
        settings: appData.settings,
        updatedAt: new Date().toISOString()
    };
    appData._dbTime = payload.updatedAt;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    try {
        const { error } = await supabase.from(TABLE).upsert({ id: ROW_ID, payload }, { onConflict: 'id' });
        if (error) { console.warn('[Supabase] Push gagal:', error.message); setStatus('offline'); }
    } catch (e) { console.warn('[Supabase] Push error:', e); setStatus('offline'); }
    sbUpsertQueue = false;
    if (sbDirty) runPush();
}

function subscribeRealtime() {
    try {
        supabase.channel('kjt-sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE, filter: `id=eq.${ROW_ID}` }, async () => {
                const peer = await supabase.from(TABLE).select('payload').eq('id', ROW_ID).single();
                if (peer.data && peer.data.payload) {
                    const t = peer.data.payload.updatedAt;
                    const peerHas = hasRealData(peer.data.payload);
                    if (peerHas && t && new Date(t) > new Date(appData._dbTime || 0)) {
                        mergeServerData(peer.data.payload);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
                        if (typeof renderAll === 'function') renderAll();
                    }
                }
            })
            .subscribe();
    } catch (e) { console.warn('[Supabase] Realtime gagal:', e); }
}

// Saat tab website di-fokus-kan lagi, tarik ulang dari cloud (= konten terbaru dari perangkat lain)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') sbPull();
});

document.addEventListener('DOMContentLoaded', () => {
    sbInit();
});

window.__sbPush = sbPush;
window.__sbPull = sbPull;
window.__sbEnabled = () => sbEnabled;