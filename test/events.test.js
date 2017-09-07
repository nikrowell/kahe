import test from 'tape';
import events from '../src/events';

test('subscribe to an event', function(t) {

    let emitter = events({});

    emitter.on('test', () => {
        t.pass('subscribed to event');
        t.end();
    });

    emitter.emit('test');
});

test('subscribe to an event with context', function(t) {

    let emitter = events({});
    let context = {foo: true};

    emitter.on('test', function() {
        t.ok(this.foo, 'context set correctly');
        t.end();
    }, context);

    emitter.emit('test');
});

test('emit an event', function(t) {

    let emitter = events({});

    emitter.on('test', function() {
        t.pass('event listener called');
        t.end();
    });

    emitter.emit('test');
});

test('emit an event with arguments', function(t) {

    let emitter = events({});

    emitter.on('test', function(obj, str) {
        t.ok(obj.name === 'foo', 'passed first argument');
        t.ok(str === 'bar', 'passed second argument');
        t.end();
    });

    emitter.emit('test', {name: 'foo'}, 'bar');
});

test('unsubscribe from all events', function(t) {

    let emitter = events({});

    emitter.on('test', function() {
        t.fail('event handler called after unsubscribe');
    });

    emitter.off();
    emitter.emit('test');

    t.end();
});

test('unsubscribe from all events with name', function(t) {

    let emitter = events({});

    emitter.on('a', function() {
        t.fail('event handler called after unsubscribe');
    });

    emitter.on('b', function() {
        t.pass('other event handlers remain subscribed');
    });

    emitter.off('a');
    emitter.emit('a');
    emitter.emit('b');

    t.end();
});

test('unsubscribe from all events with name and callback', function(t) {

    let emitter = events({});

    function a() {
        t.fail('event handler called after unsubscribe');
    }

    function b() {
        t.pass('other event handlers remain subscribed');
    }

    emitter.on('test', a);
    emitter.on('test', b);
    emitter.off('test', a);
    emitter.emit('test');

    t.end();
});