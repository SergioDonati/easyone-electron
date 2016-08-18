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

	removeController(){
		if(this._activeController){
			this._activeController.remove();
			this._activeController = null;
		}
		let controllerContainer = this.getControllerContainer();
		controllerContainer.innerHTML = '';
	}

	startNew(controller){
		let manager = this;
		return new Promise(function(resolve, reject){
			if(typeof(controller) === 'string'){
				try{
					controller = manager.new(controller);
				}catch(e){
					reject(e);
					return;
				}
			}
			if(!controller || !controller.render){
				reject(new Error('Invalid controller!'));
				return;
			}
			let controllerContainer = manager.getControllerContainer();
			if(!controllerContainer) {
				reject(new Error('Controller container not found!'));
				return;
			}
			controller.render((err, html) => {
				if(err) return reject(err);
				if(!html){
					reject(new Error('Invalid rendered.'));
					return;
				}
				manager.removeController();
				manager._activeController = controller;
				controllerContainer.appendChild(html);
				resolve(controller);
			});
		});
	}

	refreshActiveController(){
		let controllerContainer = this.getControllerContainer();
		if(!controllerContainer) return;
		this._activeController.refresh(function(err, html){
			if(err) return;
			controllerContainer.appendChild(html);
		});
	}
}
