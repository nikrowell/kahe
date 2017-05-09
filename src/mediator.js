import { isFunction, noop } from './utils';

class Mediator {

    constructor(...views) {
        this.views = views;
    }

    init(req, done) {
        this.execute('init', req, () => {
            this.ready(req, noop);
            done();
        });
    }

    ready(req, done) {
        this.execute('ready', req, noop);
    }

    resize(w, h) {
        this.views.forEach(function(view) {
            isFunction(view.resize) && view.resize(w, h);
        });
    }

    animateIn(req, done) {
        this.resize(window.innerWidth, window.innerHeight);
        this.execute('animateIn', req, done);
    }

    animateOut(req, done) {
        this.execute('animateOut', req, () => {
            this.destroy(req, noop);
            done();
        });
    }

    destroy(req, done) {
        this.execute('destroy', req, done);
    }

    execute(method, req, done) {

        let total = 0;
        let count = 0;

        this.views.forEach(function(view) {
            isFunction(view[method]) && total++;
        });

        if(!total) {
            done();
            return;
        }

        function oneDone() {
            if(++count === total) done();
        }

        this.views.forEach(function(view) {
            if(isFunction(view[method])) {
                view[method].call(view, req, oneDone);
            }
        });
    }
}

export default Mediator;