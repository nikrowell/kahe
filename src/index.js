import controller from './controller';
import router from './router';
import events from './events';
import h from './hyperscript';
import { isArray, isFunction, noop } from './utils';

export default function(settings) {

    controller.init(settings);
    router.init(settings);
    router.on('route', update);

    function update(route) {

        let views = isArray(route.view) ? route.view : [route.view];
        let instances = views.map(view => isFunction(view) ? new view() : Object.create(view));

        controller.show(route, instances);
    }

    function start() {

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

        this.start = noop;
    }

    let go = router.go.bind(router);

    const framework = { h, go, start };
    return events(framework);
};