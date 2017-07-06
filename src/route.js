import { extend, isArray } from './utils';

const reserved = /^(controller|hash|keys|params|path|query|regex|splats|url)$/;

class Route {

    constructor(path, config) {

        if(isArray(config)) {
            config = { controller: config };
        }

        this.keys = [];
        this.regex = toRegExp(path, this.keys);
        this.controller = config.controller || config;

        Object.keys(config).forEach(key => {
            if(!reserved.test(key)) {
                this[key] = config[key];
            }
        });
    }

    match(path) {

        let captures = path.match(this.regex);
        if(!captures) return false;

        let params = {};
        let splats = [];

        captures.forEach((item, i) => {

            let key = this.keys[i];
            let value = decodeURIComponent(captures[i + 1]);

            if(key) {
                params[key] = convert(value);
            } else if(value !== 'undefined') {
                splats.push(value);
            }
        });

        const clone = extend({ path, params, splats }, this);
        delete clone.keys;
        delete clone.regex;

        return clone;
    }
}

function toRegExp(path, keys) {

    if(path[0] != '/') path = '/' + path;

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

export default Route;