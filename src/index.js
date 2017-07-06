import * as utils from './utils';
import events from './events';
import Controller from './controller';
import Router from './router';

const extend = utils.extend;
const isArray = utils.isArray;
const isFunction = utils.isFunction;

class Framework {

    constructor(setup) {
        this.setup = setup;
        this.utils = utils;
        extend(this, events);
    }

    start() {

        const bootstrap = (settings = {}) => {

            this.controller = new Controller(settings);
            this.router = new Router(settings);
            this.router.on('route', this.emit.bind(this, 'route'));
            this.router.on('route', change.bind(this));

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
        settings && bootstrap(settings);
    }

    resize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        this.controller.resize(width, height);
        this.emit('resize', { width, height });
    }

    go(url) {
        this.router.go(url);
    }
}

function change(route) {

    let views = isArray(route.controller) ? route.controller : [ route.controller ];
    let instances = [];

    for(let i = 0, length = views.length; i < length; i++) {
        let view = views[i];
        instances[i] = isFunction(view) ? new view() : Object.create(view);
    }

    this.controller.show(route, instances);
}

export default function(init) {
    let instance = new Framework(init);
    return instance;
};