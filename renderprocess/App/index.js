'use strict';

const EventEmitter = require('events');

class App {
	constructor(){
		this._property = {};
		this._options = {};
		this._eventEmitter = new EventEmitter();

		this.modalManager = require('./modal')(this);
		this.controllerManager = require('./controller')(this);

		process.nextTick(function(){
			this._isReady = true;
			this._eventEmitter.emit('ready', this);
		}.bind(this));
	}

	get isReady(){ return _isReady; }

	on(eventName, listener){
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
		this._eventEmitter.emit('options-change', this._options);
	}
}

// Singleton
module.exports = new App();
