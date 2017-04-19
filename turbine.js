/*! @nikrowell/turbine 0.2.4 */
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

    function isObject(value) {
        return typeof value === 'object';
    }

    function isString(value) {
        return typeof value === 'string';
    }

    function isUndefined(value) {
        return value === undefined;
    }

    function noop() {

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
    	isObject: isObject,
    	isString: isString,
    	isUndefined: isUndefined,
    	noop: noop
    });

    var events = {

        on: function(name, callback, context) {
            var e = this.e || (this.e = {});
            (e[name] || (e[name] = [])).push({ callback: callback, context: context });

            return this;
        },

        once: function(name, callback, context) {

            var self = this;

            function listener() {
                callback.apply(context, arguments);
                self.off(name, listener);
            }

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
        
        off: function(name, callback) {

            var e = this.e || (this.e = {});
            var listeners = e[name];
            var events = [];

            if(listeners && callback) {
                for(var i = 0, length = listeners.length; i < length; i++) {
                    if(listeners[i].callback !== callback && listeners[i].callback.ref !== callback) {
                        events.push(listeners[i]);
                    }
                }
            }

            (events.length) ? e[name] = events : delete e[name];

            return this;
        }
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

        return clone;
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

        var routes = settings.routes || {};

        if(!routes['*']) {
            routes['*'] = (routes['/']) ? '/' : noop;
        }

        Object.keys(routes).forEach(function (path) {
            var config = routes[path];
            var route = new Route(path, config);
            this$1.routes.push(route);
        });
    };

    Router.prototype.start = function start () {
        window.addEventListener('popstate', onpopstate.bind(this));
        document.addEventListener('click', onclick.bind(this));
        this.go(window.location.href, {replace: true});
    };

    Router.prototype.go = function go (url, options) {
            if ( options === void 0 ) options = {};


        url = url.replace(this.base, '');
        if(url.charAt(0) !== '/') { url = '/' + url; }

        var path = url.split(/[?#]/)[0];
        if(path == this.resolved) { return; }

        var route = match.call(this, path);

        if(!route) { return; }
        if(typeof route.controller === 'string') { return this.go(route.controller); }

        window.history[options.replace ? 'replaceState' : 'pushState']({}, '', url);
            
        this.resolved = path;
        this.trigger('route', route);
    };

    function match(path) {
        var this$1 = this;


        var route = null;

        for(var i = 0, len = this.routes.length; i < len; i++) {
            route = this$1.routes[i].match(path);
            if(route) { break; }
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

    extend$1(Router.prototype, events);

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

    var Views = function Views(settings) {
        this.overlap = isDefined(settings.overlap) ? settings.overlap : true;
        this.current = null;
        this.incoming = null;
        this.outgoing = null;
    };

    Views.prototype.resize = function resize (width, height) {
        this.current.resize(width, height);
    };

    Views.prototype.show = function show (request, views) {
            var this$1 = this;


        var incoming = new (Function.prototype.bind.apply( Mediator, [ null ].concat( views) ));
        this.incoming = incoming;
        this.outgoing = this.current;

        incoming.init(request, function () { return this$1.swap(request); });
    };

    Views.prototype.swap = function swap (request) {

        var incoming = this.incoming;
        var outgoing = this.outgoing;

        this.current = incoming;

        var transitionIn = function () {
            incoming.animateIn(request, noop);
        };

        var transitionOut = function (next) {
            outgoing.animateOut(request, next || noop);
        };

        if(!outgoing) {
            transitionIn();
            return;
        }

        if(this.overlap) {
            transitionOut();
            transitionIn();
        } else {
            var next = transitionIn;
            transitionOut(next);
        }
    };

    var extend$$1 = extend$1;
    var isArray$$1 = isArray$1;
    var isFunction$$1 = isFunction$1;

    var Framework = function Framework(setup) {
        this.setup = setup;
        this.utils = utils;
        extend$$1(this, events);
    };

    Framework.prototype.start = function start () {
            var this$1 = this;


        var bootstrap = function (settings) {
                if ( settings === void 0 ) settings = {};


            this$1.views = new Views(settings);
            this$1.router = new Router(settings);
            this$1.router.on('route', this$1.trigger.bind(this$1, 'route'));
            this$1.router.on('route', change.bind(this$1));

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
        settings && bootstrap(settings);

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

        var controller = isArray$$1(route.controller) ? route.controller : [ route.controller ];
        var instances = [];

        for(var i = 0, length = controller.length; i < length; i++) {
            instances[i] = isFunction$$1(controller[i]) ? new controller[i]() : Object.create(controller[i]);
        }

        this.views.show(route, instances);
    }

    var index = function(init) {
        var instance = new Framework(init);
        return instance;
    };

    return index;

})));
//# sourceMappingURL=turbine.js.map
