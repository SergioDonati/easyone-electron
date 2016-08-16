'use strict';

const less = require('less');
const utils = require('../utils');

function compile(data, wrapWith, options, callback){
	if(data && data.trim() != '' && wrapWith){
		data = wrapWith + '{ ' + data + ' }';
	}
	less.render(data, options, function(error, output) {
		if (error) {
			console.error(error);
			return callback(error);
		}
		callback(null, output.css)
	});
}

let defaultLessOptions = { logLevel:2 };

module.exports = function(component){

	/**
	 *	stylePath -> style (less) -> css
	 */
	function render(callback){
		let styleId = 'style_'+component.uniqueID;
		let exist = document.getElementById(styleId);
		if(exist){
			component._eventEmitter.emit('style-rendered', css);
			return;
		}
		let wrapWith = utils.classNameToSelector(component._DOMContainerClass);

		if(component._css){
			utils.addStyleToDOM(component._css, styleId);
			component._eventEmitter.emit('style-rendered', component._css);
			if(callback) callback(null, component._css);
		}else if(component.style){
			compile(component.style, wrapWith, defaultLessOptions, function(err, css){
				if(err){
					if(callback) callback(err);
					return;
				}
				component._css = css;
				render(callback);
			});
		}else if(component.stylePath){
			utils.readFile(component.stylePath, function(err, text){
				if(err){
					if(callback) callback(err);
					return;
				}
				component._style = text;
				render(callback);
			});
		}
	}

	render();
};
