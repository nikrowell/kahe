import { extend, isUndefined } from './utils';

export default function(target) {

    let events = {};

    return extend(target, {

        on(name, callback, context) {
            (events[name] || (events[name] = [])).push({ callback, context });
            return this;
        },

        off(name, callback) {

            if(isUndefined(name)) {
                events = {};
                return this;
            }

            let listeners = events[name];
            let active = [];

            if(listeners && callback) {
                for(let i = 0, length = listeners.length; i < length; i++) {
                    if(listeners[i].callback !== callback && listeners[i].callback.ref !== callback) {
                        active.push(listeners[i]);
                    }
                }
            }

            (active.length) ? events[name] = active : delete events[name];
            return this;
        },

        emit(name, ...data) {

            let listeners = events[name] || [];

            for(let i = 0, length = listeners.length; i < length; i++) {
                let context = listeners[i].context || this;
                listeners[i].callback.apply(context, data);
            }

            return this;
        }
    });
};