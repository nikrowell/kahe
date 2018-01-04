import test from 'tape';
import Route from '../src/route';

test('route matching', function(t) {

    let route;
    let match;

    route = new Route('/hello', {});
    match = route.match('/hello#world');
    t.equal(match.path, '/hello', 'hash ignored');

    route = new Route('/courses', {});
    match = route.match('/courses?level=1&premium=false');
    t.equal(match.path, '/courses', 'query string ignored');

    route = new Route('/lang/:lang([a-z]{2})', {});
    match = route.match('/lang/en');
    t.equal(match.params.lang, 'en', 'regex paths');
    match = route.match('/lang/english');
    t.equal(match, false, 'regex paths');

    route = new Route('/:controller/:action/:id.:format?', {});
    match = route.match('/users/view/20171025.json');
    t.equal(match.path, '/users/view/20171025.json', 'path');
    t.deepEqual(match.params, {controller: 'users', action: 'view', id: 20171025, format: 'json'}, 'multiple params');
    match = route.match('/projects/edit/bdbf7640');
    t.deepEqual(match.params, {controller: 'projects', action: 'edit', id: 'bdbf7640', format: undefined}, 'optional params');

    route = new Route('/account/:hash/assets/*', {});
    match = route.match('/account/bdbf7640/assets/images/logo.png');
    t.equal(match.params[0], 'images/logo.png', 'splats');
    t.equal(match.params.hash, 'bdbf7640', 'splats and params');

    route = new Route('/assets/*/*.*', {});
    match = route.match('/assets/images/kitty.jpg');
    match.params.shift();
    t.equal(match.params.join('.'), 'kitty.jpg', 'multiple splats');

    t.end();
});

test('route cloning', function(t) {

    let route = new Route('/photos/:category', {
        auth: false,
        name: 'gallery',
        keys: 'reserved'
    });

    let match = route.match('/photos/landscapes');

    t.equal(match.name, 'gallery', 'custom route meta');
    t.notOk(match.keys, 'internal properties removed');
    t.end();
});