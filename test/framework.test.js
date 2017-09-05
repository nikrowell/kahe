import test from 'tape';
import kahe from '../src/index';

test('initialize with an object', function(t) {
    // TODO
    t.ok(kahe, 'kahe');
    t.end();
});

test('initialize with a function', function(t) {
    // TODO
    t.ok(kahe, 'kahe');
    t.end();
});

test('only api exposed', function(t) {

    let api = [
        'h',
        'go',
        'on',
        'off',
        'emit',
        'run'
    ];

    let framework = kahe();

    Object.keys(framework).forEach(key => {
        api.includes(key) || t.fail(`${key} not in api`)
    });

    t.pass(`framework exposes ${api.join(', ')}`);
    t.end();
});