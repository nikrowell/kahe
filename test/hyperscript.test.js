import test from 'tape';
import h from '../src/hyperscript';

test('create element', function(t) {

    let a = h('p', 'hello world');
    let b = h('p', 37);

    t.equal(a.outerHTML, '<p>hello world</p>', 'hello world');
    t.equal(b.outerHTML, '<p>37</p>', 'numbers converted to string');
    t.end();
});

test('nested elements', function(t) {

    let a = h('div', [h('h1', 'Title'), h('p', 'Paragraph')]);
    let b = h('div', ['foo ', h('strong', 'bar')]);
    let c = h('div', h('p', 'Hawaii'));

    t.equal(a.outerHTML, '<div><h1>Title</h1><p>Paragraph</p></div>', 'children as an array');
    t.equal(b.outerHTML, '<div>foo <strong>bar</strong></div>', 'children as a mixed array');
    t.equal(c.outerHTML, '<div><p>Hawaii</p></div>', 'children as an element');
    t.end();
});

test('id and class selectors', function(t){
    t.equal(h('#foo').outerHTML, '<div id="foo"></div>', '#foo');
    t.equal(h('.bar').outerHTML, '<div class="bar"></div>', '.bar');
    t.end();
});

test('set properties', function(t) {

    let a = h('a', {href: 'https://www.google.com'}, 'google');
    let checkbox = h('input', {type: 'checkbox', name: 'kahe', checked: true});

    t.equal(a.outerHTML, '<a href="https://www.google.com">google</a>', 'google link');
    t.equal(a.href, 'https://www.google.com/', 'href set on link');
    t.equal(checkbox.outerHTML, '<input type="checkbox" name="kahe">');
    t.ok(checkbox.checked, 'checkbox is checked');
    t.end();
});

test('set attribute selectors', function(t) {

    let a = h('input[type="text"]');
    let b = h('button[disabled]', 'Submit');
    let c = h('[data-title="hello"]');

    t.equal(a.outerHTML, '<input type="text">', 'input[type="text"]');
    t.equal(b.outerHTML, '<button disabled="">Submit</button>', 'button[disabled]');
    t.equal(c.outerHTML, '<div data-title="hello"></div>', '[data-title="hello"]');
    t.end();
});

test('set classes', function(t) {

    let a = h('div.foo.bar');
    let b = h('div', {class: 'foo bar'});

    t.equal(a.className, 'foo bar', 'multiple classes set on tag');
    t.equal(b.className, 'foo bar', 'multiple classes set as attribute string');
    t.end();
});

test('set styles', function(t) {

    let a = h('div', {style: {backgroundColor: 'red'}});
    let b = h('div', {style: 'background-color:red;display:none;color:white'});

    t.equal(a.style.backgroundColor, 'red', 'style as an object');
    t.equal(b.style.backgroundColor, 'red', 'style as a string');
    t.end();
});

test('sets data attributes', function(t) {

    let a = h('div', {'data-value': 5});
    let b = h('div[data-title="foo"]');

    t.equal(a.getAttribute('data-value'), '5');
    t.equal(b.getAttribute('data-title'), 'foo');
    t.end();
});