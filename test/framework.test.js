import test from 'tape';
import turbine from '../src/index';

test('initialize with an object', function(t) {
    // TODO
    t.ok(turbine, 'turbine');
    t.end();
});

test('initialize with a function', function(t) {
    // TODO
    t.ok(turbine, 'turbine');
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

    let framework = turbine();

    Object.keys(framework).forEach(key => {
        api.includes(key) || t.fail(`${key} not in api`)
    });

    t.pass(`framework exposes ${api.join(', ')}`);
    t.end();
});