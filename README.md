# kahe

kahe (k&#257;'-he) is a 2.5k pushState and hyperscript framework built on ideas from [bigwheel](https://github.com/bigwheel-framework/bigwheel), [page.js](https://visionmedia.github.io/page.js/) and [vue-router](http://router.vuejs.org/). 

Rather than focusing on reactive interfaces, kahe's emphasis is on creating animated transitions between application states. Routes are mapped to views which support several lifecyle events and are responsible for all rendering logic with the provided request data. The framework exposes a minimal API that includes `on`, `off` and `emit` for event handling, `go` for programatic navigation, `before` and `after` for adding middleware and `start` to initialize and begin resolving routes.

**Why kahe?** 
Because it's the Hawaiian word for _flow_. And because nearly everything else is taken.

## Installation

Install through [npm](https://www.npmjs.com/package/kahe) or use as a standalone library with a script tag and one of the bundled files.

`npm install kahe`

## Usage

```javascript
import { before, after, start } from 'kahe';
import { Home, About, Project, Intro } from './views';

start({
    intro: Intro,
    routes: {
        '/': Home,
        '/about': About
        '/projects/:slug': Project
    }
});
```

### Options

Property         | Default  | Description
---------------- | -------- | -----------------------------------------
**`base`**       | `/`      | Base URL to use when resolving routes.
**`routes`**     | `{}`     | Object mapping URL pattern to view function(s)
**`before`**     | `null`   | 
**`after`**      | `null`   | 
**`transition`** | `normal` | `string` or `function`
**`intro`**      | `null`   | Initial view to show regardless of the requested route. This view must be a function that accepts a `done` callback. Once `done` is called, routes will begin resolving as normal. Useful for preloaders or age verification pages that block entry to the site.

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

Transitions manage the flow between application states and are what make kahe unique. Inspired by the once popular [Gaia Framework](https://github.com/stevensacks/Gaia-Framework/wiki/The-gaia-flow) for Flash, transitions come in four types:

- normal
- reverse
- preload
- parallel

These built-in transitions control the order at which lifecycle events are called on incoming or outgoing views. 

### Events

## API

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

### go(url[, options]);

Navigate to a new URL. This is called internally by the framework when a link is clicked, but can be useful to programmatically change states. Optionally pass `{replace: true}` to update the current `window.history` record rather than pushing a new entry onto the stack.

### before(transition, next);

### after(transition);

### start(options)

Start the framework and begin resolving routes.

## Development

Unit tests use [budo](https://www.npmjs.com/package/budo), [tape](https://www.npmjs.com/package/tape) and [tap-dev-tool](https://www.npmjs.com/package/tap-dev-tool) (for more readable output).

```
npm install -g budo
npm install
npm run test
```
