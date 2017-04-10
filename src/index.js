import * as utils from './utils';
import events from './events';
import Mediator from './mediator';
import Router from './router';
import Views from './views';

const extend = utils.extend;
const isArray = utils.isArray;
const isFunction = utils.isFunction;
const isObject = utils.isObject;
const noop = utils.noop;

class Framework {

    constructor(setup) {
        this.setup = setup;
        this.utils = utils;
        extend(this, events);
    }

    start() {

        const bootstrap = (settings) => {

            this.views = new Views(settings);
            this.router = new Router(settings);
            this.router.on('route', change.bind(this));
            this.router.on('route', this.trigger.bind(this, 'route'));

            window.addEventListener('resize', this.resize.bind(this));

            if(settings.intro) {
                let start = this.router.start.bind(this.router);
                let intro = settings.intro.bind(null, start);
                change.call(this, {controller: intro});
            } else {
                this.router.start();
            }
        };

        let settings = isFunction(this.setup) ? this.setup(bootstrap) : this.setup;
        if(isObject(settings)) bootstrap(settings);

        delete this.setup;
        this.start = noop;

        return this;
    }

    resize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        this.views.resize(width, height);
        this.trigger('resize', { width, height });
        return this;
    }

    go(url) {
        this.router.go(url);
        return this;
    }
}

function change(route) {

    let handler = isArray(route.controller) ? route.controller : [route.controller];
    let instances = [];

    for(let i = 0, length = handler.length; i < length; i++) {
        instances[i] = isFunction(handler[i]) ? new handler[i]() : Object.create(handler[i]);
    }

    let handlers = new Mediator(...instances);
    this.views.show(handlers, route);
}

export default function(init) {
    let instance = new Framework(init);
    return instance;
};