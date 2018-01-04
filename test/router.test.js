import test from 'tape';
import router, { before, after, start, go } from '../kahe';

const link = document.createElement('a');
document.body.appendChild(link);

test('exposed api', function(t) {

    let api = Object.keys(router).sort();
    let fns = ['before', 'after', 'start', 'go'].sort();

    fns.forEach(key => {
        api.includes(key) || t.fail(`${key} not in api`);
    });

    t.deepEqual(api, fns, api.join(', '));
    t.end();
});

test('go', function(t) {

    go('foo');
    t.equal(window.location.pathname, '/foo', "without preceeding slash");

    go('/bar');
    t.equal(window.location.pathname, '/bar', "with slash");

    go(window.location.origin + '/test');
    t.equal(window.location.pathname, '/test', "with full url");

    t.end();
});

test('click events', function(t) {

    link.href = '/hello';
    // link.textContent = 'LINK';
    // link.setAttribute('rel', 'external');
    document.addEventListener('click', function(event) {
        console.log('boom');
        event.preventDefault();
        // t.fail(msg)
    });

    // external links ignored
    // rel="external" prevents hijack
    // target attribute prevents hijack
    // download attribute prevents hijack
    // custom click callback prevents hijack

    link.click();

    start({
        // click:
        routes: [
            {path: '/', controller: 'Home'},
            {path: '/about', controller: 'About'},
            {path: '/contact', controller: 'Contact'},
        ]
    });

    t.end();
});

test('popstate events', function(t) {
    t.end();
});

test('before hooks', function(t) {
    t.end();
});

test('after hooks', function(t) {
    t.end();
});