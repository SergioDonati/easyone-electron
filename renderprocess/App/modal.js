'use strict';

const utils = require('../utils');

function createElement(name, id, className){
	let element = document.createElement(name);
	if (id) element.setAttribute('id', id);
	if (className) element.className = className;
	return element;
}

function createModalElement(args){
	let container = createElement('div', 'modal-container', 'modal-open');
	let box = createElement('div', null, 'modal-box');
	let content = createElement('div', null, 'modal-content');

	if(args.closeListener){
		let closeBtn = createElement('span', null, 'modal-close-btn');
		closeBtn.addEventListener('click', args.closeListener, true);
		box.appendChild(closeBtn);
	}
	box.appendChild(content);
	container.appendChild(createElement('div', null, 'modal-shadow'));
	container.appendChild(box);
	container.injectModal = function(element){
		content.innerHTML = '';
		content.appendChild(element);
	}
	return container;
}

let activeModal = null;

let defaultCloseBtnListener = function(e){
	e.preventDefault();
	if (activeModal) activeModal.close();
}

module.exports = function(app){

	let extend = {};

	extend.startNew = utils.createAsyncFun(function(modal, eventEmitter){
		if(typeof(modal) === 'string' && app._options.modalsPath){
			try{
				modal = require(app._options.modalsPath + '/' + modal);
				modal = new modal();
			}catch(e){
				eventEmitter.emit('error', e);
				return;
			}
		}
		if(!modal){
			eventEmitter.emit('error', new Error('Invalid modal!'));
			return;
		}
		if(activeModal) {
			eventEmitter.emit('error', new Error('One modal just active!'));
			return;
		}
		let modalContainerElement = createModalElement({ closeListener: defaultCloseBtnListener });
		modal.on('close_modal', function(){
			modalContainerElement.parentNode.removeChild(modalContainerElement);
			activeModal = null;
		});
		modal.render(modal.renderArgs, (err, htmlElement) => {
			if(!htmlElement) {
				eventEmitter.emit('error', new Error('Invalid modal! no htmlElement returned'));
				return;
			}
			activeModal = modal;
			modalContainerElement.injectModal(htmlElement);
			document.body.appendChild(modalContainerElement);
			eventEmitter.emit('success', modal);
		});
	}

	return extend;
}
