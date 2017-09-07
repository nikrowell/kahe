/*! kahe 0.6.1 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.kahe = factory());
}(this, (function () { 'use strict';

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

	var controller = {

	    init: function init(settings) {
	        this.overlap = isDefined(settings.overlap) ? settings.overlap : true;
	        this.current = null;
	        this.incoming = null;
	        this.outgoing = null;
	    },

	    resize: function resize(width, height) {
	        this.current.resize(width, height);
	    },

	    show: function show(request, views) {
	        var this$1 = this;


	        var incoming = new (Function.prototype.bind.apply( Mediator, [ null ].concat( views) ));
	        this.incoming = incoming;
	        this.outgoing = this.current;

	        incoming.init(request, function () { return this$1.swap(request); });
	    },

	    swap: function swap(request) {
	        var this$1 = this;


	        var incoming = this.incoming;
	        var outgoing = this.outgoing;

	        this.current = incoming;

	        var transitionComplete = function () {
	            this$1.incoming = null;
	        };

	        var transitionIn = function () {
	            incoming.animateIn(request, transitionComplete);
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
	    }
	};

	var instance = Object.create(controller);

	var events = function(target) {

	    var events = {};

	    return extend(target, {

	        on: function on(name, callback, context) {
	            (events[name] || (events[name] = [])).push({ callback: callback, context: context });
	            return this;
	        },

	        off: function off(name, callback) {

	            if(isUndefined(name)) {
	                events = {};
	                return this;
	            }

	            var listeners = events[name];
	            var active = [];

	            if(listeners && callback) {
	                for(var i = 0, length = listeners.length; i < length; i++) {
	                    if(listeners[i].callback !== callback && listeners[i].callback.ref !== callback) {
	                        active.push(listeners[i]);
	                    }
	                }
	            }

	            (active.length) ? events[name] = active : delete events[name];
	            return this;
	        },

	        emit: function emit(name) {
	            var this$1 = this;
	            var data = [], len = arguments.length - 1;
	            while ( len-- > 0 ) data[ len ] = arguments[ len + 1 ];


	            var listeners = events[name] || [];

	            for(var i = 0, length = listeners.length; i < length; i++) {
	                var context = listeners[i].context || this$1;
	                listeners[i].callback.apply(context, data);
	            }

	            return this;
	        }
	    });
	};

	var reserved = /^(view|hash|keys|params|path|query|regex|splats|url)$/;

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

	    var clone = extend({ path: path, params: params, splats: splats }, this);
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
	    } else if(isNaN(value) === false) {
	        value = Number(value);
	    }

	    return value;
	}

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

	var router = {

	    init: function init(settings) {
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
	    },

	    start: function start() {
	        window.addEventListener('popstate', onpopstate.bind(this));
	        document.addEventListener('click', onclick.bind(this));
	        this.go(window.location.href, {replace: true});
	    },

	    go: function go(url, options) {
	        if ( options === void 0 ) options = {};


	        url = url.replace(this.base, '');
	        if(url.charAt(0) !== '/') { url = '/' + url; }

	        var path = url.split(/[?#]/)[0];
	        if(path == this.resolved) { return; }

	        var route = match.call(this, path);

	        if(!route) { return; }
	        if(typeof route.view === 'string') { return this.go(route.view); }

	        window.history[options.replace ? 'replaceState' : 'pushState']({}, '', url);

	        this.resolved = path;
	        this.emit('route', route);
	    }
	};

	var instance$1 = Object.create(router);
	var router$1 = events(instance$1);

	var parseTag = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g;
	var parseAttr = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/;

	var h = function(tag, options) {

		var attrs = isObject(options) ? options : {},
			children = (arguments.length == 3) ? arguments[2] : options,
			node = {tag: 'div', attrs: {}},
			classes = [],
			element,
			match,
			key;

		while(match = parseTag.exec(tag)) {

			if(match[1] === '' && match[2]) {
				node.tag = match[2];
			} else if(match[1] === '#') {
				node.attrs.id = match[2];
			} else if(match[1] === '.') {
				classes.push(match[2]);
			} else if(match[3][0] === '[') {
				var pair = parseAttr.exec(match[3]);
				if(pair[1] === 'class') {
					classes.push(pair[3]);
				} else {
					node.attrs[pair[1]] = pair[3] || (pair[2] ? '' : true);
				}
			}
		}

		for(key in attrs) {
			if(attrs.hasOwnProperty(key)) {
				if(key == 'class') {
					classes.push(attrs[key]);
				} else {
					node.attrs[key] = attrs[key];
				}
			}
		}

		element = document.createElement(node.tag);
		attrs = node.attrs;

		for(key in attrs) {
			if(attrs.hasOwnProperty(key)) {
				if(key == 'class') {
					classes.push(attrs[key]);
				} else if(key == 'style') {
					element.style.cssText = attrs[key];
				} else if(key == 'styles') {
					// TODO
				} else {
					element[key] = attrs[key];
				}
			}
		}

		if(classes.length) {
			element.className = classes.join(' ');
		}

		if(isString(children)) {
			element.textContent = children;
		} else if(isArray(children)) {
			for(var i = 0, n = children.length; i < n; i++) {
				element.appendChild(children[i]);
			}
		}

		return element;
	};

	function start() {

	    instance.init(settings);
	    router$1.init(settings);
	    router$1.on('route', update);

	    window.addEventListener('resize', function (event) {
	        var width = window.innerWidth;
	        var height = window.innerHeight;
	        instance.resize(width, height);
	    });

	    if(isFunction(settings.preloader)) {

	        var start = router$1.start.bind(router$1);
	        var intro = settings.preloader.bind(null, start);
	        update({view: intro});

	    } else {
	        router$1.start();
	    }

	    this.start = noop;
	}

	function update(route) {

	    var views = isArray(route.view) ? route.view : [route.view];
	    var instances = views.map(function (view) { return isFunction(view) ? new view() : Object.create(view); });

	    instance.show(route, instances);
	}

	var index = function(settings) {

	    var go = router$1.go.bind(router$1);

	    var framework = { h: h, go: go, start: start };
	    return events(framework);
	};

	return index;

})));
//# sourceMappingURL=kahe.js.map
