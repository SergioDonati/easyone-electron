'use strict';

const utils = require('../utils');

module.exports = class ControllersManager{

	constructor(app){
		this._app = app;
		this._appOptions = app._options;
		this._activeController = null;
	}

	/**
	 *	Can throw error
	 */
	new(controllerPath){
		let controller = require(this._appOptions.controllersPath + '/' + controllerPath);
		return new controller();
	}

	getControllerContainer(){
		let options = this._appOptions;
		if(options.container_id){
			return window.document.getElementById(options.container_id);
		}else{
			return window.document.body;
		}
	}

	startNew(controller){
		let manager = this;
		return utils.createAsyncFun(function(eventEmitter){
			if(typeof(controller) === 'string'){
				try{
					controller = manager.new(controller);
				}catch(e){
					eventEmitter.emit('error', e);
					return;
				}
			}
			if(!controller || !controller.render){
				eventEmitter.emit('error', new Error('Invalid controller!'));
				return;
			}
			let controllerContainer = manager.getControllerContainer();
			if(!controllerContainer) {
				eventEmitter.emit('error', new Error('Controller container not found!'));
				return;
			}
			controllerContainer.innerHTML = '';
			controller.render(controller.renderArgs, (err, html) => {
				if(!html){
					eventEmitter.emit('error', new Error('Invalid rendered.'));
					return;
				}
				manager._activeController = controller;
				controllerContainer.appendChild(html);
				eventEmitter.emit('success', controller);
			});
		})();
	}
}
