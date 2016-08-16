'use strict';

module.exports = class ComponentsManager{

	constructor(parent){
		this._parent = parent;
		this._children = [];
	}

	get children(){ return this._children; }

	getChild(id){
		for(let i=0;i<this._children.length;i++){
			let child = this._children[i];
			if(child.id == id) return child;
		}
		return null;
	}

	static install_child(parentElement, child){
		if (!parentElement || !child) return;
		console.log('install child: '+child.id);
		let containerElement = child.container_element;
		if(child.container_selector){
			if(child.container_selector === '_parent') containerElement = parentElement;
			else containerElement = parentElement.querySelector(child.container_selector);
		}
		if (!containerElement) return;
		let exist = containerElement.querySelector('#'+child.component.uniqueID);
		if (exist) return;	// just exist
		console.log('render child: '+child.id);
		child.component.render(child.component.renderArgs, function(err, html){
			containerElement.appendChild(html);
		});
		child.installed = true;
	}

	installChildren(){
		let parentElement = this._parent.HTMLElement;
		if(!parentElement || !this._children) return;
		for(let i=0;i<this._children.length;i++){
			let child = this._children[i];
			if(!child.installed){
				ComponentsManager.install_child(parentElement, child);
			}
		}
	}

	loadViewComponents(){
		if(!this._parent.HTMLElement) return;
		let elements = this._parent.HTMLElement.querySelectorAll('[dynamicload-component="dynamicload-component"]');
		console.log('get elements');
		for(let i=0;i<elements.length;i++){
			let element = elements[i];
			let componentName = element.getAttribute('component');
			let componentId = element.getAttribute('component-id');
			try{
				console.log('init component');
				let component = require(this._parent.componentsPath+'\\'+componentName);
				component = new component();
				this.addChild(componentId, element, component);
			}catch(e){
				console.error(e.stack);
			}
		}
	}

	addChild(id, container, component){
		console.log('add component: '+id);
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
		if(this._parent.HTMLElement) this.installChildren();
	}
}
