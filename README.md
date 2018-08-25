# kahe

kahe (k&#257;'-he) is a 2k client-side router built on ideas from [page.js](https://visionmedia.github.io/page.js/), [bigwheel](https://github.com/bigwheel-framework/bigwheel) and [ReactTransitionGroupPlus](https://www.npmjs.com/package/react-transition-group-plus).

kahe's emphasis is on enabling animated transitions between pages or application states. Routes are mapped to views which support several lifecyle methods and are responsible for all rendering logic with the provided request data. Before and after hooks receive information about where the request is going, and were it's coming from.

**Why kahe?**
Because it's the Hawaiian word for _flow_. And because nearly everything else is taken.

## Installation

Install through [npm](https://www.npmjs.com/package/kahe) or use as a standalone library with a script tag and one of the bundled files. Please message me if you're interested in a CDN version!

`npm install kahe`

## Usage

```javascript
import kahe from 'kahe';
import { Home, About, Project } from './views';

kahe.start({
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
**`routes`**     | `[]`     | an object mapping URL patterns to view function(s), or an array of routes config objects with `path` and `view` properties. These can also be defined using the `route(path, config)` method.
**`before`**     | `null`   | A function or array of functions to be called before a transition begins. Each callback recieves a transition object with `to` and `from` properties representing the incoming and outgoing requests.
**`after`**      | `null`   | A function or array of functions to be called after a transition completes. Each callback recieves a transition object with `to` and `from` properties representing the incoming and outgoing requests.
**`transition`** | `null`   | A string to specify the default transition flow (see [transitions](#transitions)) or a function to be called before a transition begins.

### Routes

Routes can be defined in several ways.

**Using individual `route()` calls:**
```javascript
import { route, start } from 'kahe';

route('/', Home);
route('/about', About);
route('/projects/:slug', Project);

// start resolving routes
start();
```

**Using a routes array:**
```javascript
kahe.start({
  routes: [
    {path: '/', view: Home},
    {path: '/about', view: About},
    {path: '/projects/:slug', view: Project}
  ]
});
```

**Using a routes object:**
```javascript
kahe.start({
  routes: {
    '/': Home,
    '/about': About
    '/projects/:slug': Project
  }
});
```

### Views

Views are functions or objects that optionally implement the following lifescyle methods:

- init
- resize
- animateIn
- animateOut
- destroy

The `init`, `animateIn` and `animateOut` methods receives two arguments: `req` and `done`. `req` is an object representing request data, including captured url params. The `resize` method is called immediately before `animateIn` and recieves the current window width and height as arguments. Use the `destory` method to run cleanup work such as removing DOM nodes or event listeners.

### Transitions

Transitions manage the flow between application states and are what make kahe unique. Inspired by [ReactTransitionGroupPlus](https://www.npmjs.com/package/react-transition-group-plus) and the once popular [Gaia Framework](https://github.com/stevensacks/Gaia-Framework/wiki/The-gaia-flow) for Flash, transitions come in three types which control the order at which lifecycle methods are called on incoming and outgoing views.

#### normal

Transitions are synchronous.

* incoming.init(req, done)
* incoming.animateIn(req, done) _and_ outgoing.animateOut(req, done)

#### out-in

* incoming.init(req, done)
* outgoing.animateOut(req, done)
* incoming.animateIn(req)

#### in-out

* incoming.init(req, done)
* incoming.animateIn(req, done)
* outgoing.animateOut(req, done)

With all transition types, if another URL is requested while a transitio is in progress, it will be queued and executed imediately after the current transition completes.

## API

### route(path[, config]);

Adds a route definition if both path and config are specificed. Route config optinos can be a single object representing a view function, an array of view functions or objects or an object containing a `view` property (object or array). The advantage of the last option is being able to add custom route meta that gets merged with the request object. Example:

```javascript
route('/', {view: Home, name: 'home'});
route('/photos/:category', {view: Gallery, name: 'gallery'});
```

Calling route with only a string with navigate to the given URL. This is called internally by the framework when a link is clicked, but can be useful to programmatically change states. ~~~Optionally pass `{replace: true}` to update the current `window.history` record rather than pushing a new entry onto the stack.~~~

### before(transition);

### after(transition);

### start(options);

Start the framework and begin resolving routes.

## Browser Support

kahe uses Promises to handle transition flow, which means a polyfill would be required for IE11 and below.

## Development

Unit tests (which are incomplete!) use [budo](https://www.npmjs.com/package/budo), [tape](https://www.npmjs.com/package/tape) and [tap-dev-tool](https://www.npmjs.com/package/tap-dev-tool) (for more readable output).

```bash
npm install -g budo
npm install
npm run test
```
