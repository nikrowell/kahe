import { isDefined, isFunction, noop } from './utils';

class Views {

    constructor(settings) {
        this.overlap = isDefined(settings.overlap) ? settings.overlap : true;
        this.current = null;
        this.incoming = null;
    }

    resize(width, height) {
        this.current && this.current.resize(width, height);
    }

    show(section, request) {

        this.request = request;

        if(this.current !== section && this.incoming !== section) {

            this.incoming && this.incoming.destroy(request, noop);
            this.incoming = section;
            section.init(request, () => this.swap(section));
        }
    }

    swap(incoming) {

        let overlap = this.overlap;
        let request = this.request;
        let outgoing = this.current;

        const transitionOut = (next) => {
            outgoing.animateOut(request, next || noop);
        };

        const transitionIn = () => {
            this.current = incoming;
            this.incoming = null;
            incoming.animateIn(request, noop);
        };

        if(!outgoing) {
            transitionIn();
            return;
        }

        if(overlap) {
            transitionOut();
            transitionIn();
        } else {
            // TODO: WTF, what isn't transitionIn getting called?
            let next = transitionIn;
            transitionOut(next);
        }
    }
}

export default Views;