import test from 'tape';
import Transition from '../src/transition';

test('transition from', function(t) {
    t.end();
});

test('transition to', function(t) {
    t.end();
});

test('transition next', function(t) {
    t.end();
});

test('transition next with false', function(t) {
    t.end();
});

test('transition next with string', function(t) {
    t.end();
});

test('transition next with data', function(t) {
    t.end();
});

test('transition type', function(t) {

    t.plan(1);

    let trans = new Transition({ from: 'from', to: 'to' });
    let before = [];

    before.push(function(transition, next) {
        transition.type = 'dummy';
        next();
    });

    let iterator = function(hook, step, exit) {
        hook(trans, () => step());
    };

    let callback = function() {
        t.equal(trans.type, 'dummy', 'type changed in before hook');
    };

    trans.run(before, iterator, callback);

    t.end();
});