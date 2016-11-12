'use strict';

const utils = require('../utils');
const EventEmitter = require('events');
const path = require('path');

module.exports = class ControllersManager{

	constructor(app){
		this._app = app;
		this._appOptions = app._options;
		this._activeController = null;
		this._emitter = new EventEmitter();
	}

	on(eventName, listener){
		this._emitter.on(eventName, listener);
	}

	once(eventName, listener){
		this._emitter.once(eventName, listener);
	}

	get activeController(){ return this._activeController; }

	show(html){
		this.clear();
		this.controllerContainer.appendChild(html);
	}

	/**
	 *	Create new Controller
	 *	Can throw error
	 */
	new(controllerPath, ...args){
		const Controller = require('../Controller');
		const directoryPath = path.join(this._appOptions.controllersPath, controllerPath);
		const initializer = require(directoryPath);
		const controller = new Controller(this._app, initializer.name, directoryPath);
		initializer(this._app, controller, ...args);
		return controller;
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
				manager._emitter.emit('changed', manager, controller);
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
