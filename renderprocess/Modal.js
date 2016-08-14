'use strict';

const Component = require('./Component/index');

module.exports = class Modal extends Component{

	get result(){
		return this._modal_result;
	}

	get isClosed(){
		return this._closed === true;
	}

	close(){
		if(this.isClosed) return;
		this._closed = true;
		this._eventEmitter.emit('close_modal');
	}

	render(){
		if(this._closed===true) return;
		super.render.apply(this, arguments);
	}
}
