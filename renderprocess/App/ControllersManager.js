'use strict';

const utils = require('../utils');

module.exports = class ControllersManager{

	constructor(app){
		this._app = app;
		this._appOptions = app._options;
		this._activeController = null;
	}

	get activeController(){ return this._activeController; }

	show(html){
		this.clear();
		this.controllerContainer.appendChild(html);
	}

	/**
	 *	Can throw error
	 */
	new(controllerPath, ...args){
		let controller = require(this._appOptions.controllersPath + '/' + controllerPath);
		return new controller(...args);
	}

	get controllerContainer(){
		let options = this._appOptions;
		let container = window.document.body;
		if(options.container_id){
			let c = window.document.getElementById(options.container_id);
			if(c) container = c;
		}
		return container;
	}

	clear(){
		this.removeController();
		this.controllerContainer.innerHTML = '';
	}

	removeController(){
		if(!this.activeController) return;
		this.activeController.remove();
		this._activeController = null;
	}

	startNew(controller, ...args){
		let manager = this;
		return new Promise(function(resolve, reject){
			if(typeof(controller) === 'string'){
				try{
					controller = manager.new(controller, ...args);
				}catch(e){
					reject(e);
					return;
				}
			}
			if(!controller || !controller.render){
				reject(new Error('Invalid controller!'));
				return;
			}
			controller.render((err, html) => {
				if(err) return reject(err);
				if(!html){
					reject(new Error('Invalid rendered.'));
					return;
				}
				manager.show(html);
				manager._activeController = controller;
				resolve(controller);
			});
		});
	}

	refreshController(){
		this.activeController.refresh(function(err, html){
			if(err) return;
			this.controllerContainer.appendChild(html);
		});
	}
}
