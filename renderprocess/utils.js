'use strict';

const {ipcRenderer} = require('electron');
const EventEmitter = require('events');

let uniqueCallId = 0;

module.exports.readFile = function (filePath, callback){
	let callId = 'utils-'+ (uniqueCallId++);
	ipcRenderer.once('readFile-reply-'+callId, (event, text) => {
		callback(null, text);
	});
	ipcRenderer.send('readFile', { id:callId, filePath: filePath });
}

// Convert className to selector
module.exports.classNameToSelector = function(className){
	let names = className.split(' ');
	let selector = '';
	for(let i=0;i<names.length;i++){
		selector+= '.'+names[i];
	}
	return selector;
}

module.exports.addStyleToDOM = function(css, uniqueID){
	let style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	style.setAttribute('id', uniqueID);
	document.getElementsByTagName('head')[0].appendChild(style);
}

module.exports.createAsyncFun = function(fun, allowCallback){
	return function(){
		let funargs = Array.from(arguments);
		let callback = null;
		if(arguments.length > 0){
			let lastArg = arguments[arguments.length - 1];
			if(lastArg && typeof(lastArg) == 'function'){
				callback = lastArg;
				funargs = funargs.pop();
			}
		}
		let eventEmitter = new EventEmitter();
		eventEmitter.on('error', function (e){
			if(e){
				console.error(e.stack);
				if(e && callback) callback(e);
			}
		});
		eventEmitter.on('success', function(){
			let args = Array.from(arguments);
			args = args.unshift(null);
			if(callback) callback.apply(undefined, args);
		});
		funargs.push(eventEmitter);
		process.nextTick(function(){
			fun.apply(undefined, funargs);
		});
		return eventEmitter;
	}
}
