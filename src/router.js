import events from './events';
import Route from './route';
import { extend, noop } from './utils';

class Router {

    constructor(settings) {

        this.base = window.location.protocol + '//' + window.location.host + (settings.base || '/');
        this.routes = [];
        this.resolved = null;

        let routes = settings.routes || {};

        if(!routes['*']) {
            routes['*'] = (routes['/']) ? '/' : noop;
        }

        Object.keys(routes).forEach(path => {
            let config = routes[path];
            let route = new Route(path, config);
            this.routes.push(route);
        });
    }

    start() {
        window.addEventListener('popstate', onpopstate.bind(this));
        document.addEventListener('click', onclick.bind(this));
        this.go(window.location.href, {replace: true});
    }

    go(url, options = {}) {

        url = url.replace(this.base, '');
        if(url.charAt(0) !== '/') url = '/' + url;

        let path = url.split(/[?#]/)[0];
        if(path == this.resolved) return;

        const route = match.call(this, path);

        if(!route) return;
        if(typeof route.controller === 'string') return this.go(route.controller);

        window.history[options.replace ? 'replaceState' : 'pushState']({}, '', url);

        this.resolved = path;
        this.emit('route', route);
    }
}

function match(path) {

    let route = null;

    for(let i = 0, len = this.routes.length; i < len; i++) {
        route = this.routes[i].match(path);
        if(route) break;
    }

    return route;
}

function onpopstate(event) {
    var href = window.location.href;
    this.go(href, {replace: true});
}

function onclick(event) {

    event || (event = window.event);
    var el = event.target;

    if( event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.button !== 0) return;

    while(el && el.nodeName != 'A') el = el.parentNode;
    if(!el || !el.href) return;

    if( el.target ||
        el.href.indexOf(this.base) == -1 ||
        el.getAttribute('rel') == 'external' ||
        el.hasAttribute('download')) return;

    event.preventDefault();
    this.go(el.href);
}

extend(Router.prototype, events);
export default Router;