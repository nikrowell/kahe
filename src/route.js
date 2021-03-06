import { extend, isArray } from './utils';

const reserved = /^(hash|initial|keys|path|params|query|regex|view)$/;

class Route {

    constructor(path, config) {

        if (isArray(config)) {
            config = {view: config};
        }

        this.keys = [];
        this.view = config.view || config;
        this.regex = toRegExp(path, this.keys);

        Object.keys(config).forEach(key => {
            if (!reserved.test(key)) this[key] = config[key];
        });
    }

    match(url) {

        let path = url.split(/[?#]/)[0];
        let captures = path.match(this.regex);
        if (!captures) return;

        let params = [];

        captures.forEach((item, i) => {

            let key = this.keys[i];
            let value = decodeURIComponent(captures[i + 1]);

            if (key) {
                params[key] = convert(value);
            } else if (value !== 'undefined') {
                params.push(convert(value));
            }
        });

        const clone = extend({ url, path, params }, this);
        delete clone.regex;
        delete clone.keys;
        delete clone.view;

        return clone;
    }
}

function toRegExp(path, keys) {

    if (path[0] !== '/') path = '/' + path;

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

export default Route;