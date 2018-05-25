/*! kahe 0.7.4 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.kahe = factory());
}(this, (function () { 'use strict';

    function extend(target) {
        var sources = [], len = arguments.length - 1;
        while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];


        if (Object.assign) {
            return Object.assign.apply(Object, [ target ].concat( sources ));
        }

        sources.forEach(function (source) {
            Object.keys(source).forEach(function (value, key) {
                if (source.hasOwnProperty(key)) {
                    target[key] = value;
                }
            });
        });

        return target;
    }

    function isArray(value) {
        return Array.isArray(value);
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function isObject(value) {
        return typeof value === 'object' && !isArray(value);
    }

    function isUndefined(value) {
        return typeof value === 'undefined';
    }

    function noop() {}

    var Mediator = function Mediator() {
        var views = [], len = arguments.length;
        while ( len-- ) views[ len ] = arguments[ len ];

        if (!isArray(views)) { views = [views]; }
        this.views = views.map(function (view) { return isFunction(view) ? new view() : view; });
    };

    Mediator.prototype.init = function init (req, done) {
        this.execute('init', req, done);
    };

    Mediator.prototype.resize = function resize (w, h) {
        this.views.forEach(function(view) {
            isFunction(view.resize) && view.resize(w, h);
        });
    };

    Mediator.prototype.animateIn = function animateIn (req, done) {
        this.resize(window.innerWidth, window.innerHeight);
        this.execute('animateIn', req, done);
    };

    Mediator.prototype.animateOut = function animateOut (req, done) {
            var this$1 = this;

        this.execute('animateOut', req, function () {
            this$1.destroy(req, noop);
            done();
        });
    };

    Mediator.prototype.destroy = function destroy (req, done) {
        this.execute('destroy', req, done);
    };

    Mediator.prototype.execute = function execute (method, req, done) {

        var total = 0;
        var count = 0;

        this.views.forEach(function(view) {
            isFunction(view[method]) && total++;
        });

        if (!total) {
            done();
            return;
        }

        function oneDone() {
            if (++count === total) { done(); }
        }

        this.views.forEach(function(view) {
            if (isFunction(view[method])) {
                view[method].call(view, req, oneDone);
            }
        });
    };

    var reserved = /^(hash|initial|keys|path|params|query|regex|view)$/;

    var Route = function Route(path, config) {
        var this$1 = this;


        if (isArray(config)) {
            config = {view: config};
        }

        this.keys = [];
        this.view = config.view || config;
        this.regex = toRegExp(path, this.keys);

        Object.keys(config).forEach(function (key) {
            if (!reserved.test(key)) { this$1[key] = config[key]; }
        });
    };

    Route.prototype.match = function match (url) {
            var this$1 = this;


        var path = url.split(/[?#]/)[0];
        var captures = path.match(this.regex);
        if (!captures) { return; }

        var params = [];

        captures.forEach(function (item, i) {

            var key = this$1.keys[i];
            var value = decodeURIComponent(captures[i + 1]);

            if (key) {
                params[key] = convert(value);
            } else if (value !== 'undefined') {
                params.push(convert(value));
            }
        });

        var clone = extend({ url: url, path: path, params: params }, this);
        delete clone.regex;
        delete clone.keys;
        delete clone.view;

        return clone;
    };

    function toRegExp(path, keys) {

        if (path[0] !== '/') { path = '/' + path; }

        path = path
            .concat('/?')
            .replace(/\/\(/g, '(?:/')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?|\*/g,

            function(match, slash, format, key, capture, optional) {

                if (match === '*') {
                    keys.push(undefined);
                    return match;
                }

                keys.push(key);
                slash = slash || '';

                return ''
                    + (optional ? '' : slash)
                    + '(?:'
                    + (optional ? slash : '')
                    + (format || '')
                    + (capture || '([^/]+?)')
                    + ')'
                    + (optional || '');
            })
            .replace(/([\/.])/g, '\\$1')
            .replace(/\*/g, '(.*)');

        return new RegExp('^' + path + '$', 'i');
    }

    function convert(value) {

        if (value === 'true') {
            value = true;
        } else if (value === 'false') {
            value = false;
        } else if (value === 'null') {
            value = null;
        } else if (value === 'undefined') {
            value = undefined;
        } else if (isNaN(value) === false) {
            value = Number(value);
        }

        return value;
    }

    var routes = [];
    var beforeHooks = [];
    var afterHooks = [];

    var base;
    var state;
    var pending;
    var incoming;
    var outgoing;
    var transition;

    var kahe = {

        before: function before(hook) {
            if (isFunction(hook)) { hook = [hook]; }
            beforeHooks.push.apply(beforeHooks, hook);
        },

        after: function after(hook) {
            if (isFunction(hook)) { hook = [hook]; }
            afterHooks.push.apply(afterHooks, hook);
        },

        route: function route(path, config) {

            if (isUndefined(config)) {
                navigate(path);
                return;
            }

            routes.push( new Route(path, config) );
        },

        start: function start(options) {
            if ( options === void 0 ) options = {};


            base = window.location.protocol + '//' + window.location.host + (options.base || '/');

            if (isArray(options.routes)) {

                options.routes.forEach(function (route) {
                    route.path && kahe.route(route.path, route);
                });

            } else if (isObject(options.routes)) {

                Object.keys(options.routes).forEach(function (key) {
                    kahe.route(key, options.routes[key]);
                });
            }

            options.before && kahe.before(options.before);
            options.after && kahe.after(options.after);

            window.addEventListener('click', onclick);
            window.addEventListener('touchstart', onclick);
            window.addEventListener('popstate', onpopstate);
            window.addEventListener('resize', onresize);

            var href = '/' + window.location.href.replace(base, '');
            href = routes.some(function (route) { return route.match(href); }) ? href : (options.fallback || '/');

            navigate(href, {replace: true});
        }
    };

    function onclick(event) {

        if (event.defaultPrevented ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.button !== 0) { return; }

        var el = event.target;

        while (el && el.nodeName.toUpperCase() !== 'A') { el = el.parentNode; }
        if (!el || !el.href) { return; }

        if (el.target ||
            el.href.indexOf(base) === -1 ||
            el.getAttribute('rel') === 'external' ||
            el.hasAttribute('download')) { return; }

        event.preventDefault();
        navigate(el.href);
    }

    function onpopstate() {
        navigate(window.location.href, {replace: true});
    }

    function onresize() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        incoming && incoming.resize(width, height);
        outgoing && outgoing.resize(width, height);
    }

    function navigate(url, options) {
        if ( options === void 0 ) options = {};


        url = url.replace(base, '');
        if (url.charAt(0) !== '/') { url = '/' + url; }

        var route;
        var request;

        for (var i = 0; i < routes.length; i++) {
            route = routes[i];
            request = route.match(url);
            if (request) { break; }
        }

        if (isUndefined(request)) { return; }
        if (state && state.path === request.path) { return; }

        window.history[options.replace ? 'replaceState' : 'pushState']({}, '', url);
        execute(route, request);
    }

    function execute(route, request) {

        if (transition) {
            pending = {route: route, request: request};
            return;
        }

        if (isUndefined(outgoing)) {
            outgoing = new Mediator();
            request.initial = true;
        }

        transition = { from: state, to: request };
        beforeHooks.forEach(function (fn) { return fn(transition); });
        incoming = new Mediator(route.view);
        state = request;

        var init = function () {
            return new Promise(function (resolve) { return incoming.init(request, resolve); });
        };

        var animateIn = function () {
            return new Promise(function (resolve) { return incoming.animateIn(request, resolve); });
        };

        var animateOut = function () {
            return new Promise(function (resolve) { return outgoing.animateOut(request, resolve); });
        };

        var done = function () {

            afterHooks.forEach(function (fn) { return fn(transition); });
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

                return animateOut()
                    .then(init)
                    .then(animateIn)
                    .then(done);

            case 'in-out':

                return init()
                    .then(animateIn)
                    .then(animateOut)
                    .then(done);

            default:

                return init()
                    .then(function () { return Promise.all([ animateIn(), animateOut() ]); })
                    .then(done);
        }
    }

    return kahe;

})));
