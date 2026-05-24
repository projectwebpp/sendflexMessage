const apiUrl = '/tasks';

const state = {
  tasks: [],
  filter: 'all',
  editingId: null,
};

const elements = {
  form: document.getElementById('taskForm'),
  taskId: document.getElementById('taskId'),
  title: document.getElementById('title'),
  description: document.getElementById('description'),
  status: document.getElementById('status'),
  submitButton: document.getElementById('submitButton'),
  cancelEditButton: document.getElementById('cancelEditButton'),
  refreshButton: document.getElementById('refreshButton'),
  taskList: document.getElementById('taskList'),
  loading: document.getElementById('loading'),
  emptyState: document.getElementById('emptyState'),
  alert: document.getElementById('alert'),
  totalCount: document.getElementById('totalCount'),
  activeCount: document.getElementById('activeCount'),
  doneCount: document.getElementById('doneCount'),
  filterButtons: document.querySelectorAll('.filter-button'),
};

function setLoading(isLoading) {
  elements.loading.classList.toggle('hidden', !isLoading);
}

function showError(message) {
  elements.alert.textContent = message;
  elements.alert.classList.remove('hidden');
}

function clearError() {
  elements.alert.textContent = '';
  elements.alert.classList.add('hidden');
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getVisibleTasks() {
  if (state.filter === 'active') {
    return state.tasks.filter((task) => !task.status);
  }

  if (state.filter === 'done') {
    return state.tasks.filter((task) => task.status);
  }

  return state.tasks;
}

function updateSummary() {
  const total = state.tasks.length;
  const done = state.tasks.filter((task) => task.status).length;

  elements.totalCount.textContent = total;
  elements.activeCount.textContent = total - done;
  elements.doneCount.textContent = done;
}

function renderTasks() {
  updateSummary();

  const tasks = getVisibleTasks();
  elements.taskList.innerHTML = '';
  elements.emptyState.classList.toggle('hidden', tasks.length > 0);

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = `task-item${task.status ? ' done' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.className = 'task-check';
    checkbox.type = 'checkbox';
    checkbox.checked = task.status;
    checkbox.setAttribute('aria-label', `เปลี่ยนสถานะ ${task.title}`);
    checkbox.addEventListener('change', () => toggleTaskStatus(task));

    const content = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = task.title;

    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = task.description || 'ไม่มีรายละเอียด';

    const date = document.createElement('span');
    date.className = 'task-date';
    date.textContent = `สร้างเมื่อ ${formatDate(task.created_at)}`;

    content.append(title, description, date);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editButton = document.createElement('button');
    editButton.className = 'task-action';
    editButton.type = 'button';
    editButton.textContent = 'แก้ไข';
    editButton.addEventListener('click', () => startEdit(task));

    const deleteButton = document.createElement('button');
    deleteButton.className = 'task-action danger';
    deleteButton.type = 'button';
    deleteButton.textContent = 'ลบ';
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    actions.append(editButton, deleteButton);
    item.append(checkbox, content, actions);
    elements.taskList.appendChild(item);
  });
}

async function loadTasks() {
  clearError();
  setLoading(true);

  try {
    const payload = await requestJson(apiUrl);
    state.tasks = payload.data || [];
    renderTasks();
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.taskId.value = '';
  elements.submitButton.textContent = '+ บันทึกงาน';
  elements.cancelEditButton.classList.add('hidden');
}

function startEdit(task) {
  clearError();
  state.editingId = task.id;
  elements.taskId.value = task.id;
  elements.title.value = task.title;
  elements.description.value = task.description || '';
  elements.status.checked = task.status;
  elements.submitButton.textContent = 'บันทึกการแก้ไข';
  elements.cancelEditButton.classList.remove('hidden');
  elements.title.focus();
}

async function saveTask(event) {
  event.preventDefault();
  clearError();

  const task = {
    title: elements.title.value,
    description: elements.description.value || null,
    status: elements.status.checked,
  };

  const isEditing = Boolean(state.editingId);
  const url = isEditing ? `${apiUrl}/${state.editingId}` : apiUrl;
  const method = isEditing ? 'PUT' : 'POST';

  elements.submitButton.disabled = true;

  try {
    await requestJson(url, {
      method,
      body: JSON.stringify(task),
    });
    resetForm();
    await loadTasks();
  } catch (err) {
    showError(err.message);
  } finally {
    elements.submitButton.disabled = false;
  }
}

async function toggleTaskStatus(task) {
  clearError();

  try {
    await requestJson(`${apiUrl}/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: !task.status }),
    });
    await loadTasks();
  } catch (err) {
    showError(err.message);
    renderTasks();
  }
}

async function deleteTask(id) {
  clearError();

  const confirmed = window.confirm('ต้องการลบงานนี้ใช่ไหม?');

  if (!confirmed) {
    return;
  }

  try {
    await requestJson(`${apiUrl}/${id}`, {
      method: 'DELETE',
    });

    if (state.editingId === id) {
      resetForm();
    }

    await loadTasks();
  } catch (err) {
    showError(err.message);
  }
}

function setFilter(filter) {
  state.filter = filter;

  elements.filterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });

  renderTasks();
}

elements.form.addEventListener('submit', saveTask);
elements.cancelEditButton.addEventListener('click', resetForm);
elements.refreshButton.addEventListener('click', loadTasks);

elements.filterButtons.forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

loadTasks();
