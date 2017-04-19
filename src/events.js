export default {

    on: function(name, callback, context) {
        let e = this.e || (this.e = {});
        (e[name] || (e[name] = [])).push({ callback, context });

        return this;
    },

    once: function(name, callback, context) {

        let self = this;

        function listener() {
            callback.apply(context, arguments);
            self.off(name, listener);
        }

        listener.ref = callback;
        this.on(name, listener, context);

        return this;
    },

    trigger: function(name, ...data) {

        let e = this.e || (this.e = {});
        let listeners = e[name] || [];

        for(let i = 0, length = listeners.length; i < length; i++) {
            let context = listeners[i].context || this;
            listeners[i].callback.apply(context, data);
        }

        return this;
    },
    
    off: function(name, callback) {

        let e = this.e || (this.e = {});
        let listeners = e[name];
        let events = [];

        if(listeners && callback) {
            for(let i = 0, length = listeners.length; i < length; i++) {
                if(listeners[i].callback !== callback && listeners[i].callback.ref !== callback) {
                    live.push(listeners[i]);
                }
            }
        }

        (events.length) ? e[name] = events : delete e[name];

        return this;
    }
};