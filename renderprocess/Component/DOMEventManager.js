'use strict';

module.exports = class DOMEventManager{
	constructor(component){
		this._listenerBinded = {};
		this._listeners = {};
		this._eventElements = {};	// Element to watch for bind
		this._component = component;
	}

	bindEvent(element, eventName, fun){
		if(!fun || !eventName || !element) return;
		if(!this._listenerBinded[element]) this._listenerBinded[element] = {};
		if(this._listenerBinded[element][eventName]){
			element.removeEventListener(eventName, this._listenerBinded[element][eventName]);
		}
		let listener = function(e){
			e.preventDefault();
			try{
				fun.apply(element, arguments);
			}catch(err){
				console.error(err.stack);
			}
		}
		this._listenerBinded[element][eventName] = listener;
		element.addEventListener(eventName, listener, true);
	}

	addListener(eventName, listener){
		this._listeners[eventName] = listener;
		if(this._eventElements[eventName]){
			this.bindEvent(this._eventElements[eventName], eventName, listener);
		}
	}

	run(DOMelement){
		if(!DOMelement) return;

		let elements = DOMelement.querySelectorAll('[bind-event="bind-event"]');
		let bindAttrRegex = /bind-event-([\w]+)/;
		for(let i=0;i<elements.length;i++){
			let element = elements[i];
			for(let j=0;j<element.attributes.length; j++){
				let attr = element.attributes[j];
				let eventName = bindAttrRegex.exec(attr.name.toString());
				if(eventName){
					this.bindEvent(element, eventName[1], this._listeners[attr.value]);
					this._eventElements[eventName[1]] = element;
				}
			}
		}
	}
}
