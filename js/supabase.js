// ============================================================
//  Supabase Sync Engine
//  Data disimpan sebagai satu baris JSON di tabel `kjt_app`.
//  - local-first (localStorage) agar tetap cepat di HP
//  - tulis perubahan ke cloud (Supabase)
//  - realtime: perubahan dari perangkat lain otomatis muncul
// ============================================================

let supabase = null;
let sbEnabled = false;
let sbLoading = false;
let sbUpsertQueue = false;

const TABLE = 'kjt_app';
const ROW_ID = 'kjt-data';

async function sbInit() {
    if (sbLoading) return;
    sbLoading = true;
    try {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
            console.warn('[Supabase] URL/anonKey belum diisi di js/supabase-config.js');
            sbEnabled = false;
            return;
        }
        supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        sbEnabled = true;
        console.log('[Supabase] Terhubung ke cloud');
        await sbPull();
        subscribeRealtime();
        const el = document.getElementById('db-status');
        if (el) {
            el.querySelector('span').textContent = 'Database Cloud';
            el.classList.add('show');
        }
    } catch (e) {
        console.error('[Supabase] Gagal konek:', e);
        sbEnabled = false;
    } finally {
        sbLoading = false;
    }
}

async function sbPull() {
    if (!sbEnabled) return;
    try {
        const { data } = await supabase.from(TABLE).select('payload, updated_at').eq('id', ROW_ID).single();
        if (data && data.payload) {
            const serverData = data.payload;
            if (serverData.updatedAt && new Date(serverData.updatedAt) > new Date(appData._dbTime || 0)) {
                mergeServerData(serverData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
                if (typeof renderAll === 'function') renderAll();
            }
        }
    } catch (e) { console.warn('[Supabase] Pull gagal:', e.message); }
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
        if (error) console.warn('[Supabase] Push gagal:', error.message);
    } catch (e) { console.warn('[Supabase] Push error:', e); }
    sbUpsertQueue = false;
}

function subscribeRealtime() {
    try {
        supabase.channel('kjt-sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE, filter: `id=eq.${ROW_ID}` }, async () => {
                // debounce: perangkat lain menyimpan -> tarik data terbaru
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