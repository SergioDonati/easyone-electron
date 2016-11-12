'use strict';

const EventEmitter = require('events');
const ChildrenManager = require('./ChildrenManager');
const renderer = require('./Renderer');
const utils = require('../utils');
const DOMEventManager = require('./DOMEventManager');
const path = require('path');
const fs = require('fs');
let count = 0;

module.exports = class Component {
	constructor (app, name, directoryPath){
		this.app = app;
		this.renderArgs = {
			locals: {},
			options: null
		};
		this.directoryPath = directoryPath;
		this.name = name.toLowerCase();
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

		// initialize
		this.viewPath = null;
		this.view = null;
		this.stylePath = null;
		this.componentsPath = app.sharedComponentsFolder ? app.sharedComponentsFolder : path.join(this.directoryPath, 'components');

		this.useDefaultPaths();
	}

	useDefaultPaths(directoryPath){
		if(directoryPath) this.directoryPath = directoryPath;
		/**
		 * 	Test if the default view path exist
		 */
		const defaultViewPath = path.join(this.directoryPath, 'view.pug');
		try{
			const viewPathStats = fs.statSync(defaultViewPath);
			if(viewPathStats.isFile()){
				this.viewPath = defaultViewPath;
			}
		}catch(e){}

		/**
		 * 	Test if the default style path exist
		 */
		const defaultStylePath = path.join(this.directoryPath, 'style.less');
		try{
			const stylePathStats = fs.statSync(defaultStylePath);
			if(stylePathStats.isFile()){
				this.stylePath = defaultStylePath;
			}
		}catch(e){}

		/**
		 * 	Test if the default components path exist
		 */
		const defaultComponentsPath = path.join(this.directoryPath, 'components');
		try{
			const componentsPathStats = fs.statSync(defaultComponentsPath);
			if(componentsPathStats.isDirectory()){
				this.componentsPath = defaultComponentsPath;
			}
		}catch(e){}
	}

	/**
	 *	These setter are usefull for secure set the correct attributes
	 */
	setViewPath(p){ this.viewPath = p; }
	setRelativeViewPath(p){ this.viewPath = path.join(this.directoryPath, p); }
	setComponentsPath(p){ this.componentsPath = p; }
	setRelativeComponentsPath(p){ this.componentsPath = path.join(this.directoryPath, p); }
	setStylePath(p){ this.stylePath = p; }
	setRelativeStylePath(p){ this.stylePath = path.join(this.directoryPath, p); }
	setView(v){ this.view = v; }

	/**
	 *	Return true if is just rendered
	 *	@return boolean
	 */
	get rendered(){ return !!this.HTMLElement; }

	addRenderLocals(key, value){
		this.renderArgs.locals[key] = value;
	}

	querySelector(selector){
		//if(!this.HTMLElement) return null;
		return this.HTMLElement.querySelector(selector);
	}
	querySelectorAll(selector){
		//if(!this.HTMLElement) return null;
		return this.HTMLElement.querySelectorAll(selector);
	}

	/**
	 *	@param id - permit to refer tis component
	 *	@param container_selector - where render the component
	 *	@param component - the component to inizializate
	 *	@return Promise
	 */
	addChild(id, container_selector, component){
		return this._childrenManager.addChild(id, container_selector, component);
	}

	getChildComponent(id){
		return this._childrenManager.getChildComponent(id);
	}

	addDOMListener(eventName, listener){
		this._DOMEventManager.addListener(eventName, listener);
	}

	/**
	 * 	Add listener to the child,
	 * 	also listen for every time that a child with this id is loaded
	 * 	@param string childId
	 * 	@param string eventName
	 * 	@param function listener
	 */
	addChildDOMListener(childId, eventName, listener){
		let childComponent = this.getChildComponent(childId);
		if(childComponent) childComponent.addDOMListener(eventName, listener);
		this._childrenManager.on('new-child', function(id, childComponent){
			if(id == childId) childComponent.addDOMListener(eventName, listener);
		});
	}

	onChildReady(childId, listener){
		let childComponent = this.getChildComponent(childId);
		if(childComponent) listener(childComponent);
		this._childrenManager.on('new-child', function(id, childComponent){
			if(id == childId) listener(childComponent);
		});
	}

	/**
	 * Remove all child contained in containerSelector Element
	 * can use '_parent' as special selector for delete all
	 */
	removeChildIn(containerSelector){
		this._childrenManager.clear(containerSelector);
	}

	get currentApp(){ return this.app; }

	on(eventName, callback){
		this._eventEmitter.on(eventName, callback.bind(this));
	}

	once(eventName, callback){
		this._eventEmitter.once(eventName, callback.bind(this));
	}

	remove(){
		if(this.HTMLElement && this.HTMLElement.parentNode) this.HTMLElement.parentNode.removeChild(this.HTMLElement);
		this.app.styleManager.removeStyle(this.styleUniqueID);
		this._childrenManager.removeAllChild();
		this._removed = true;
		this._eventEmitter.emit('removed', true);
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
