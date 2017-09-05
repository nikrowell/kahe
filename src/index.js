import controller from './controller';
import router from './router';
import events from './events';
import h from './hyperscript';
import { extend, isArray, isFunction, noop } from './utils';

const bootstrap = (settings = {}) => {

    controller.init(settings);
    router.init(settings);
    router.on('route', update);

    window.addEventListener('resize', (event) => {
        let width = window.innerWidth;
        let height = window.innerHeight;
        controller.resize(width, height);
    });

    if(isFunction(settings.preloader)) {

        let start = router.start.bind(router);
        let intro = settings.preloader.bind(null, start);
        update({view: intro});

    } else {
        router.start();
    }
};

const update = (route) => {

    let views = isArray(route.view) ? route.view : [route.view];
    let instances = [];

    for(let i = 0, length = views.length; i < length; i++) {
        let view = views[i];
        instances[i] = isFunction(view) ? new view() : Object.create(view);
    }

    controller.show(route, instances);
};

export default function(init) {

    function go(url) {
        router.go(url);
    }

    function run() {
        let settings = isFunction(init) ? init(bootstrap) : init;
        settings && bootstrap(settings);
        this.run = noop;
    }

    const framework = { h, go, run };
    return events(framework);
};