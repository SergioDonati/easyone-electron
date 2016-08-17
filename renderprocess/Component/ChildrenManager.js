'use strict';

const EventEmitter = require('events');

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
			child.component.render(function(err, html){
				if(err){
					reject(err);
				}else{
					containerElement.appendChild(html);
					child.installed = true;
					resolve(child);
				}
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

	createComponent(componentName){
		let component = require(this._parent.componentsPath+'\\'+componentName);
		return new component();
	}

	loadViewComponents(){
		if(!this._parent.HTMLElement) return;
		let elements = this._parent.HTMLElement.querySelectorAll('[dynamicload-component="dynamicload-component"]');
		for(let i=0;i<elements.length;i++){
			let element = elements[i];
			let componentName = element.getAttribute('component');
			let componentId = element.getAttribute('component-id');
			try{
				let component = this.createComponent(componentName);
				this.addChild(componentId, element, component);
			}catch(e){
				console.error(e.stack);
			}
		}
	}

	clear(containerSelector){
		let containerElement = this._parent.HTMLElement.querySelector(containerSelector);
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
			this.removeChild(child);
		}
	}

	removeChildById(id){
		let child = this.getChild(id);
		this.removeChild(child);
	}

	addChild(id, container, component){
		if(typeof(component) == 'string'){
			try{
				component = this.createComponent(component);
			}catch(e){
				console.error(e.stack);
			}
		}
		if(!component) {
			console.error('Invalid component!');
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
		this._children.push(child);
		this._emitter.emit('children-changed', this);
		this._emitter.emit('new-child', id, component);
		if(this._parent.HTMLElement) this.installChildren();
	}
}
