'use strict';

let activeController = null;

function getControllerContainer(options){
	if(options.container_id){
		return window.document.getElementById(options.container_id);
	}else{
		return window.document.body;
	}
}

module.exports = function(app){

	let extend = {};

	extend.startNew = function(controller){
		if(typeof(controller) === 'string' && app._options.controllersPath){
			try{
				controller = require(app._options.controllersPath + '/' + controller);
				controller = new controller();
			}catch(e){
				console.error(e.stack);
			}
		}
		if(!controller || !controller.render){
			console.error('Invalid controller.');
			return;
		}
		let controllerContainer = getControllerContainer(app._options);
		if(!controllerContainer) return;
		process.nextTick(function(){
			controllerContainer.innerHTML = '';
			controller.render(controller.renderArgs, (err, html) => {
				if(!html){
					console.error('Invalid rendered.');
					return;
				}
				activeController = controller;
				controllerContainer.appendChild(html);
			});
		});
		return controller;
	}

	return extend;
}
