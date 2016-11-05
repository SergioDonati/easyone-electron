'use strict';

const EventEmitter = require('events');
const ControllersManager = require('./ControllersManager');
const ModalsManager = require('./ModalsManager');
const StyleManager = require('./StyleManager');

class App {
	constructor(){
		this._property = {};
		this._options = {};
		this._eventEmitter = new EventEmitter();

		this.modalManager = new ModalsManager(this);
		this.controllerManager = new ControllersManager(this);
		this.styleManager = new StyleManager(this);
		this.loadStyle = this.styleManager.injectStyleFile.bind(this.styleManager);

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
			if (this.isReady) listener(this);
			else this._eventEmitter.once(eventName, listener);
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

	get controllersForlder(){ return this._options.controllersPath; }
	get sharedComponentsFolder(){ return this._options.sharedComponentsPath || (this.controllersForlder+'\\..\\components'); }

	getProperty(name){
		return this._property[name];
	}

	setProperty(name, value){
		const oldValue = this._property[name];
		this._property[name] = value;
		this._eventEmitter.emit('propertyChanged', name, value, oldValue);
	}

	setOption(name, value){
		this._options[name] = value;
		this._eventEmitter.emit('options-change', name, this._options);
	}

	setOptions(options){
		let keys = Object.keys(options);
		for(let i=0;i<keys.length;i++){
			let key = keys[i];
			let value = options[key];
			this.setOption(key, value);
		}
	}

	refreshActiveController(){
		this.controllerManager.refreshController();
	}
}

// Singleton
module.exports = new App();
