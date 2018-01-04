/*! kahe 0.6.4 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.kahe = {})));
}(this, (function (exports) { 'use strict';

    // TODO: remove unused functions!
    // or import { isString } from 'kahe/utils';
    // isArray, isFunction, isObject, isString, extend, noop

    function convert(value) {

        if(value === 'true') {
            value = true;
        } else if(value === 'false') {
            value = false;
        } else if(value === 'null') {
            value = null;
        } else if(value === 'undefined') {
            value = undefined;
        } else if(isNaN(value) === false) {
            value = Number(value);
        }

        return value;
    }

    function extend(target) {
        var sources = [], len = arguments.length - 1;
        while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];


        if(Object.assign) {
            return Object.assign.apply(Object, [ target ].concat( sources ));
        }

        sources.forEach(function (source) {
            if(!source) { return; }
            Object.keys(source).forEach(function (value, key) {
                if(source.hasOwnProperty(key)) {
                    target[key] = value;
                }
            });
        });

        return target;
    }



    function isArray(value) {
        return Array.isArray(value);
    }



    function isDefined(value) {
        return value !== undefined;
    }



    function isFunction(value) {
        return typeof value === 'function';
    }







    function isString(value) {
        return typeof value === 'string';
    }

    function isUndefined(value) {
        return value === undefined;
    }

    function noop() {

    }

    var Mediator = function Mediator() {
        var views = [], len = arguments.length;
        while ( len-- ) views[ len ] = arguments[ len ];

        this.views = views;
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

        if(!total) {
            done();
            return;
        }

        function oneDone() {
            if(++count === total) { done(); }
        }

        this.views.forEach(function(view) {
            if(isFunction(view[method])) {
                view[method].call(view, req, oneDone);
            }
        });
    };

    var reserved = /^(keys|path|params|regex|splats|view)$/;

    var Route = function Route(path, config) {
        var this$1 = this;


        if(isArray(config)) {
            config = { view: config };
        }

        this.keys = [];
        this.regex = toRegExp(path, this.keys);
        this.view = config.view || config;

        Object.keys(config).forEach(function (key) {
            if(!reserved.test(key)) {
                this$1[key] = config[key];
            }
        });
    };

    Route.prototype.match = function match (url) {
            var this$1 = this;


        var path = url.split(/[?#]/)[0];
        var captures = path.match(this.regex);
        if(!captures) { return false; }

        var params = [];

        captures.forEach(function (item, i) {

            var key = this$1.keys[i];
            var value = decodeURIComponent(captures[i + 1]);

            if(key) {
                params[key] = convert(value);
            } else if(value !== 'undefined') {
                params.push(convert(value));
            }
        });

        var clone = extend({ path: path, params: params }, this);
        delete clone.keys;
        delete clone.regex;

        return clone;
    };

    function toRegExp(path, keys) {

        if(path[0] !== '/') { path = '/' + path; }

        path = path
            .concat('/?')
            .replace(/\/\(/g, '(?:/')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?|\*/g, function(match, slash, format, key, capture, optional) {

                if(match === '*') {
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

    var Transition = function Transition(ref) {
        var type = ref.type;
        var from = ref.from;
        var to = ref.to;

        this.type = type;
        this.from = from;
        this.to = to;
        this.aborted = false;
    };

    Transition.prototype.run = function run (queue, fn, done) {

        var step = function(index) {
            if(index === queue.length) { return done(); }
            fn(queue[index], function () { return step(index + 1); }, done);
        };

        step(0);
    };

    Transition.prototype.start = function start (outgoing, incoming, done) {

        var flow = isDefined(flows[this.type]) ? flows[this.type] : flows['normal'];
        var queue = flow(outgoing, incoming);
        var request = this.to;

        var iterator = function(handler, next) {

            if(isArray(handler)) {

                var total = handler.length;
                var count = 0;

                handler.forEach(function (ref) {
                        var context = ref.context;
                        var fn = ref.fn;

                    context[fn].call(context, request, function () {
                        if(++count == total) { next(); }
                    });
                });

                return;
            }

            var context = handler.context;
                var fn = handler.fn;
            context[fn].call(context, request, next);
        };

        this.run(queue, iterator, done);
    };

    var flows = {

        normal: function (a, b) { return [
            {context: a, fn: 'animateOut'},
            {context: b, fn: 'init'},
            {context: b, fn: 'animateIn'}
        ]; },
        reverse: function (a, b) { return [
            {context: b, fn: 'init'},
            {context: b, fn: 'animateIn'},
            {context: a, fn: 'animateOut'}
        ]; },
        preload: function (a, b) { return [
            {context: b, fn: 'init'},
            {context: a, fn: 'animateOut'},
            {context: b, fn: 'animateIn'}
        ]; },
        parallel: function (a, b) { return [
            {context: b, fn: 'init'}, [
                {context: a, fn: 'animateOut'},
                {context: b, fn: 'animateIn'}
            ]
        ]; }
    };

    var settings = {};
    var routes = [];
    var beforeHooks = [];
    var afterHooks = [];

    var currentRoute;
    function onpopstate(event) {
        go(window.location.href, {replace: true});
    }

    function onclick(event) {

        if( event.defaultPrevented ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.button !== 0) { return; }

        var el = event.target;

        while(el && el.nodeName != 'A') { el = el.parentNode; }
        if(!el || !el.href) { return; }

        if( el.target ||
            el.href.indexOf(settings.base) === -1 ||
            el.getAttribute('rel') === 'external' ||
            el.hasAttribute('download')) { return; }

        event.preventDefault();
        go(el.href);
    }

    function before(hook) {
        beforeHooks.push(hook);
    }

    function after(hook) {
        afterHooks.push(hook);
    }

    function start(options) {
        if ( options === void 0 ) options = {};


        settings.base = window.location.protocol + '//' + window.location.host + (options.base || '/');

        Object.keys(options.routes).forEach(function (path) {
            var config = options.routes[path];
            var route = new Route(path, config);
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
    }

    function go(url, options) {
        if ( options === void 0 ) options = {};


        url = url.replace(settings.base, '');
        if(url.charAt(0) !== '/') { url = '/' + url; }

        var path = url.split(/[?#]/)[0];
        if(currentRoute && path === currentRoute.path) { return; }

        var route = routes.find(function (route) { return route.match(path); });

        if(isUndefined(route)) { return; }
        if(isString(route.view)) { return this.go(route.view); }

        window.history[options.replace ? 'replaceState' : 'pushState']({}, '', url);
        currentRoute = route;
    }

    var router$1 = { before: before, after: after, start: start, go: go };

    // export { on, off, emit, before, after, start, go };
    // export default { on, off, emit, before, after, start, go };

    exports['default'] = router$1;
    exports.before = before;
    exports.after = after;
    exports.start = start;
    exports.go = go;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=kahe.js.map
