'use strict';

const pug = require('pug');
const utils = require('../utils');
const {ipcRenderer} = require('electron');

function createHTMLElement(html, uniqueID, className){
	let element = document.createElement('div');
	element.setAttribute('id', uniqueID);
	if(className){
		element.className = className;
	}
	element.innerHTML = html;
	return element;
}

function createViewTemplate(view, viewEngine, options, callback){
	let fn = function(locals){ return view; };
	if(viewEngine == 'pug') {
		fn = pug.compile(view, options);
	}
	return callback(null, fn);
}

module.exports = function(component){
	/**
	 *	viewPath -> view (viewEngine) -> viewTemplate -> html -> HTMLElement
	 */
	function render(args, callback){
		args = args || {};
		if(component.HTMLElement) {
			component._eventEmitter.emit('rendered', component.HTMLElement);
			if(callback) callback(null, component.HTMLElement);
		}else if(component.viewTemplate){
			let locals = args.locals || {};
			let html = component.viewTemplate(locals);
			component.HTMLElement = createHTMLElement(html, component.uniqueID, component._DOMContainerClass);
			component._eventEmitter.emit('rendered', component.HTMLElement);
			if(callback) callback(null, component.HTMLElement);
		}else if(component.view){
			let options = args.options || null;
			createViewTemplate(component.view, component.viewEngine || args.viewEngine || 'pug', options, function(err, fn){
				component._viewTemplate = fn;
				render(args, callback);
			});
		}else if(component.viewPath){
			utils.readFile(component.viewPath, function(err, text){
				component._view = text;
				render(args, callback);
			});
		}
		return component;
	}

	return render;
};
