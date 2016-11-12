'use strict';

module.exports = function TestComponent(app, component){

	component.setRelativeComponentsPath('..');
	component.addRenderLocals('uniqueID', component.uniqueID);

}
