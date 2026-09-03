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

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const u = document.getElementById('login-username').value, p = document.getElementById('login-password').value;
    if (u === appData.admin.username && p === appData.admin.password) {
        appData.isLoggedIn = true;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-content').classList.remove('hidden');
        renderOverview(); renderSalesTable(); renderExpensesTable(); renderDailyReport(); renderOrdersList();
        showToast('Login berhasil!');
    } else { showToast('Username atau password salah!', true); }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    appData.isLoggedIn = false;
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('dashboard-content').classList.add('hidden');
    document.getElementById('login-form').reset();
    showToast('Berhasil logout');
});

function init() { renderProducts(); loadSettings(); }

function initOnBackendLoad() {
    renderProducts(); loadSettings(); renderOverview(); renderSalesTable(); renderExpensesTable(); renderDailyReport(); renderOrdersList(); renderMyOrders();
}

init();
