'use strict';

const {ipcRenderer} = require('electron'),
	EventEmitter = require('events'),
	app = require('../App'),
	ChildrenManager = require('./ChildrenManager'),
	renderer = require('./render'),
	DOMEventManager = require('./DOMEventManager');
let count = 0;

module.exports = class Component {
	constructor (){
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

		this.init();
	}

	// Override this for return the values
	get viewPath(){ return null; }
	get view(){ return null; }
	get stylePath(){ return null; }
	get componentsPath(){ return app._options.controllersPath+'/../' ; }

	get rendered(){ return !!this.HTMLElement; }

	init(){}

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

	refresh(callback){
		this.remove();
		this._removed = false;
		this.render(callback);
	}
}
