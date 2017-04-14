import * as utils from './utils';
import events from './events';
import Router from './router';
import Views from './views';

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

            this.views = new Views(settings);
            this.router = new Router(settings);
            this.router.on('route', this.trigger.bind(this, 'route'));
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

    let controller = isArray(route.controller) ? route.controller : [ route.controller ];
    let instances = [];

    for(let i = 0, length = controller.length; i < length; i++) {
        instances[i] = isFunction(controller[i]) ? new controller[i]() : Object.create(controller[i]);
    }

    this.views.show(route, instances);
}

export default function(init) {
    let instance = new Framework(init);
    return instance;
};