'use strict';

const Component = require('./Component');

module.exports = class Modal extends Component{

	get result(){
		return this._modal_result;
	}

	set result(result){
		this._modal_result = result;
		this._eventEmitter.emit('result', result);
	}

	get isClosed(){
		return this._closed === true;
	}

	close(result){
		if(this.isClosed) return;
		if(result) this.result = result;
		this._closed = true;
		this._eventEmitter.emit('modalClosed', result);
	}

	render(){
		if(this.isClosed) return;
		super.render.apply(this, arguments);
	}
}
