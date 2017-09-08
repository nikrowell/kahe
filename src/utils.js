
export function extend(target, ...sources) {

    if(Object.assign) {
        return Object.assign(target, ...sources);
    }

    sources.forEach(source => {
        if(!source) return;
        Object.keys(source).forEach((value, key) => {
            if(source.hasOwnProperty(key)) {
                target[key] = value;
            }
        });
    });

    return target;
};

export const guid = (function() {
    let counter = 0;
    return (prefix = '') => {
        let id = ++counter + '';
        return prefix + id;
    };
})();

export function isArray(value) {
    return Array.isArray(value);
};

export function isBoolean(value) {
    return typeof value === 'boolean';
};

export function isDefined(value) {
    return value !== undefined;
};

export function isElement(value) {
    return !!(value && value.nodeType === 1);
};

export function isFunction(value) {
    return typeof value === 'function';
};

export function isNull(value) {
    return value === null;
};

export function isNumber(value) {
    return typeof value === 'number';
};

export function isObject(value) {
    return typeof value === 'object' && !isArray(value);
};

export function isString(value) {
    return typeof value === 'string';
};

export function isUndefined(value) {
    return value === undefined;
};

export function noop() {

};
