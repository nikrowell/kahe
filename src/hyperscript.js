import { isArray, isDefined, isElement, isObject, isString } from './utils';

const parseTag = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g;
const parseAttr = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/;
const cache = {};

export default function(tag, options) {

    let attrs = isObject(options) ? options : {};
    let children = (arguments.length === 3) ? arguments[2] : options;
    let node = {tag: 'div', attrs: {}};
    let classes = [];
    let match;
    let name;

    while(match = parseTag.exec(tag)) {

        if(match[1] === '' && isDefined(match[2])) {
            node.tag = match[2];
        } else if(match[1] === '#') {
            node.attrs.id = match[2];
        } else if(match[1] === '.') {
            classes.push(match[2]);
        } else if(match[3][0] === '[') {
            let pair = parseAttr.exec(match[3]);
            node.attrs[pair[1]] = pair[3] || (pair[2] ? '' : true);
        }
    }

    for(name in attrs) {

        if(name === 'class') {
            classes = classes.concat(attrs[name].split(' '));
        } else if(attrs.hasOwnProperty(name)) {
            node.attrs[name] = attrs[name];
        }
    }

    const element = document.createElement(node.tag);

    if(classes.length) {
        element.classList.add(...classes);
    }

    for(name in node.attrs) {

        let value = node.attrs[name];

        if(name === 'style') {

            if(isString(value)) {
                element.style.cssText = value;
            } else {
                Object.keys(value).forEach(prop => element.style[prop] = value[prop]);
            }

        } else if(name in element) {
            element[name] = value;
        } else {
            element.setAttribute(name, value);
        }
    }

    if(isElement(children)) {

        element.appendChild(children);

    } else if(isString(children) || !isNaN(children)) {

        let text = document.createTextNode(children);
        element.appendChild(text);

    } else if(isArray(children)) {

        children.forEach(child => {
            if(isString(child)) child = document.createTextNode(child);
            element.appendChild(child);
        });
    }

    return element;
};