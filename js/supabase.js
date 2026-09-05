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
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
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

// Ambil data dari cloud (yang lebih baru menang)
async function sbPull() {
    if (!sbEnabled) return;
    try {
        const { data, error } = await supabase.from(TABLE).select('payload, updated_at').eq('id', ROW_ID).single();

        // Baris belum ada di cloud -> biarkan push lokal yang isi
        if (error && error.code === 'PGRST116') return;
        if (error) { console.warn('[Supabase] Pull gagal:', error.message); return; }

        if (data && data.payload) {
            const serverData = data.payload;
            const serverTime = new Date(serverData.updatedAt || 0);
            const localTime = new Date(appData._dbTime || 0);

            // Cloud lebih baru -> tarik ke lokal
            if (serverTime > localTime) {
                mergeServerData(serverData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
                if (typeof renderAll === 'function') renderAll();
            }
            // Lokal lebih baru -> nanti di-push oleh sbPush()
        }
    } catch (e) { console.warn('[Supabase] Pull error:', e); }
}

function mergeServerData(serverData) {
    appData.products = serverData.products || appData.products;
    appData.sales = serverData.sales || [];
    appData.expenses = serverData.expenses || [];
    appData.orders = serverData.orders || [];
    appData.settings = { ...appData.settings, ...serverData.settings };
    appData._dbTime = serverData.updatedAt;
}

async function sbPush() {
    if (!sbEnabled) return;
    if (sbUpsertQueue) return;
    sbUpsertQueue = true;
    const payload = {
        products: appData.products,
        sales: appData.sales,
        expenses: appData.expenses,
        orders: appData.orders,
        settings: appData.settings,
        updatedAt: new Date().toISOString()
    };
    appData._dbTime = payload.updatedAt;
    try {
        const { error } = await supabase.from(TABLE).upsert({ id: ROW_ID, payload }, { onConflict: 'id' });
        if (error) { console.warn('[Supabase] Push gagal:', error.message); setStatus('offline'); }
    } catch (e) { console.warn('[Supabase] Push error:', e); setStatus('offline'); }
    sbUpsertQueue = false;
}

function subscribeRealtime() {
    try {
        supabase.channel('kjt-sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE, filter: `id=eq.${ROW_ID}` }, async () => {
                const peer = await supabase.from(TABLE).select('payload').eq('id', ROW_ID).single();
                if (peer.data && peer.data.payload) {
                    const t = peer.data.payload.updatedAt;
                    if (t && new Date(t) > new Date(appData._dbTime || 0)) {
                        mergeServerData(peer.data.payload);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
                        if (typeof renderAll === 'function') renderAll();
                    }
                }
            })
            .subscribe();
    } catch (e) { console.warn('[Supabase] Realtime gagal:', e); }
}

document.addEventListener('DOMContentLoaded', () => {
    sbInit();
});

window.__sbPush = sbPush;
window.__sbPull = sbPull;
window.__sbEnabled = () => sbEnabled;