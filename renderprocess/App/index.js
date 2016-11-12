'use strict';

const EventEmitter = require('events');
const ControllersManager = require('./ControllersManager');
const ModalsManager = require('./ModalsManager');
const StyleManager = require('./StyleManager');
const path = require('path');

module.exports = class App {
	constructor(options, readyCb){
		this._property = {};
		this._options = {};
		this._eventEmitter = new EventEmitter();

		this.modalManager = new ModalsManager(this);
		this.controllerManager = new ControllersManager(this);
		this.styleManager = new StyleManager(this);
		this.loadStyle = this.styleManager.injectStyleFile.bind(this.styleManager);

		this.setOptions(options);

		this.on('ready', readyCb);
		const ready = () => {
			process.nextTick(() => {
				this._isReady = true;
				this._eventEmitter.emit('ready', this);
			});
		};
		if(document.readyState === 'complete') ready();
		else document.addEventListener('DOMContentLoaded', ready, false);
	}

	get isReady(){ return this._isReady; }

	on(eventName, listener){
		if(typeof listener != 'function') return;
		if(eventName === 'ready'){
			if (this.isReady) listener(this);
			else this._eventEmitter.once(eventName, listener);
			return;
		}
		this._eventEmitter.on(eventName, listener);
	}

	start(controller){
		if(!controller && this._options.controllersPath){
			this.controllerManager.startNew('.');
		}else if(controller){
			this.controllerManager.startNew(controller);
		}
	}

	get controllersForlder(){ return this._options.controllersPath; }
	get sharedComponentsFolder(){ return this._options.sharedComponentsPath || path.join(this.controllersForlder, '..', 'components'); }

	getProperty(name){
		return this._property[name];
	}

	setProperty(name, value){
		const oldValue = this._property[name];
		this._property[name] = value;
		process.nextTick(function(){
			this._eventEmitter.emit('propertyChanged', name, value, oldValue);
		}.bind(this));

	}

	setOption(name, value){
		if (this._options[name] == value) return;
		this._options[name] = value;
		process.nextTick(function(){
			this._eventEmitter.emit('options-change', name, this._options);
		}.bind(this));
	}

	setOptions(options){
		if(!options) return;
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
