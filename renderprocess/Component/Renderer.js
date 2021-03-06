'use strict';

const utils = require('../utils');

function createHTMLElement(html, uniqueID, className){
	let element = document.createElement('div');
	element.setAttribute('id', uniqueID);
	element.setAttribute('data-unique-id', uniqueID);
	if(className){
		element.className = className;
	}
	element.innerHTML = html;
	return element;
}

let defaultPugOptions = {
	pretty: true,
	compileDebug: true
};

module.exports = function Renderer(component){

	/**
	 *	if HTMLElement just exists and refresh is false, use the HTMLElement
	 *	else if viewTemplate exists, generate html from viewTemplate (take locals and convert in html)
	 *	else if view is defined return it as html
	 *	else if viewPath is defined use the viewEngine for compile file to html
	 */
	return function render(){
		let callback = arguments[0];
		let renderArgs = component.renderArgs;
		let args = {};
		let refresh = false;
		if(arguments.length > 1){
			args = arguments[0] || args;
			callback = arguments[1];
		}
		if(arguments.length > 2){
			refresh = arguments[2];
		}
		let locals = renderArgs.locals || args.locals || {};
		let options = renderArgs.options || args.options || null;
		let viewEngine = component.viewEngine || renderArgs.viewEngine || 'pug';

		function complete(html){
			if(html) component.HTMLElement = createHTMLElement(html, component.uniqueID, component._DOMContainerClass);
			component._eventEmitter.emit('rendered', component.HTMLElement);
			if(callback) callback(null, component.HTMLElement);
		}

		if(component.HTMLElement && !refresh) {
			complete();
		}else if(component.viewTemplate){
			let html = component.viewTemplate(locals);
			complete(html);
		}else if(component.view){
			complete(component.view);
		}else if(component.viewPath){
			if(viewEngine == 'pug'){
				utils.renderPugFile(component.viewPath, locals, options || defaultPugOptions, function(err, html){
					complete(html);
				});
			}else{
				utils.readFile(component.viewPath, function(err, text){
					complete(text);
				});
			}
		}
		return component;
	}
};
