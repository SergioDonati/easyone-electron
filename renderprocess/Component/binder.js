'use strict';

let _eventListener = {};

function bind_event(element, eventName, fun){
	if(!fun || !eventName || !element) return;
	if(!_eventListener[element]) _eventListener[element] = {};
	if(_eventListener[element][eventName]){
		element.removeEventListener(eventName, _eventListener[element][eventName]);
	}
	let listener = function(e){
		e.preventDefault();
		try{
			fun(e, element);
		}catch(err){
			console.error(err.stack);
		}
	}
	_eventListener[element][eventName] = listener;
	element.addEventListener(eventName, listener, true);
}

function bind_events(DOMelement, listeners){
	let elements = DOMelement.querySelectorAll('[bind-event="bind-event"]');
	let bindAttrRegex = /bind-event-([\w]+)/;
	for(let i=0;i<elements.length;i++){
		let element = elements[i];
		for(let j=0;j<element.attributes.length; j++){
			let attr = element.attributes[j];
			let eventName = bindAttrRegex.exec(attr.name.toString());
			if(eventName){
				bind_event(element, eventName[1], listeners[attr.value]);
			}
		}
	}
}

module.exports.bindEvents = bind_events;
