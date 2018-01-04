import Mediator from './mediator';
import Route from './route';
import Transition from './transition';
import { isObject, isString, isUndefined, extend, noop } from './utils';

const settings = {};
const routes = [];
const beforeHooks = [];
const afterHooks = [];

let currentRoute;
let currentTransition;
let pendingRoute;
let pendingTransition;
let incoming;
let outgoing;

function onpopstate(event) {
    go(window.location.href, {replace: true});
}

function onclick(event) {

    if( event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.button !== 0) return;

    let el = event.target;

    while(el && el.nodeName != 'A') el = el.parentNode;
    if(!el || !el.href) return;

    if( el.target ||
        el.href.indexOf(settings.base) === -1 ||
        el.getAttribute('rel') === 'external' ||
        el.hasAttribute('download')) return;

    event.preventDefault();
    go(el.href);
}

function beforeRoute(req, next) {

    console.log('beforeRoute');
    /*
    // if(currentTransition) {
    // is there an active transition in progress?
    // is it going to the same path, if so, return and ignore

    route = new Route(req);

    transition = new Transition({
        type: 'normal', // settings.transition,
        from: 'TODO currentRoute',
        to: route
    });

    const iterator = function(hook, step, exit) {

        hook(transition, (response) => {

            if(response === false) {
                transition.aborted = true;
                // go(response, {replace: true});
                exit();
            } else if(isString(response)) {
                transition.aborted = true;
                // go(response, {replace: true});
                exit();
            } else {
                isObject(response) && extend(route.data, response);
                step();
            }
        });
    };

    transition.run(beforeHooks, iterator, () => {
        if(transition.aborted === false) {
            // currentTransition = transition;
            next();
        }
    });
    */
}

function handleRoute(req, next) {

    let incoming = pendingRoute.view;
    let outgoing = currentRoute.view;

    transition.start(outgoing, incoming, () => {
        outgoing = incoming;
        incoming = null;
        next();
    });
}

function afterRoute(req) {

    const iterator = function(hook, step) {
        hook(transition, noop);
        step();
    };

    transition.run(afterHooks, iterator, noop);
}

export function before(hook) {
    beforeHooks.push(hook);
};

export function after(hook) {
    afterHooks.push(hook);
};

export function start(options = {}) {

    settings.base = window.location.protocol + '//' + window.location.host + (options.base || '/');

    Object.keys(options.routes).forEach(path => {
        let config = options.routes[path];
        let route = new Route(path, config);
        routes.push(route);
    });

    /*if(isString(options.click)) {
        let selector = options.click;
        settings.click = (el, event) => el.matches(selector);
    } elseif(isFunction(options.click)) {
        settings.click = options.click;
    } else {
        settings.click = onclick;
    }*/

    window.addEventListener('popstate', onpopstate);
    document.addEventListener('click', onclick);

    go(window.location.href, {replace: true});
};

export function go(url, options = {}) {

    url = url.replace(settings.base, '');
    if(url.charAt(0) !== '/') url = '/' + url;

    let path = url.split(/[?#]/)[0];
    if(currentRoute && path === currentRoute.path) return;

    let route = routes.find(route => route.match(path));

    if(isUndefined(route)) return;
    if(isString(route.view)) return this.go(route.view);

    window.history[options.replace ? 'replaceState' : 'pushState']({}, '', url);
    currentRoute = route;
};

export default { before, after, start, go };
