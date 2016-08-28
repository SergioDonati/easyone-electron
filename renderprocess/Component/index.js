'use strict';

const {ipcRenderer} = require('electron'),
	EventEmitter = require('events'),
	app = require('../App'),
	ChildrenManager = require('./ChildrenManager'),
	renderer = require('./render'),
	utils = require('../utils'),
	DOMEventManager = require('./DOMEventManager');
let count = 0;

module.exports = class Component {
	constructor (...args){
		this.renderArgs = {
			locals: {},
			options: null
		};
		this.name = this.constructor.name.toLowerCase();
		this.uniqueID = this.name + '_' + (count++);
		this.styleUniqueID = 'style-'+this.uniqueID;
		this._eventEmitter = new EventEmitter();
		this._DOMContainerClass = 'component-'+this.name+' component';

		this._childrenManager = new ChildrenManager(this);
		this._DOMEventManager = new DOMEventManager(this);

		this.render = renderer(this);

		this.on('rendered', function(){
			if(this.stylePath) app.styleManager.injectStyleFile(this.styleUniqueID, this.stylePath, utils.classNameToSelector(this._DOMContainerClass));
			this._DOMEventManager.run(this.HTMLElement);
			this._childrenManager.installChildren();
			this._childrenManager.loadViewComponents();
		});

		this.init(...args);
	}

	// Override this for return the values
	get viewPath(){ return null; }
	get view(){ return null; }
	get stylePath(){ return null; }
	get componentsPath(){ return app.controllersForlder+'/../' ; }

	get rendered(){ return !!this.HTMLElement; }
	addRenderLocals(key, value){
		this.renderArgs.locals[key] = value;
	}

	init(){}

	querySelector(selector){
		//if(!this.HTMLElement) return null;
		return this.HTMLElement.querySelector(selector);
	}
	querySelectorAll(selector){
		//if(!this.HTMLElement) return null;
		return this.HTMLElement.querySelectorAll(selector);
	}

	addChild(id, container_selector, component){
		if (!component instanceof Component) return;
		this._childrenManager.addChild(id, container_selector, component);
	}

	getChildComponent(id){
		return this._childrenManager.getChildComponent(id);
	}

	addDOMListener(eventName, listener){
		this._DOMEventManager.addListener(eventName, listener);
	}

	addChildDOMListener(childId, eventName, listener){
		let childComponent = this.getChildComponent(childId);
		if(childComponent) childComponent.addDOMListener(eventName, listener);
		else{
			this._childrenManager.on('new-child', function(id, childComponent){
				if(id == childId) childComponent.addDOMListener(eventName, listener);
			});
		}
	}

	onChildReady(childId, listener){
		let childComponent = this.getChildComponent(childId);
		if(childComponent) listener(childComponent);
		else{
			this._childrenManager.on('new-child', function(id, childComponent){
				if(id == childId) listener(childComponent);
			});
		}
	}

	get currentApp(){ return app; }

	on(eventName, callback){
		this._eventEmitter.on(eventName, callback.bind(this));
	}

	once(eventName, callback){
		this._eventEmitter.once(eventName, callback.bind(this));
	}

	remove(){
		if(this.HTMLElement && this.HTMLElement.parentNode) this.HTMLElement.parentNode.removeChild(this.HTMLElement);
		app.styleManager.removeStyle(this.styleUniqueID);
		this._childrenManager.removeAllChild();
		this._removed = true;
	}

	refresh(callback, appendToParent){
		let parent;
		try{
			parent = this.HTMLElement.parentNode;
		}catch(e){}
		this.remove();
		this._removed = false;
		this.render(null, function(err, html){
			if(!err && appendToParent == true && parent) parent.appendChild(html);
			if(callback) callback(err, html);
		}, true);
	}
}
