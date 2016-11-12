'use strict';

const utils = require('../utils');
const path = require('path');

function createModalElement(args){
	const container = utils.createElement('div', 'modal-container', 'modal-open');
	const box = utils.createElement('div', null, 'modal-box');
	const content = utils.createElement('div', null, 'modal-holder');

	if(args.closeListener){
		const closeBtn = utils.createElement('span', null, 'modal-close-btn');
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

module.exports = class ModalsManager{
	constructor(app){
		this._app = app;
		this._appOptions = app._options;
		this._activeModal = null;
		this.defaultCloseBtnListener = function(e){
			e.preventDefault();
			if (this._activeModal) this._activeModal.close();
		}
	}

	new(modalPath, ...args){
		const Modal = require('../Modal');
		const directoryPath = path.join(this._appOptions.modalsPath, '/', modalPath);
		const initializer = require(directoryPath);
		const modal = new Modal(this._app, initializer.name, directoryPath);
		initializer(this._app, modal, ...args);
		return modal;
	}

	startNew(modal, ...args){
		const manager = this;
		return new Promise(function(resolve, reject){
			if(typeof(modal) === 'string'){
				try{
					modal = manager.new(modal, ...args);
				}catch(e){
					reject(e);
					return;
				}
			}
			if(!modal){
				reject(new Error('Invalid modal!'));
				return;
			}
			if(manager._activeModal) {
				reject(new Error('One modal just active!'));
				return;
			}
			const modalContainerElement = createModalElement({ closeListener: manager.defaultCloseBtnListener.bind(manager) });
			modal.once('modalClosed', function(){
				modalContainerElement.parentNode.removeChild(modalContainerElement);
				manager._activeModal = null;
			});
			modal.render(modal.renderArgs, (err, htmlElement) => {
				if(!htmlElement) {
					reject(new Error('Invalid modal! no htmlElement returned'));
					return;
				}
				manager._activeModal = modal;
				modalContainerElement.injectModal(htmlElement);
				document.body.appendChild(modalContainerElement);
				resolve(modal);
			});
		});
	}
}
