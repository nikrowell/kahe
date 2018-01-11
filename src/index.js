import Mediator from './mediator';
import Route from './route';
import { isArray, isFunction, isObject, isUndefined } from './utils';

const routes = [];
const beforeHooks = [];
const afterHooks = [];

let base;
let state;
let pending;
let incoming;
let outgoing;
let transition;

const kahe = {

    before(hook) {
        if (isFunction(hook)) hook = [hook];
        beforeHooks.push(...hook);
    },

    after(hook) {
        if (isFunction(hook)) hook = [hook];
        afterHooks.push(...hook);
    },

    route(path, config) {

        if (isUndefined(config)) {
            navigate(path);
            return;
        }

        routes.push( new Route(path, config) );
    },

    start(options = {}) {

        base = window.location.protocol + '//' + window.location.host + (options.base || '/');

        if (isArray(options.routes)) {

            options.routes.forEach(route => {
                route.path && kahe.route(route.path, route);
            });

        } else if (isObject(options.routes)) {

            Object.keys(options.routes).forEach(key => {
                kahe.route(key, options.routes[key]);
            });
        }

        options.before && kahe.before(options.before);
        options.after && kahe.after(options.after);

        window.addEventListener('click', onclick);
        window.addEventListener('touchstart', onclick);
        window.addEventListener('popstate', onpopstate);
        window.addEventListener('resize', onresize);

        // let href = window.location.href;
        // href = routes.some(route => route.match(href)) ? href : (options.fallback || '/');

        navigate(href, {replace: true});
    }
};

function onclick(event) {

    if (event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.button !== 0) return;

    let el = event.target;

    while (el && el.nodeName.toUpperCase() !== 'A') el = el.parentNode;
    if (!el || !el.href) return;

    if (el.target ||
        el.href.indexOf(base) === -1 ||
        el.getAttribute('rel') === 'external' ||
        el.hasAttribute('download')) return;

    event.preventDefault();
    navigate(el.href);
}

function onpopstate() {
    navigate(window.location.href, {replace: true});
}

function onresize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    incoming && incoming.resize(width, height);
    outgoing && outgoing.resize(width, height);
}

function navigate(url, options = {}) {

    url = url.replace(base, '');
    if (url.charAt(0) !== '/') url = '/' + url;

    let route;
    let request;

    for (let i = 0; i < routes.length; i++) {
        route = routes[i];
        request = route.match(url);
        if (request) break;
    }

    if (isUndefined(request)) return;
    if (state && state.path === request.path) return;

    window.history[options.replace ? 'replaceState' : 'pushState']({}, '', url);
    execute(route, request);
}

function execute(route, request) {

    if (transition) {
        pending = {route, request};
        return;
    }

    if (isUndefined(outgoing)) {
        outgoing = new Mediator();
        request.initial = true;
    }

    transition = { from: state, to: request };
    beforeHooks.forEach(fn => fn(transition));
    incoming = new Mediator(route.view);
    state = request;

    const init = () => {
        return new Promise(resolve => incoming.init(request, resolve));
    };

    const animateIn = () => {
        return new Promise(resolve => incoming.animateIn(request, resolve));
    };

    const animateOut = () => {
        return new Promise(resolve => outgoing.animateOut(request, resolve));
    };

    const done = () => {

        afterHooks.forEach(fn => fn(transition));
        outgoing = incoming;
        incoming = null;
        transition = null;

        if (pending) {
            execute(pending.route, pending.request);
            pending = null;
        }
    };

    switch (transition.type) {

        case 'out-in':
            init()
                .then(animateOut)
                .then(animateIn)
                .then(done);
            break;

        case 'in-out':
            init()
                .then(animateIn)
                .then(animateOut)
                .then(done);
            break;

        default:
            init()
                .then(() => Promise.all([ animateIn(), animateOut() ]))
                .then(done);
            break;
    }
}

export default kahe;