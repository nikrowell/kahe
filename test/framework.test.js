import test from 'tape';
import kahe from '../src/index';

test('initialize kahe', function(t) {
    // TODO
    t.ok(kahe, 'kahe');
    t.end();
});

test('exposed api', function(t) {

    let api = ['h', 'go', 'on', 'off', 'emit', 'start'];
    let app = kahe();

    Object.keys(app).forEach(key => {
        api.includes(key) || t.fail(`${key} not in api`);
    });

    t.pass(`framework only exposes ${api.join(', ')}`);
    t.end();
});