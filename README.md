# kahe

kahe is a 2.5k HTML5 pushState and hyperscript framework built on ideas from [bigwheel](https://github.com/bigwheel-framework/bigwheel), [page.js](https://visionmedia.github.io/page.js/) and [vue-router](http://router.vuejs.org/). 

Rather than focusing on reactive interfaces, kahe's emphasis is on creating animated transitions between application states. Routes are mapped to a view function (or multiple view functions), which support several lifecyle methods and are responsible for all rendering logic with the provided request data. The framework exposes a minimal API that includes `on`, `off` and `emit` for event handling, a `route` method for transition hooks and an `h` method for generating markup via hyperscript ("hyper~~text~~" + "java~~script~~").

**Why kahe?** Because it's the Hawaiian word for _flow_. And because nearly everything else is taken.

**Why hyperscript?** Because it's standard JavaScript and doesn't require additional tooling. If you're looking for JSX in a small package, check out [Preact](https://preactjs.com/) or [Hyperapp](https://hyperapp.js.org/).

## Installation

Install through [npm](https://www.npmjs.com/package/turbine) or use as a standalone library with a script tag and one of the bundled files.

`npm install --save kahe`

## Usage

In order to prevent circular dependencies, where your **app** initialization defines routes, and routes may also depend on the **app* instance, it's best to define routes (or all configuration settings) in a sepatate file.

_app.js_

```javascript
import kahe from 'kahe';
import config from './config';

const app = kahe(config);
export default app;
```

_config.js_

```javascript
import { 
    Home, 
    About, 
    WorkNav, 
    WorkHeader, 
    WorkDetails,
    Preloader } from './views';

const routes = {
    '/': Home,
    'about': {
        name: 'about',
        view: About
    },
    '/work/:id': [
        WorkNav,
        WorkHeader,
        WorkDetails
    ],
    '/redirect': '/'
};

import { Home, About, Work } from './views';

const routes = {
    '/': Home,
    '/about': About
    '/work/:id': Work
};

export default {
    routes,
    base: '/',
    overlap: false,
    preloader: Preloader
};
```

### Options

Property        | Default | Description
--------------- | ------- | -----------
**`base`**      | `/`     |
**`routes`**    | `{}`    |
**`preloader`** | `null`  |
**`overlap`**   | `true`  |

### Routes

'/'
'about'
'/work/:slug'
'/account/:id/assets/*'

### Views

Views are functions or objects that optionally implement the following lifescyle methods: 

- init
- animateIn
- resize
- update
- animateOut
- destroy

Each method receives two arguments: `req` and `done`. `req` is an object representing request data, including captured url params for the incoming route and the view function(s) being executed. 

### Transitions

Transitions manage the flow between application states. Inspired by the once popular [Gaia Framework](https://github.com/stevensacks/Gaia-Framework/wiki/The-gaia-flow) for Flash, transitions come in four types:

- Normal
- Reverse
- Preload
- Parallel

```javascript

app.route(function(transition) {
    transition.next();
});

app.route(function({ from, to, type, next }) {
    next();
});

app.route('/about', function(transition) {
    from // readonly outgoing route data)
    to // readonly incoming route data)
    type // transition type, get or set
    transition.next() // call next step in transition sequence
    transition.next(false) // aborts current transition, state does not change
    transition.next('/login') // redirects
});
app.hook('/about', function() {

});
app.before('/about', function() {

});

```

### Events

## API

### h(selector[, attrs, children])

```javascript
app.h('div.class#id', {title: 'title', class: 'foo foo--bar'}, ['children']);
```

### go(url);

Navigate to a new URL. This is called internally by the framework when a link is clicked, but can be useful to programmatically change states.

### on(event, callback[, context])

Subscribe to an event.

* `event` - name of the event to subscribe to
* `callback` - function to call when event is emitted
* `context` - _optional_ context to bind the event callback to

### off(event[, callback])

Unsubscribe from an event or, if no event name is provided, from all events.

* `event` - name of the event to unsubscribe from
* `callback` - function used when binding to the event

### emit(event[, arguments...])

Trigger a named event.

* `event` - the event name to emit
* `arguments...` - event data passed to subscribers

### run()

Start the framework and begin resolving routes.

## Development

Unit tests use [budo](https://www.npmjs.com/package/budo), [tape](https://www.npmjs.com/package/tape) and [tap-dev-tool](https://www.npmjs.com/package/tap-dev-tool) (for more readable output).

```
npm install -g budo
npm install
npm run test
```

## Releases

* *0.6.0* - 