'use strict';

const {ipcMain} = require('electron');
const fs = require('fs');
const less = require('less');
const pug = require('pug');
const path = require('path');

module.exports = function(options){
	options = options || {};
	const lessStylePath = (options.less && options.less.basedir) || null;
	const pugBasedir = (options.pug && options.pug.basedir) || null;
	if(!ipcMain) {
		console.warn('ipcMain is undefined');
		return;
	}
	ipcMain.on('easyone-readFile', function(event, args){
		fs.readFile(args.filePath, (err, data) => {
  			if (err) {
				console.error(err.stack);
				throw err;
			}
			if (data) data = data.toString();
			event.sender.send('easyone-readFile-reply-'+args.id, data);
		});
	});

	ipcMain.on('easyone-pug-render', function(event, args){
		args.options = args.options || {};
		if(!args.options.basedir && pugBasedir) args.options.basedir = pugBasedir;
		let fn = pug.compileFile(args.filePath, args.options);
		// TODO cache fn for improve performance
		let html = fn(args.locals);
		event.sender.send('easyone-pug-render-reply-'+args.id, html);
	});

	ipcMain.on('easyone-less-render', function(event, args){
		args.options = args.options || {};
		args.options.fileName = path.parse(args.filePath).base;
		args.options.paths = [path.parse(args.filePath).dir];
		if(lessStylePath) args.options.paths.push(lessStylePath);
		// TODO cache style for improve performance
		fs.readFile(args.filePath, (err, data) =>{
			if(err) throw err;
			data = data.toString();
			if(args.wrapWith && data && data.trim() != ''){
				data = args.wrapWith + '{ ' + data + ' }';
			}
			less.render(data, args.options, function(error, output){
				if(error) {
					console.error(error);
					throw error;
				}
				event.sender.send('easyone-less-render-reply-'+args.id, output.css);
			});
		});
	});
}
