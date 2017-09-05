import { isArray, isObject, isString } from './utils';

const parseTag = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g;
const parseAttr = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/;

export default function(tag, options) {

	var attrs = isObject(options) ? options : {},
		children = (arguments.length == 3) ? arguments[2] : options,
		node = {tag: 'div', attrs: {}},
		classes = [],
		element,
		match,
		key;

	while(match = parseTag.exec(tag)) {

		if(match[1] === '' && match[2]) {
			node.tag = match[2];
		} else if(match[1] === '#') {
			node.attrs.id = match[2];
		} else if(match[1] === '.') {
			classes.push(match[2]);
		} else if(match[3][0] === '[') {
			var pair = parseAttr.exec(match[3]);
			if(pair[1] === 'class') {
				classes.push(pair[3]);
			} else {
				node.attrs[pair[1]] = pair[3] || (pair[2] ? '' : true);
			}
		}
	}

	for(key in attrs) {
		if(attrs.hasOwnProperty(key)) {
			if(key == 'class') {
				classes.push(attrs[key]);
			} else {
				node.attrs[key] = attrs[key];
			}
		}
	}

	element = document.createElement(node.tag);
	attrs = node.attrs;

	for(key in attrs) {
		if(attrs.hasOwnProperty(key)) {
			if(key == 'class') {
				classes.push(attrs[key]);
			} else if(key == 'style') {
				element.style.cssText = attrs[key];
			} else if(key == 'styles') {
				// TODO
			} else {
				element[key] = attrs[key];
			}
		}
	}

	if(classes.length) {
		element.className = classes.join(' ');
	}

	if(isString(children)) {
		element.textContent = children;
	} else if(isArray(children)) {
		for(var i = 0, n = children.length; i < n; i++) {
			element.appendChild(children[i]);
		}
	}

	return element;
};