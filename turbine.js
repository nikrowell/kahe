/*! @nikrowell/turbine 0.1.0 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.turbine = factory());
}(this, (function () { 'use strict';

    function extend$1(target) {
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

    var guid = (function() {
        var counter = 0;
        return function (prefix) {
            if ( prefix === void 0 ) prefix = '';

            var id = ++counter + '';
            return prefix + id;
        };
    })();

    function isArray$1(value) {
        return Array.isArray(value);
    }

    function isBoolean(value) {
        return typeof value === 'boolean';
    }

    function isDefined(value) {
        return value !== undefined;
    }

    function isElement(value) {
        return !!(value && value.nodeType === 1);
    }

    function isFunction$1(value) {
        return typeof value === 'function';
    }

    function isNull(value) {
        return value === null;
    }

    function isNumber(value) {
        return typeof value === 'number';
    }

    function isObject$1(value) {
        return typeof value === 'object';
    }

    function isString(value) {
        return typeof value === 'string';
    }

    function isUndefined(value) {
        return value === undefined;
    }

    function noop$1() {

    }


    var utils = Object.freeze({
    	extend: extend$1,
    	guid: guid,
    	isArray: isArray$1,
    	isBoolean: isBoolean,
    	isDefined: isDefined,
    	isElement: isElement,
    	isFunction: isFunction$1,
    	isNull: isNull,
    	isNumber: isNumber,
    	isObject: isObject$1,
    	isString: isString,
    	isUndefined: isUndefined,
    	noop: noop$1
    });

    var events = {

        on: function(name, callback, context) {
            var e = this.e || (this.e = {});
            (e[name] || (e[name] = [])).push({ callback: callback, context: context });

            return this;
        },

        once: function(name, callback, context) {
            var arguments$1 = arguments;
            var this$1 = this;


            var listener = function () {
                this$1.off(name, listener);
                callback.apply(context, arguments$1);
            };

            listener.ref = callback;
            this.on(name, listener, context);

            return this;
        },

        trigger: function(name) {
            var this$1 = this;
            var data = [], len = arguments.length - 1;
            while ( len-- > 0 ) data[ len ] = arguments[ len + 1 ];


            var e = this.e || (this.e = {});
            var listeners = e[name] || [];

            for(var i = 0, length = listeners.length; i < length; i++) {
                var context = listeners[i].context || this$1;
                listeners[i].callback.apply(context, data);
            }

            return this;
        },

        // TODO: tests for removing events for the following situations:
        // emitter.off('evt', func) ... only removes func callback from evt
        // emitter.off('evt') ... removes all listeners for event evt
        // emitter.off() ... removes all listeners for all events
        off: function(name, callback) {

            var e = this.e || (this.e = {});
            var listeners = e[name];
            var events = [];

            if(listeners && callback) {
                for(var i = 0, length = listeners.length; i < length; i++) {
                    if(listeners[i].callback !== callback && listeners[i].callback.ref !== callback) { events.push(listeners[i]); }
                }
            }

            (events.length) ? e[name] = events : delete e[name];

            return this;
        }
    };

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
            isFunction$1(view.resize) && view.resize(w, h);
        });
    };

    Mediator.prototype.animateIn = function animateIn (req, done) {
            var this$1 = this;

        this.resize(window.innerWidth, window.innerHeight);
        setTimeout(function () { this$1.execute('animateIn', req, done); });
    };

    Mediator.prototype.animateOut = function animateOut (req, done) {
            var this$1 = this;

        this.execute('animateOut', req, function () {
            this$1.destroy(req, noop$1);
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
            isFunction$1(view[method]) && total++;
        });

        if(!total) {
            done();
            return;
        }

        function oneDone() {
            if(++count === total) { done(); }
        }

        this.views.forEach(function(view) {
            if(isFunction$1(view[method])) {
                view[method].call(view, req, oneDone);
            }
        });
    };

    var reserved = /^(controller|hash|keys|params|path|query|regex|splats|url)$/;

    var Route = function Route(path, config) {
        var this$1 = this;


        if(isArray$1(config)) {
            config = { controller: config };
        }

        this.keys = [];
        this.regex = toRegExp(path, this.keys);
        this.controller = config.controller || config;

        Object.keys(config).forEach(function (key) {
            if(!reserved.test(key)) {
                this$1[key] = config[key];
            }
        });
    };

    Route.prototype.match = function match (path) {
            var this$1 = this;


        var captures = path.match(this.regex);
        if(!captures) { return false; }

        var params = {};
        var splats = [];

        captures.forEach(function (item, i) {

            var key = this$1.keys[i];
            var value = decodeURIComponent(captures[i + 1]);

            if(key) {
                params[key] = convert(value);
            } else if(value !== 'undefined') {
                splats.push(value);
            }
        });

        var clone = extend$1({ path: path, params: params, splats: splats }, this);
        delete clone.keys;
        delete clone.regex;

        return Object.freeze(clone);
    };

    function toRegExp(path, keys) {

        if(path[0] != '/') { path = '/' + path; }

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

    function convert(value) {

        if(value == 'true') {
            value = true;
        } else if(value == 'false') {
            value = false;
        } else if(value == 'null') {
            value = null;
        } else if(value == 'undefined') {
            value = undefined;
        } else if(isNaN(value) == false) {
            value = Number(value);
        }

        return value;
    }

    var Router = function Router(settings) {
        var this$1 = this;


        this.base = window.location.protocol + '//' + window.location.host + (settings.base || '/');
        this.routes = [];
        this.resolved = null;

        var routes = settings.routes;

        if(!routes['*']) {
            routes['*'] = noop$1;
        }

        Object.keys(routes).forEach(function (path) {
            var config = routes[path];
            var route = new Route(path, config);
            this$1.routes.push(route);
        });

        extend$1(this, events);
    };

    Router.prototype.start = function start () {
        window.addEventListener('popstate', onpopstate.bind(this));
        document.addEventListener('click', onclick.bind(this));
        this.go(window.location.href, {replace: true});
    };

    Router.prototype.match = function match (path) {
            var this$1 = this;


        var route = null;
        for(var i = 0, len = this.routes.length; i < len; i++) {
            route = this$1.routes[i].match(path);
            if(route) { break; }
        }

        return route;
    };

    Router.prototype.go = function go (url, options) {
            if ( options === void 0 ) options = {};


        url = url.replace(this.base, '');
        if(url.charAt(0) !== '/') { url = '/' + url; }

        var path = url.split(/[?#]/)[0];
        if(path == this.resolved) { return; }

        var route = this.match(path);
        if(!route) { return; }

        this.resolved = path;

        // TODO: window.history check to allow for tape testing?
        window.history && window.history[options.replace ? 'replaceState' : 'pushState']({}, '', url);

        // TODO: move this or add options.trigger or options.silent?
        // We may not always want to trigger route events here once we
        // change to using transitions, which could be aborted or redirected
        this.trigger('route', route);
    };

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
            event.button !== 0) { return; }

        while(el && el.nodeName != 'A') { el = el.parentNode; }
        if(!el || !el.href) { return; }

        if( el.target ||
            el.href.indexOf(this.base) == -1 ||
            el.getAttribute('rel') == 'external' ||
            el.hasAttribute('download')) { return; }

        event.preventDefault();
        this.go(el.href);
    }

    var Views = function Views(settings) {
        this.overlap = isDefined(settings.overlap) ? settings.overlap : true;
        this.current = null;
        this.incoming = null;
    };

    Views.prototype.resize = function resize (width, height) {
        this.current && this.current.resize(width, height);
    };

    Views.prototype.show = function show (section, request) {
            var this$1 = this;


        this.request = request;

        if(this.current !== section && this.incoming !== section) {

            this.incoming && this.incoming.destroy(request, noop$1);
            this.incoming = section;
            section.init(request, function () { return this$1.swap(section); });
        }
    };

    Views.prototype.swap = function swap (incoming) {
            var this$1 = this;


        var overlap = this.overlap;
        var request = this.request;
        var outgoing = this.current;

        var transitionOut = function (next) {
            outgoing.animateOut(request, next || noop$1);
        };

        var transitionIn = function () {
            this$1.current = incoming;
            this$1.incoming = null;
            incoming.animateIn(request, noop$1);
        };

        if(!outgoing) {
            transitionIn();
            return;
        }

        if(overlap) {
            transitionOut();
            transitionIn();
        } else {
            // TODO: WTF, what isn't transitionIn getting called?
            var next = transitionIn;
            transitionOut(next);
        }
    };

    var extend$$1 = extend$1;
    var isArray$$1 = isArray$1;
    var isFunction$$1 = isFunction$1;
    var isObject$$1 = isObject$1;
    var noop$$1 = noop$1;

    var Framework = function Framework(setup) {
        this.setup = setup;
        this.utils = utils;
        extend$$1(this, events);
    };

    Framework.prototype.start = function start () {
            var this$1 = this;


        var bootstrap = function (settings) {

            this$1.views = new Views(settings);
            this$1.router = new Router(settings);
            this$1.router.on('route', change.bind(this$1));
            this$1.router.on('route', this$1.trigger.bind(this$1, 'route'));

            window.addEventListener('resize', this$1.resize.bind(this$1));

            if(settings.intro) {
                var start = this$1.router.start.bind(this$1.router);
                var intro = settings.intro.bind(null, start);
                change.call(this$1, {controller: intro});
            } else {
                this$1.router.start();
            }
        };

        var settings = isFunction$$1(this.setup) ? this.setup(bootstrap) : this.setup;
        if(isObject$$1(settings)) { bootstrap(settings); }

        delete this.setup;
        this.start = noop$$1;

        return this;
    };

    Framework.prototype.resize = function resize () {
        var width = window.innerWidth;
        var height = window.innerHeight;
        this.views.resize(width, height);
        this.trigger('resize', { width: width, height: height });
        return this;
    };

    Framework.prototype.go = function go (url) {
        this.router.go(url);
        return this;
    };

    function change(route) {

        var handler = isArray$$1(route.controller) ? route.controller : [route.controller];
        var instances = [];

        for(var i = 0, length = handler.length; i < length; i++) {
            instances[i] = isFunction$$1(handler[i]) ? new handler[i]() : Object.create(handler[i]);
        }

        var handlers = new (Function.prototype.bind.apply( Mediator, [ null ].concat( instances) ));
        this.views.show(handlers, route);
    }

    var index = function(init) {
        var instance = new Framework(init);
        return instance;
    };

    return index;

})));
//# sourceMappingURL=turbine.js.map
