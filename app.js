const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const counter = document.getElementById('task-counter');

function loadTasks() {
    let stored;
    try {
        stored = JSON.parse(localStorage.getItem('tasks'));
    } catch {
        stored = null;
    }
    if (!Array.isArray(stored)) {
        return [];
    }
    // Tasks saved before the "done" field existed are treated as not done.
    return stored.map((task) => ({ ...task, done: task.done === true }));
}

const tasks = loadTasks();

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderCounter() {
    const remaining = tasks.filter((task) => !task.done).length;
    counter.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} remaining`;
}

function renderTasks() {
    list.innerHTML = '';

    // Keep each task's original index so delete/toggle hit the right item
    // after sorting. Array.prototype.sort is stable, so order within each
    // group (not done / done) is preserved.
    const ordered = tasks
        .map((task, index) => ({ task, index }))
        .sort((a, b) => Number(a.task.done) - Number(b.task.done));

    ordered.forEach(({ task, index }) => {
        const li = document.createElement('li');
        li.className = task.done ? 'task-item done' : 'task-item';

        const label = document.createElement('label');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-toggle';
        checkbox.checked = task.done;
        checkbox.dataset.index = index;

        const text = document.createElement('span');
        text.className = 'task-text';
        text.textContent = task.text;

        label.append(checkbox, text);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.dataset.index = index;
        deleteBtn.textContent = 'Delete';

        li.append(label, deleteBtn);
        list.appendChild(li);
    });

    renderCounter();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
        tasks.push({ text, createdAt: Date.now(), done: false });
        saveTasks();
        renderTasks();
        input.value = '';
    }
});

list.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const index = parseInt(e.target.dataset.index, 10);
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }
});

list.addEventListener('change', (e) => {
    if (e.target.classList.contains('task-toggle')) {
        const index = parseInt(e.target.dataset.index, 10);
        tasks[index].done = e.target.checked;
        saveTasks();
        renderTasks();
    }
});

renderTasks();
