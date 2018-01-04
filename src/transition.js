import { isArray, isDefined } from './utils';

export default class Transition {

    constructor({ type, from, to }) {
        this.type = type;
        this.from = from;
        this.to = to;
        this.aborted = false;
    }

    run(queue, fn, done) {

        const step = function(index) {
            if(index === queue.length) return done();
            fn(queue[index], () => step(index + 1), done);
        };

        step(0);
    }

    start(outgoing, incoming, done) {

        let flow = isDefined(flows[this.type]) ? flows[this.type] : flows['normal'];
        let queue = flow(outgoing, incoming);
        let request = this.to;

        const iterator = function(handler, next) {

            if(isArray(handler)) {

                let total = handler.length;
                let count = 0;

                handler.forEach(({ context, fn }) => {
                    context[fn].call(context, request, () => {
                        if(++count == total) next();
                    });
                });

                return;
            }

            let { context, fn } = handler;
            context[fn].call(context, request, next);
        };

        this.run(queue, iterator, done);
    }
}

const flows = {

    normal: (a, b) => [
        {context: a, fn: 'animateOut'},
        {context: b, fn: 'init'},
        {context: b, fn: 'animateIn'}
    ],
    reverse: (a, b) => [
        {context: b, fn: 'init'},
        {context: b, fn: 'animateIn'},
        {context: a, fn: 'animateOut'}
    ],
    preload: (a, b) => [
        {context: b, fn: 'init'},
        {context: a, fn: 'animateOut'},
        {context: b, fn: 'animateIn'}
    ],
    parallel: (a, b) => [
        {context: b, fn: 'init'}, [
            {context: a, fn: 'animateOut'},
            {context: b, fn: 'animateIn'}
        ]
    ]
};