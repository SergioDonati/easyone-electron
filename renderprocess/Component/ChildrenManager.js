'use strict';

const EventEmitter = require('events');
const path = require('path');

module.exports = class ComponentsManager{

	constructor(parent){
		this._parent = parent;
		this._children = [];
		this._emitter = new EventEmitter();
	}

	get children(){ return this._children; }

	on(eventName, listener){
		this._emitter.on(eventName, listener);
	}

	getChildComponent(id){
		let child = this.getChild(id);
		if(child) return child.component;
		return null;
	}

	getChild(id){
		for(let i=0;i<this._children.length;i++){
			let child = this._children[i];
			if(child.id == id) return child;
		}
		return null;
	}

	static getChildContainer(parentElement, child){
		if(child.container_selector){
			if(child.container_selector === '_parent') return parentElement;
			else return parentElement.querySelector(child.container_selector);
		}
		return child.container_element;
	}

	static installChild(parentElement, child){
		return new Promise(function (resolve, reject){
			if (!parentElement || !child) return reject(new Error('Invalid parentElement or child!'));
			if (child.installed == true) return resolve(false);	// just installed
			if (child.installing == true) return resolve(false);	// just installed
			let containerElement = ComponentsManager.getChildContainer(parentElement, child);
			if (!containerElement) return reject(new Error('container for child component not found!'));
			let exist = containerElement.querySelector('#'+child.component.uniqueID);
			if (exist) {
				if(child.component.rendered){
					child.installed = true;
				}else{
					reject(new Error('component id is just used in DOM, but component isn\'t installed.'));
				}
				return;
			}
			child.installing = true;
			child.component.render(function(err, html){
				if(err){
					reject(err);
				}else{
					containerElement.appendChild(html);
					child.installed = true;
					resolve(child);
				}
				child.installing = false;
			});
		});
	}

	installChildren(){
		let parentElement = this._parent.HTMLElement;
		if(!parentElement || !this._children) return;
		for(let i=0;i<this._children.length;i++){
			let child = this._children[i];
			if(!child.installed){
				ComponentsManager.installChild(parentElement, child);
			}
		}
	}

	/**
	 * Instantiate a new Component
	 */
	createComponent(componentName, ...args){
		let directoryPath = path.join(this._parent.componentsPath, componentName);
		let initializer;
		try{
			initializer = require(directoryPath);
		}catch(e){
			if(e.code == 'MODULE_NOT_FOUND'){
				directoryPath = path.join(this._parent.currentApp.sharedComponentsFolder, componentName);
				initializer = require(directoryPath);
			}else throw e;
		}
		const Component = require('../Component');
		let component = (initializer instanceof Component)
			? new initializer(this._parent.currentApp, initializer.constructor.name, directoryPath)
		 	: new Component(this._parent.currentApp, initializer.name, directoryPath);
		if(typeof initializer == 'function') initializer(this._parent.currentApp, component, ...args);
		console.log('initializer type: '+typeof(initializer));
		return component;
	}

	loadViewComponents(){
		if(!this._parent.HTMLElement) return;
		let elements = this._parent.HTMLElement.querySelectorAll('[dynamicload-component="dynamicload-component"]');
		for(let i=0;i<elements.length;i++){
			let element = elements[i];
			let componentName = element.getAttribute('component');
			let componentId = element.getAttribute('component-id');
			let data = element.getAttribute('component-data');
			if(!componentId) componentId = element.getAttribute('id');
			try{
				let component = this.createComponent(componentName, data);
				this.addChild(componentId, element, component);
			}catch(e){
				console.error(e.stack);
			}
		}
	}

	clear(containerSelector){
		if(containerSelector == '_parent') return this.removeAllChild();
		const containerElement = this._parent.HTMLElement.querySelector(containerSelector);
		if(!containerElement) return;
		for(let i=0;i<this._children.length;i++){
			let child = this._children[i];
			if(child.container_element == containerElement || child.container_selector == containerSelector){
				this.removeChild(child);
			}
		}
		containerElement.innerHTML = '';
	}

	removeChild(child){
		if (!child) return;
		let index = this._children.indexOf(child);
		if ( index > -1){
			this._children.splice(index, 1);
		}
		child.component.remove();
	}

	removeAllChild(){
		for(let i=0;i<this._children.length;i++){
			let child = this._children[i];
			try{
				child.component.remove();
			}catch(e){}
		}
		this._children = [];
	}

	removeChildById(id){
		let child = this.getChild(id);
		this.removeChild(child);
	}

	addChild(id, container, component){
		const manager = this;
		return new Promise(function (resolve, reject){
			if(typeof(component) == 'string'){
				try{
					component = manager.createComponent(component);
				}catch(e){
					reject(e);
					return;
				}
			}
			if(!component || !component.render) {
				reject(new Error('Invalid component!'));
				return;
			}
			let child = {
				id: id,
				component: component,
				installed: false
			};
			if(typeof(container) == 'string'){
				child.container_selector = container;
			}else{
				// is HTMLElement
				child.container_element = container;
			}
			manager._children.push(child);
			manager._emitter.emit('children-changed', manager);
			manager._emitter.emit('new-child', id, component);
			if(manager._parent.HTMLElement) manager.installChildren();
			resolve(component);
		});
	}
}
