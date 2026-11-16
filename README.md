# Task List

A simple task list that runs in the browser and saves tasks locally.

**Live:** [add URL after deploying to GitHub Pages]

---

## What it does

Add and delete tasks, and tick a task's checkbox to mark it as done. Done tasks are shown struck through and moved to the bottom of the list, and can be unticked again. A counter above the list shows how many tasks remain. Everything is saved to localStorage, so your tasks and their done state are still there when you reload the page.

---

## Getting started

### Requirements

- A browser (Chrome, Firefox, Safari or Edge)
- Node.js 24 LTS (to run linting and tests locally; CI uses Node 24)

### Installation

```bash
git clone https://github.com/[your-username]/task-list
cd task-list
npm install
```

### Configuration

No external services or environment variables required.

### Running the project

Open `index.html` directly in your browser. Or start a local server:

```bash
npx serve .
```

### Running the tests

```bash
npm test
```

The tests use Node's built-in test runner and [jsdom](https://github.com/jsdom/jsdom). They load the real `index.html` and `app.js` and cover marking tasks as done, the remaining-tasks counter and handling of previously saved tasks. They run automatically, together with `npm run lint`, via GitHub Actions (`.github/workflows/pages.yml`).

### CI and deployment

`.github/workflows/pages.yml` runs on pull requests to `main` and on pushes to `main`:

1. **check** – `npm ci`, `npm run lint` and `npm test`. Runs for both pull requests and pushes.
2. **build** – only on push to `main`, and only if **check** passed. Copies `index.html`, `app.js` and `style.css` (nothing else) into the Pages artifact.
3. **deploy** – publishes the artifact with GitHub's official Pages actions. Only this job has `pages: write` and `id-token: write`; everything else is read-only.

Required repository settings: Pages source set to **GitHub Actions**, the `github-pages` environment limited to the `main` branch, and a rule on `main` that requires the **check** status to pass.

Not covered by the automated tests, check these manually in a real browser: visual styling (checkbox position, strike-through, readable muted text), keyboard and screen reader use, narrow mobile widths and that data survives a real reload on the deployed site.

---

## Tech stack

| Component | Choice | Reason |
|-----------|--------|--------|
| Frontend | Vanilla JS | No build step, easy to understand and modify |
| Storage | localStorage | No backend needed |
| Hosting | GitHub Pages | Free, automatic deployment via CI/CD |

---

## Limitations

- Tasks do not sync between devices
- No login or shared lists
- Tasks are lost if browser data is cleared

---

## Built with

Claude Code (agent-driven development) as part of the course Next-Generation Software Development with AI.
