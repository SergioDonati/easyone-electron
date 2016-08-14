'use strict';

const Modal = require('../Modal');

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

	extend.startNew = function(modal){
		if(typeof(modal) === 'string' && app._options.modalsPath){
			try{
				modal = require(app._options.modalsPath + '/' + modal);
				modal = new modal();
			}catch(e){
				console.error(e.stack);
				return;
			}
		}
		if(!modal || !modal instanceof Modal){
			console.error('Invalid modal!');
			return;
		}
		if(activeModal) return;

		let modalContainerElement = createModalElement({ closeListener: defaultCloseBtnListener });
		modal.on('close_modal', function(){
			modalContainerElement.parentNode.removeChild(modalContainerElement);
			activeModal = null;
		});
		process.nextTick(function(){
			modal.render(modal.renderArgs, (err, htmlElement) => {
				if(!htmlElement) return;
				activeModal = modal;
				modalContainerElement.injectModal(htmlElement);
			});
		});
		return modal;
	}

	return extend;
}
