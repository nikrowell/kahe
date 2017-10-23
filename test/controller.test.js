import test from 'tape';
import controller from '../src/controller';

const a = new class {

    init(req, done) {

    }

    resize(req, done) {

    }

    animateIn(req, done) {

    }

    animateOut(req, done) {

    }

    destory(req, done) {

    }
};

const b = Object.create({

    init(req, done) {

    },

    resize(req, done) {

    },

    animateIn(req, done) {

    },

    animateOut(req, done) {

    },

    destory(req, done) {

    }
});

a.name = 'a';
b.name = 'b';

test('controller overlap', function(t) {

    controller.init({overlap: true});

    t.ok('Test this...');
    t.end();
});