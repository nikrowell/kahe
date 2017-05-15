import Mediator from './mediator';
import { isDefined, isFunction, noop } from './utils';

class Controller {

    constructor(settings) {
        this.overlap = isDefined(settings.overlap) ? settings.overlap : true;
        this.current = null;
        this.incoming = null;
        this.outgoing = null;
        this.queued = null;
    }

    resize(width, height) {
        this.current.resize(width, height);
    }

    show(request, views) {

        let incoming = new Mediator(...views);
        this.incoming = incoming;
        this.outgoing = this.current;

        incoming.init(request, () => this.swap(request));
    }

    swap(request) {

        let incoming = this.incoming;
        let outgoing = this.outgoing;

        this.current = incoming;

        const transitionComplete = () => {
            this.incoming = null;
        };

        const transitionIn = () => {
            incoming.animateIn(request, transitionComplete);
        };

        const transitionOut = (next) => {
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
            let next = transitionIn;
            transitionOut(next);
        }
    }
}

export default Controller;