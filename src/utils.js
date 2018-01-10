
export function extend(target, ...sources) {

    if (Object.assign) {
        return Object.assign(target, ...sources);
    }

    sources.forEach(source => {
        Object.keys(source).forEach((value, key) => {
            if (source.hasOwnProperty(key)) {
                target[key] = value;
            }
        });
    });

    return target;
};

export function isArray(value) {
    return Array.isArray(value);
};

export function isFunction(value) {
    return typeof value === 'function';
};

export function isObject(value) {
    return typeof value === 'object' && !isArray(value);
};

export function isUndefined(value) {
    return typeof value === 'undefined';
};

export function noop() {};
