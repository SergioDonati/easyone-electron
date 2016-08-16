'use strict';

const {ipcRenderer} = require('electron'),
	EventEmitter = require('events'),
	app = require('../App'),
	ChildrenManager = require('./children'),
	styleRenderer = require('./style'),
	renderer = require('./render'),
	bindEvents = require('./binder').bindEvents;
let count = 0;

module.exports = class Component {
	constructor ( ){
		this.renderArgs = {
			locals: {},
			options: {
				pretty: true,
				compileDebug: true
			}
		};
		this.name = this.constructor.name.toLowerCase();
		this.uniqueID = this.name + '_' + count;
		count++;
		this._eventEmitter = new EventEmitter();
		this._DOMListeners = {};
		this._DOMContainerClass = 'component-'+this.name+' component';

		this._childrenManager = new ChildrenManager(this);

		this.render = renderer(this);

		this.on('rendered', function(){
			this._childrenManager.installChildren();
			styleRenderer(this);
			bindEvents(this.HTMLElement, this._DOMListeners);
			this._childrenManager.loadViewComponents();
		});

		this.init();
	}

	// Override this for return the values
	get viewPath(){ return null; }
	get view(){ return this._view; }
	get viewTemplate(){ return this._viewTemplate; }
	get stylePath(){ return null; }
	get style(){ return this._style; }
	get componentsPath(){ return app._options.controllersPath+'/../' ; }

	init(){}

	addChild(id, container_selector, component){
		if (!component instanceof Component) return;
		this._childrenManager.addChild(id, container_selector, component);
	}

	getChild(id){
		return this._childrenManager.getChild(id);
	}

	addDOMListener(eventName, listener){
		this._DOMListeners[eventName] = listener;
	}

	get currentApp(){ return app; }

	on(eventName, callback){
		this._eventEmitter.on(eventName, callback.bind(this));
	}
}
