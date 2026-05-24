const supabaseConfig = {
  url: 'https://dozxxknekdhnvpbfetib.supabase.co',
  key: 'sb_publishable_56uJhm9sp4SbzzwWgO3P6Q_oboIl3Jo',
};

const supabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.key, {
  auth: {
    detectSessionInUrl: true,
    flowType: 'implicit',
    persistSession: true,
    autoRefreshToken: true,
  },
});

const state = {
  transactions: [],
  filter: 'all',
  reportMode: 'day',
  editingId: null,
  loadingCount: 0,
  user: null,
  chart: null,
};

const elements = {
  authShell: document.getElementById('authShell'),
  appShell: document.getElementById('appShell'),
  loginTab: document.getElementById('loginTab'),
  registerTab: document.getElementById('registerTab'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  registerEmail: document.getElementById('registerEmail'),
  registerPassword: document.getElementById('registerPassword'),
  logoutButton: document.getElementById('logoutButton'),
  userEmail: document.getElementById('userEmail'),
  form: document.getElementById('transactionForm'),
  transactionId: document.getElementById('transactionId'),
  type: document.getElementById('type'),
  title: document.getElementById('title'),
  amount: document.getElementById('amount'),
  transactionDate: document.getElementById('transactionDate'),
  category: document.getElementById('category'),
  note: document.getElementById('note'),
  submitButton: document.getElementById('submitButton'),
  cancelEditButton: document.getElementById('cancelEditButton'),
  refreshButton: document.getElementById('refreshButton'),
  transactionList: document.getElementById('transactionList'),
  loading: document.getElementById('loading'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  emptyState: document.getElementById('emptyState'),
  alert: document.getElementById('alert'),
  incomeTotal: document.getElementById('incomeTotal'),
  expenseTotal: document.getElementById('expenseTotal'),
  balanceTotal: document.getElementById('balanceTotal'),
  filterButtons: document.querySelectorAll('.filter-button[data-filter]'),
  reportButtons: document.querySelectorAll('.filter-button[data-report]'),
  financeChart: document.getElementById('financeChart'),
  reportList: document.getElementById('reportList'),
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function setLoading(isLoading) {
  state.loadingCount += isLoading ? 1 : -1;
  state.loadingCount = Math.max(0, state.loadingCount);

  const shouldShow = state.loadingCount > 0;
  elements.loading.classList.toggle('hidden', !shouldShow);
  elements.loadingOverlay.classList.toggle('hidden', !shouldShow);
}

function swalOptions(options) {
  return {
    background: '#111c2e',
    color: '#f4f7fb',
    confirmButtonColor: '#22c55e',
    ...options,
  };
}

function friendlyAuthMessage(message) {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('email not confirmed')) {
    return 'บัญชีนี้ยังไม่ได้ยืนยันอีเมล กรุณาเปิดอีเมลจาก Supabase แล้วกดยืนยันก่อนเข้าสู่ระบบ';
  }

  if (normalized.includes('email rate limit exceeded') || normalized.includes('rate limit')) {
    return 'ส่งอีเมลยืนยันบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่ หรือปิดการยืนยันอีเมลใน Supabase ระหว่างทดสอบ';
  }

  if (normalized.includes('transactions') || normalized.includes('schema cache')) {
    return 'ยังไม่ได้สร้างตาราง transactions หรือยังไม่ได้รัน SQL สำหรับระบบรายรับรายจ่าย กรุณารันไฟล์ supabase-finance-setup.sql ใน Supabase SQL Editor';
  }

  if (normalized.includes('row-level security') || normalized.includes('violates row-level security')) {
    return 'ยังไม่ได้ตั้งค่า RLS policy ให้ถูกต้อง กรุณารันไฟล์ supabase-finance-setup.sql ใน Supabase SQL Editor';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  }

  if (normalized.includes('already registered')) {
    return 'อีเมลนี้ถูกลงทะเบียนแล้ว กรุณาเข้าสู่ระบบแทน';
  }

  if (normalized.includes('password')) {
    return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
  }

  return message || 'เกิดข้อผิดพลาด';
}

function showError(message) {
  const displayMessage = friendlyAuthMessage(message);
  elements.alert.textContent = displayMessage;
  elements.alert.classList.remove('hidden');

  if (window.Swal) {
    Swal.fire(swalOptions({
      title: 'เกิดข้อผิดพลาด',
      text: displayMessage,
      icon: 'error',
      confirmButtonText: 'ตกลง',
    }));
  }
}

function clearError() {
  elements.alert.textContent = '';
  elements.alert.classList.add('hidden');
}

function showSuccess(message) {
  if (!window.Swal) {
    return;
  }

  Swal.fire(swalOptions({
    title: 'สำเร็จ',
    text: message,
    icon: 'success',
    timer: 1500,
    showConfirmButton: false,
  }));
}

async function confirmDelete() {
  if (!window.Swal) {
    return window.confirm('ต้องการลบรายการนี้ใช่ไหม?');
  }

  const result = await Swal.fire(swalOptions({
    title: 'ยืนยันการลบ?',
    text: 'เมื่อลบแล้วจะไม่สามารถกู้คืนรายการนี้ได้',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ลบรายการ',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#fb7185',
    cancelButtonColor: '#334155',
  }));

  return result.isConfirmed;
}

function setAuthMode(mode) {
  const isLogin = mode === 'login';
  elements.loginTab.classList.toggle('active', isLogin);
  elements.registerTab.classList.toggle('active', !isLogin);
  elements.loginForm.classList.toggle('hidden', !isLogin);
  elements.registerForm.classList.toggle('hidden', isLogin);
}

function showAuthenticatedApp(user) {
  state.user = user;
  elements.userEmail.textContent = user.email;
  elements.authShell.classList.add('hidden');
  elements.appShell.classList.remove('hidden');

  if (window.location.hash.includes('access_token')) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function showAuthScreen() {
  state.user = null;
  state.transactions = [];
  resetForm();
  renderTransactions();
  elements.userEmail.textContent = '';
  elements.appShell.classList.add('hidden');
  elements.authShell.classList.remove('hidden');
}

async function handleLogin(event) {
  event.preventDefault();
  clearError();
  setLoading(true);

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: elements.loginEmail.value.trim(),
      password: elements.loginPassword.value,
    });

    if (error) {
      throw error;
    }

    elements.loginForm.reset();
    showAuthenticatedApp(data.user);
    await loadTransactions();
    showSuccess('เข้าสู่ระบบเรียบร้อยแล้ว');
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  clearError();
  setLoading(true);

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: elements.registerEmail.value.trim(),
      password: elements.registerPassword.value,
      options: {
        emailRedirectTo: 'https://sendflex-e6b9a.web.app/superbase',
      },
    });

    if (error) {
      throw error;
    }

    elements.registerForm.reset();

    if (data.session) {
      showAuthenticatedApp(data.user);
      await loadTransactions();
      showSuccess('ลงทะเบียนและเข้าสู่ระบบเรียบร้อยแล้ว');
      return;
    }

    setAuthMode('login');
    showSuccess('ลงทะเบียนเรียบร้อยแล้ว กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ');
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

