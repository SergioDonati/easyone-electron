'use strict';

const {ipcMain} = require('electron');
const fs = require('fs');

module.exports = function(){
	console.log(require('util').inspect(require('electron'), { depth: null }));
	if(!ipcMain) return;
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
}
