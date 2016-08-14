'use strict';

let controllerContainer = null;
let activeController = null;

function configure(options){
	if(options.container_id){
		controllerContainer = window.document.getElementById(options.container_id);
	}else{
		controllerContainer = window.document.body;
	}
}

module.exports = function(app){

	Object.observe(app._options, function(changes){
		changes.forEach(function(change){
			if(change.name == 'container_id') configure(app._options);
		});
	});

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
		if(!controllerContainer) return;
		process.nextTick(function(){
			controllerContainer.innerHTML = '';
			controller.render(controller.renderArgs, (err, html) => {
				if(!html){
					console.error('Invalid rendered.');
					return;
				}
				actveController = controller;
				controllerContainer.appendChild(html);
			});
		});
		return controller;
	}

	return extend;
}
