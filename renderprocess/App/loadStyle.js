'use strict';

const less = require('less');
const utils = require('../utils');

let defaultLessOptions = { logLevel:2 };

module.exports = utils.createAsyncFun(function(styleId, stylePath, eventEmitter){
	let exist = document.getElementById(styleId);
	if(exist){
		eventEmitter.emit('success', exist.innerHTML);
		return;
	}
	utils.readFile(stylePath, function(err, text){
		if(err){
			eventEmitter.emit('error', err);
			return;
		}
		less.render(text, defaultLessOptions, function(error, output) {
			if (error) {
				eventEmitter.emit('error', error);
				return;
			}
			utils.addStyleToDOM(output.css, styleId);
			eventEmitter.emit('success', output.css);
		});
	});
});
