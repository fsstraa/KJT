function renderAll() {
    renderProducts();
    loadSettings();
    if (typeof renderOverview === 'function') renderOverview();
    if (typeof renderSalesTable === 'function') renderSalesTable();
    if (typeof renderExpensesTable === 'function') renderExpensesTable();
    if (typeof renderDailyReport === 'function') renderDailyReport();
    if (typeof renderOrdersList === 'function') renderOrdersList();
    if (typeof renderMyOrders === 'function') renderMyOrders();
}

document.querySelectorAll('.dash-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
        if (tab.dataset.tab === 'overview') renderOverview();
        if (tab.dataset.tab === 'sales') renderSalesTable();
        if (tab.dataset.tab === 'expenses') renderExpensesTable();
        if (tab.dataset.tab === 'daily') renderDailyReport();
        if (tab.dataset.tab === 'orders') renderOrdersList();
        if (tab.dataset.tab === 'reports') renderPeriodReports();
    });
});

let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 3;

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const u = document.getElementById('login-username').value, p = document.getElementById('login-password').value;
    if (u === appData.admin.username && p === appData.admin.password) {
        loginAttempts = 0;
        appData.isLoggedIn = true;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-content').classList.remove('hidden');
        renderAll();
        showToast('Login berhasil!');
    } else {
        loginAttempts++;
        showToast(`Login gagal (${loginAttempts}/${MAX_LOGIN_ATTEMPTS})`, true);
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            openForgot();
            showToast('3x salah! Jawab pertanyaan keamanan untuk reset password.', true);
        }
    }
});

function openForgot() {
    const qEl = document.getElementById('forgot-q');
    qEl.textContent = appData.admin.securityQuestion
        ? 'Pertanyaan: ' + appData.admin.securityQuestion
        : 'Pertanyaan keamanan belum diatur. Setel dulu di menu Pengaturan → Keamanan.';
    document.getElementById('forgot-screen').classList.remove('hidden');
    document.getElementById('forgot-screen').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.getElementById('show-forgot').addEventListener('click', openForgot);

document.getElementById('back-to-login').addEventListener('click', () => {
    document.getElementById('forgot-screen').classList.add('hidden');
});

document.getElementById('forgot-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!appData.admin.securityQuestion || !appData.admin.securityAnswer) {
        showToast('Pertanyaan keamanan belum diatur!', true);
        return;
    }
    const ans = document.getElementById('forgot-answer').value;
    const nw = document.getElementById('forgot-new').value;
    const cf = document.getElementById('forgot-confirm').value;
    if (normalizeAnswer(ans) !== appData.admin.securityAnswer) { showToast('Jawaban keamanan salah!', true); return; }
    if (!nw || nw.length < 4) { showToast('Password baru minimal 4 karakter!', true); return; }
    if (nw !== cf) { showToast('Konfirmasi password tidak cocok!', true); return; }
    appData.admin.password = nw;
    saveData();
    loginAttempts = 0;
    document.getElementById('forgot-screen').classList.add('hidden');
    document.getElementById('forgot-form').reset();
    showToast('Password berhasil di-reset, silakan login!');
});

document.getElementById('logout-btn').addEventListener('click', () => {
    appData.isLoggedIn = false;
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('dashboard-content').classList.add('hidden');
    document.getElementById('login-form').reset();
    showToast('Berhasil logout');
});

init();