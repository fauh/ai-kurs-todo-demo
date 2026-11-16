const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, reload } = require('./helpers');

const threeOpen = [
    { text: 'A', createdAt: 1, done: false },
    { text: 'B', createdAt: 2, done: false },
    { text: 'C', createdAt: 3, done: false },
];

describe('klarmarkering', () => {
    test('kryssruta markerar uppgiften som klar och sparar done: true', () => {
        const app = loadApp(threeOpen);
        app.toggle('B');

        const row = app.rowByText('B');
        assert.ok(row.classList.contains('done'));
        assert.equal(row.querySelector('.task-toggle').checked, true);
        assert.equal(app.stored().find((t) => t.text === 'B').done, true);
    });

    test('klar uppgift hamnar sist, övriga behåller sin ordning', () => {
        const app = loadApp(threeOpen);
        app.toggle('A');

        assert.deepEqual(app.visibleTexts(), ['B', 'C', 'A']);
    });

    test('uppgift kan markeras som ej klar och återgår till sin plats', () => {
        const app = loadApp(threeOpen);
        app.toggle('A');
        app.toggle('A');

        assert.deepEqual(app.visibleTexts(), ['A', 'B', 'C']);
        assert.deepEqual(app.doneTexts(), []);
        assert.equal(app.stored()[0].done, false);
    });

    test('klarmarkering finns kvar efter omladdning', () => {
        const app = loadApp(threeOpen);
        app.toggle('B');

        const reloaded = reload(app);
        assert.deepEqual(reloaded.doneTexts(), ['B']);
        assert.equal(reloaded.rowByText('B').querySelector('.task-toggle').checked, true);
    });

    test('borttagning i sorterad lista tar bort rätt uppgift', () => {
        const app = loadApp(threeOpen);
        app.toggle('A'); // A visas sist men ligger på index 0
        app.remove('A');

        assert.deepEqual(app.visibleTexts(), ['B', 'C']);
        assert.deepEqual(app.stored().map((t) => t.text), ['B', 'C']);
    });

    test('nya uppgifter får done: false och visas före klara', () => {
        const app = loadApp(threeOpen);
        app.toggle('A');
        app.addTask('D');

        assert.deepEqual(app.visibleTexts(), ['B', 'C', 'D', 'A']);
        assert.equal(app.stored().find((t) => t.text === 'D').done, false);
    });
});

describe('räknare', () => {
    test('visar antal återstående med rätt singular/plural', () => {
        const app = loadApp(threeOpen);
        assert.equal(app.counterText(), '3 tasks remaining');

        app.toggle('A');
        app.toggle('B');
        assert.equal(app.counterText(), '1 task remaining');
    });

    test('uppdateras direkt vid lägg till, klar, ej klar och ta bort', () => {
        const app = loadApp(null);
        assert.equal(app.counterText(), '0 tasks remaining');

        app.addTask('A');
        assert.equal(app.counterText(), '1 task remaining');

        app.addTask('B');
        assert.equal(app.counterText(), '2 tasks remaining');

        app.toggle('A');
        assert.equal(app.counterText(), '1 task remaining');

        app.toggle('A');
        assert.equal(app.counterText(), '2 tasks remaining');

        app.remove('B');
        assert.equal(app.counterText(), '1 task remaining');

        app.toggle('A');
        assert.equal(app.counterText(), '0 tasks remaining');
    });
});

describe('redan sparade uppgifter', () => {
    test('uppgifter utan done visas som ej klara och räknas med', () => {
        const app = loadApp([
            { text: 'Gammal 1', createdAt: 1 },
            { text: 'Gammal 2', createdAt: 2 },
        ]);

        assert.deepEqual(app.visibleTexts(), ['Gammal 1', 'Gammal 2']);
        assert.deepEqual(app.doneTexts(), []);
        assert.equal(app.counterText(), '2 tasks remaining');
        app.rows().forEach((li) => {
            assert.equal(li.querySelector('.task-toggle').checked, false);
        });
    });

    test('trasig eller felaktig data ger tom lista utan fel', () => {
        for (const raw of ['{inte json', '{"text":"objekt, inte array"}', 'null']) {
            const app = loadApp(raw);
            assert.deepEqual(app.visibleTexts(), [], `för värdet ${raw}`);
            assert.equal(app.counterText(), '0 tasks remaining');
        }
    });

    test('text med HTML visas som text och tolkas inte', () => {
        const app = loadApp([{ text: '<b>x</b><img src=x>', createdAt: 1 }]);

        assert.deepEqual(app.visibleTexts(), ['<b>x</b><img src=x>']);
        assert.equal(app.document.querySelector('#task-list b, #task-list img'), null);
    });
});