async function handleLogout() {
  clearError();
  setLoading(true);

  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      throw error;
    }

    showAuthScreen();
    showSuccess('ออกจากระบบเรียบร้อยแล้ว');
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function getReportKey(value, mode) {
  const date = new Date(`${value}T00:00:00`);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (mode === 'year') {
    return String(year);
  }

  if (mode === 'month') {
    return `${year}-${month}`;
  }

  return `${year}-${month}-${day}`;
}

function getReportLabel(key, mode) {
  if (mode === 'year') {
    return key;
  }

  if (mode === 'month') {
    const [year, month] = key.split('-').map(Number);
    return new Intl.DateTimeFormat('th-TH', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(year, month - 1, 1));
  }

  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${key}T00:00:00`));
}

function getVisibleTransactions() {
  if (state.filter === 'income') {
    return state.transactions.filter((item) => item.type === 'income');
  }

  if (state.filter === 'expense') {
    return state.transactions.filter((item) => item.type === 'expense');
  }

  return state.transactions;
}

function updateSummary() {
  const income = state.transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = state.transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  elements.incomeTotal.textContent = formatCurrency(income);
  elements.expenseTotal.textContent = formatCurrency(expense);
  elements.balanceTotal.textContent = formatCurrency(income - expense);
}

function renderTransactions() {
  updateSummary();
  renderReports();

  const transactions = getVisibleTransactions();
  elements.transactionList.innerHTML = '';
  elements.emptyState.classList.toggle('hidden', transactions.length > 0);

  transactions.forEach((transaction) => {
    const item = document.createElement('li');
    item.className = `task-item finance-item ${transaction.type}`;

    const badge = document.createElement('span');
    badge.className = `finance-badge ${transaction.type}`;
    badge.textContent = transaction.type === 'income' ? 'รับ' : 'จ่าย';

    const content = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = transaction.title;

    const details = document.createElement('p');
    details.className = 'task-description';
    details.textContent = transaction.note || transaction.category || 'ไม่มีรายละเอียด';

    const meta = document.createElement('span');
    meta.className = 'task-date';
    meta.textContent = `${transaction.category || 'ไม่ระบุหมวดหมู่'} • ${formatDate(transaction.transaction_date)}`;

    content.append(title, details, meta);

    const amount = document.createElement('strong');
    amount.className = `finance-amount ${transaction.type}`;
    amount.textContent = formatCurrency(transaction.amount);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editButton = document.createElement('button');
    editButton.className = 'task-action';
    editButton.type = 'button';
    editButton.textContent = 'แก้ไข';
    editButton.addEventListener('click', () => startEdit(transaction));

    const deleteButton = document.createElement('button');
    deleteButton.className = 'task-action danger';
    deleteButton.type = 'button';
    deleteButton.textContent = 'ลบ';
    deleteButton.addEventListener('click', () => deleteTransaction(transaction.id));

    actions.append(editButton, deleteButton);
    item.append(badge, content, amount, actions);
    elements.transactionList.appendChild(item);
  });
}

function getReportRows() {
  const grouped = new Map();

  state.transactions.forEach((transaction) => {
    const key = getReportKey(transaction.transaction_date, state.reportMode);

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        label: getReportLabel(key, state.reportMode),
        income: 0,
        expense: 0,
      });
    }

    const row = grouped.get(key);
    row[transaction.type] += Number(transaction.amount);
  });

  return Array.from(grouped.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function renderChart(rows) {
  if (!window.Chart || !elements.financeChart) {
    return;
  }

  if (state.chart) {
    state.chart.destroy();
  }

  state.chart = new Chart(elements.financeChart, {
    type: 'bar',
    data: {
      labels: rows.map((row) => row.label),
      datasets: [
        {
          label: 'รายรับ',
          data: rows.map((row) => row.income),
          backgroundColor: 'rgba(34, 197, 94, 0.72)',
          borderColor: '#86efac',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'รายจ่าย',
          data: rows.map((row) => row.expense),
          backgroundColor: 'rgba(251, 113, 133, 0.68)',
          borderColor: '#fda4af',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#f4f7fb',
            font: {
              family: 'Prompt',
            },
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#9aa8bd',
            font: {
              family: 'Prompt',
            },
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.12)',
          },
        },
        y: {
          ticks: {
            color: '#9aa8bd',
            callback(value) {
              return new Intl.NumberFormat('th-TH', {
                notation: 'compact',
              }).format(value);
            },
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.12)',
          },
        },
      },
    },
  });
}

function renderReportList(rows) {
  elements.reportList.innerHTML = '';

  if (rows.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'report-empty';
    empty.textContent = 'ยังไม่มีข้อมูลสำหรับแสดงรายงาน';
    elements.reportList.appendChild(empty);
    return;
  }

  rows.slice().reverse().forEach((row) => {
    const item = document.createElement('article');
    item.className = 'report-row';

    const balance = row.income - row.expense;
    item.innerHTML = `
      <strong>${row.label}</strong>
      <span class="report-income">${formatCurrency(row.income)}</span>
      <span class="report-expense">${formatCurrency(row.expense)}</span>
      <span class="${balance >= 0 ? 'report-income' : 'report-expense'}">${formatCurrency(balance)}</span>
    `;

    elements.reportList.appendChild(item);
  });
}

function renderReports() {
  const rows = getReportRows();
  renderChart(rows);
  renderReportList(rows);
}

async function loadTransactions() {
  if (!state.user) {
    return;
  }

  clearError();
  setLoading(true);

  try {
    const { data, error } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', state.user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    state.transactions = data || [];
    renderTransactions();
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.transactionId.value = '';
  elements.transactionDate.value = today();
  elements.submitButton.textContent = '+ บันทึกรายการ';
  elements.cancelEditButton.classList.add('hidden');
}

function startEdit(transaction) {
  clearError();
  state.editingId = transaction.id;
  elements.transactionId.value = transaction.id;
  elements.type.value = transaction.type;
  elements.title.value = transaction.title;
  elements.amount.value = transaction.amount;
  elements.transactionDate.value = transaction.transaction_date;
  elements.category.value = transaction.category || '';
  elements.note.value = transaction.note || '';
  elements.submitButton.textContent = 'บันทึกการแก้ไข';
  elements.cancelEditButton.classList.remove('hidden');
  elements.title.focus();
}

function getFormData() {
  return {
    type: elements.type.value,
    title: elements.title.value.trim(),
    amount: Number(elements.amount.value),
    transaction_date: elements.transactionDate.value,
    category: elements.category.value.trim() || null,
    note: elements.note.value.trim() || null,
  };
}

async function saveTransaction(event) {
  event.preventDefault();
  clearError();

  if (!state.user) {
    showError('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    return;
  }

  const transaction = getFormData();

  if (!transaction.title || !transaction.amount || transaction.amount <= 0) {
    showError('กรุณากรอกชื่อรายการและจำนวนเงินให้ถูกต้อง');
    return;
  }

  const isEditing = Boolean(state.editingId);
  elements.submitButton.disabled = true;
  setLoading(true);

  try {
    const query = supabaseClient.from('transactions');
    const { error } = isEditing
      ? await query.update(transaction).eq('id', state.editingId).eq('user_id', state.user.id)
      : await query.insert({ ...transaction, user_id: state.user.id });

    if (error) {
      throw error;
    }

    resetForm();
    await loadTransactions();
    showSuccess(isEditing ? 'แก้ไขรายการเรียบร้อยแล้ว' : 'บันทึกรายการเรียบร้อยแล้ว');
  } catch (err) {
    showError(err.message);
  } finally {
    elements.submitButton.disabled = false;
    setLoading(false);
  }
}

async function deleteTransaction(id) {
  clearError();

  const confirmed = await confirmDelete();

  if (!confirmed) {
    return;
  }

  setLoading(true);

  try {
    const { error } = await supabaseClient
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', state.user.id);

    if (error) {
      throw error;
    }

    if (state.editingId === id) {
      resetForm();
    }

    await loadTransactions();
    showSuccess('ลบรายการเรียบร้อยแล้ว');
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

function setFilter(filter) {
  state.filter = filter;

  elements.filterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });

  renderTransactions();
}

function setReportMode(mode) {
  state.reportMode = mode;

  elements.reportButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.report === mode);
  });

  renderReports();
}

async function initAuth() {
  elements.transactionDate.value = today();
  setLoading(true);

  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
      throw error;
    }

    if (data.session?.user) {
      showAuthenticatedApp(data.session.user);
      await loadTransactions();
    } else {
      showAuthScreen();
    }
  } catch (err) {
    showAuthScreen();
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

elements.loginTab.addEventListener('click', () => setAuthMode('login'));
elements.registerTab.addEventListener('click', () => setAuthMode('register'));
elements.loginForm.addEventListener('submit', handleLogin);
elements.registerForm.addEventListener('submit', handleRegister);
elements.logoutButton.addEventListener('click', handleLogout);
elements.form.addEventListener('submit', saveTransaction);
elements.cancelEditButton.addEventListener('click', resetForm);
elements.refreshButton.addEventListener('click', loadTransactions);

elements.filterButtons.forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

elements.reportButtons.forEach((button) => {
  button.addEventListener('click', () => setReportMode(button.dataset.report));
});

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    showAuthScreen();
    return;
  }

  if (session?.user && !state.user) {
    showAuthenticatedApp(session.user);
    loadTransactions();
  }
});

initAuth();
