const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

/**
 * Loads index.html and runs the real app.js in a fresh jsdom window.
 *
 * @param {string|object[]|null} stored Raw string or array to put in
 *   localStorage.tasks before the app starts (null = nothing stored).
 */
function loadApp(stored = null) {
    // runScripts 'outside-only' keeps the <script src="app.js"> tag from
    // loading; we evaluate app.js ourselves after seeding localStorage.
    const dom = new JSDOM(html, {
        url: 'http://localhost/',
        runScripts: 'outside-only',
    });
    const { window } = dom;
    const { document } = window;

    if (stored !== null) {
        const value = typeof stored === 'string' ? stored : JSON.stringify(stored);
        window.localStorage.setItem('tasks', value);
    }

    window.eval(appSource);

    const rows = () => [...document.querySelectorAll('#task-list .task-item')];
    const rowByText = (text) => {
        const row = rows().find((li) => li.querySelector('.task-text').textContent === text);
        if (!row) {
            throw new Error(`No task with text "${text}"`);
        }
        return row;
    };

    return {
        window,
        document,
        rows,
        rowByText,
        visibleTexts: () => rows().map((li) => li.querySelector('.task-text').textContent),
        doneTexts: () => rows()
            .filter((li) => li.classList.contains('done'))
            .map((li) => li.querySelector('.task-text').textContent),
        counterText: () => document.getElementById('task-counter').textContent,
        stored: () => JSON.parse(window.localStorage.getItem('tasks')),
        storedRaw: () => window.localStorage.getItem('tasks'),
        addTask(text) {
            document.getElementById('task-input').value = text;
            document.getElementById('add-form').requestSubmit();
        },
        toggle(text) {
            rowByText(text).querySelector('.task-toggle').click();
        },
        remove(text) {
            rowByText(text).querySelector('.delete-btn').click();
        },
    };
}

/** Simulates a page reload: a new window started from the same localStorage. */
function reload(app) {
    return loadApp(app.storedRaw());
}

module.exports = { loadApp, reload };
