import test from 'tape';
import Mediator from '../src/mediator';

let inited = [];
let resized = [];
let animatedIn = [];
let animatedOut = [];
let destroyed = [];

const controller = {

    init: function(data, done) {
        inited.push(this.name);
        done();
    },

    resize: function(w, h) {
        resized.push(this.name);
    },

    animateIn: function(data, done) {
        animatedIn.push(this.name);
        done();
    },

    animateOut: function(data, done) {
        animatedOut.push(this.name);
        done();
    },

    destroy: function(data, done) {
        destroyed.push(this.name);
    }
};

let c1 = Object.create(controller);
let c2 = Object.create(controller);
let c3 = Object.create(controller);

c1.name = 'c1';
c1.animateIn = undefined;

c2.name = 'c2';
c2.init = 'not a function';
c2.animateOut = null;

c3.name = 'c3';

test('mediator lifecycle functions', function(t) {

    t.plan(5);

    let instances = new Mediator(c1, c2, c3);

    instances.init(null, function() {
        t.deepEqual(inited, ['c1', 'c3'], `${inited.length} instances called init()`);
    });

    instances.animateIn(null, function() {
        t.deepEqual(resized, ['c1', 'c2', 'c3'], `${resized.length} instances called resize()`);
        t.deepEqual(animatedIn, ['c2', 'c3'], `${animatedIn.length} instances called animateIn()`);
    });

    instances.animateOut(null, function() {
        t.deepEqual(animatedOut, ['c1', 'c3'], `${animatedOut.length} instances called animateOut()`);
        t.deepEqual(destroyed, ['c1', 'c2', 'c3'], `${destroyed.length} instances called destroy()`);
    });
});