'use strict';

const utils = require('../utils');

function createModalElement(args){
	let container = utils.createElement('div', 'modal-container', 'modal-open');
	let box = utils.createElement('div', null, 'modal-box');
	let content = utils.createElement('div', null, 'modal-content');

	if(args.closeListener){
		let closeBtn = utils.createElement('span', null, 'modal-close-btn');
		closeBtn.addEventListener('click', args.closeListener, true);
		box.appendChild(closeBtn);
	}
	box.appendChild(content);
	container.appendChild(utils.createElement('div', null, 'modal-shadow'));
	container.appendChild(box);
	container.injectModal = function(element){
		content.innerHTML = '';
		content.appendChild(element);
	}
	return container;
}

let defaultCloseBtnListener = function(e){
	e.preventDefault();
	if (activeModal) activeModal.close();
}

module.exports = class ModalsManager{
	constructor(app){
		this._app = app;
		this._appOptions = app._options;
		this._activeModal = null;
	}

	new(modalPath){
		let modal = require(this._appOptions.modalsPath + '/' + modalPath);
		return new modal();
	}

	startNew(modal){
		let manager = this;
		return utils.createAsyncFun(function(eventEmitter, modal){
			if(typeof(modal) === 'string'){
				try{
					modal = manager.new(modal);
				}catch(e){
					eventEmitter.emit('error', e);
					return;
				}
			}
			if(!modal){
				eventEmitter.emit('error', new Error('Invalid modal!'));
				return;
			}
			if(manager._activeModal) {
				eventEmitter.emit('error', new Error('One modal just active!'));
				return;
			}
			let modalContainerElement = createModalElement({ closeListener: defaultCloseBtnListener });
			modal.on('close_modal', function(){
				modalContainerElement.parentNode.removeChild(modalContainerElement);
				manager._activeModal = null;
			});
			modal.render(modal.renderArgs, (err, htmlElement) => {
				if(!htmlElement) {
					eventEmitter.emit('error', new Error('Invalid modal! no htmlElement returned'));
					return;
				}
				manager._activeModal = modal;
				modalContainerElement.injectModal(htmlElement);
				document.body.appendChild(modalContainerElement);
				eventEmitter.emit('success', modal);
			});
		});
	}
}
