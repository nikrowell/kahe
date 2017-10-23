# kahe

_currently undergoing an api-breaking rewrite!_

kahe (k&#257;'-he) is a 2.5k pushState and hyperscript framework built on ideas from [bigwheel](https://github.com/bigwheel-framework/bigwheel), [page.js](https://visionmedia.github.io/page.js/) and [vue-router](http://router.vuejs.org/). 

Rather than focusing on reactive interfaces, kahe's emphasis is on creating animated transitions between application states. Routes are mapped to a view function (or multiple view functions), which support several lifecyle methods and are responsible for all rendering logic with the provided request data. The framework exposes a minimal API that includes `on`, `off` and `emit` for event handling, `go` for programatic navigation, (~~a `route` method for transition hooks~~ _coming soon_) and an `h` method for generating markup via hyperscript.

**Why kahe?** 
Because it's the Hawaiian word for _flow_. And because nearly everything else is taken.

**Why hyperscript?** 
Because it's standard JavaScript and doesn't require additional tooling. If you're looking for JSX in a small package, check out [Preact](https://preactjs.com/) or [Hyperapp](https://hyperapp.js.org/).

## Installation

Install through [npm](https://www.npmjs.com/package/kahe) or use as a standalone library with a script tag and one of the bundled files.

`npm install kahe`

## Usage

In order to prevent circular dependencies where your **app** initialization defines routes, and routes may also depend on the **app* instance, it's best to define routes configuration settings in a sepatate file:

_config.js_

```javascript
import { Home, About, Work, Preloader } from './views';

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

_app.js_

```javascript
import kahe from 'kahe';
import config from './config';

const app = kahe(config);
export default app;
```

_index.js_

```javascript
import app from './app';

// any other setup work or dom ready handlers

app.start();
```

### Options

Property        | Default | Description
--------------- | ------- | -----------------------------------------
**`base`**      | `/`     | Base URL to use when resolving routes.
**`routes`**    | `{}`    | Routes object with keys as URL patterns and values as view function(s) and additional route meta data.
**`preloader`** | `null`  | Initial view to show regardless of the requested route. This view must be a function that accepts a `done` callback. Once `done` is called, routes will begin resolving as normal.
**`overlap`**   | `true`  | Whether or not to sycnronize route transitions. If `false`, incoming routes will only start after all outgoing transitions have finished.

### Routes

### Views

Views are functions or objects that optionally implement the following lifescyle methods: 

- init
- animateIn
- resize
- animateOut
- destroy

Each method receives two arguments: `req` and `done`. `req` is an object representing request data, including captured url params for the incoming route and the view function(s) being executed. 

### Transitions

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
* `arguments` - event data passed to subscribers

### start()

Start the framework and begin resolving routes.

## Development

Unit tests use [budo](https://www.npmjs.com/package/budo), [tape](https://www.npmjs.com/package/tape) and [tap-dev-tool](https://www.npmjs.com/package/tap-dev-tool) (for more readable output).

```
npm install -g budo
npm install
npm run test
```
