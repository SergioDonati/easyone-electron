'use strict';

const EventEmitter = require('events'),
	ControllersManager = require('./ControllersManager'),
	ModalsManager = require('./ModalsManager'),
	loadStyle = require('./loadStyle');

class App {
	constructor(){
		this._property = {};
		this._options = {};
		this._eventEmitter = new EventEmitter();

		this.modalManager = new ModalsManager(this);
		this.controllerManager = new ControllersManager(this);
		this.loadStyle = loadStyle;

		function ready(){
			process.nextTick(function(){
				this._isReady = true;
				this._eventEmitter.emit('ready', this);
			}.bind(this));
		};
		if(document.readyState === 'complete') ready.call(this);
		else document.addEventListener('DOMContentLoaded', ready.bind(this), false);
	}

	get isReady(){ return this._isReady; }

	on(eventName, listener){
		if(eventName === 'ready' && this.isReady){
			listener(this);
			return;
		}
		this._eventEmitter.on(eventName, listener);
	}

	start(controller){
		if(!controller && this._options.controllersPath){
			controller = require(this._options.controllersPath);
		}
		if(controller){
			this.controllerManager.startNew(new controller());
		}
	}

	getProperty(name){
		return this._property[name];
	}

	setProperty(name, value){
		this._property[name] = value;
	}

	setOption(name, value){
		this._options[name] = value;
		this._eventEmitter.emit('options-change', name, this._options);
	}
}

// Singleton
module.exports = new App();
