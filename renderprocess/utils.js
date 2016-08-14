'use strict';

const {ipcRenderer} = require('electron');

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
