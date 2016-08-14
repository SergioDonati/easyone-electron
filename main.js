'usse strict';

require('./mainprocess/ipcHandlers')();

module.exports = {
	Component: require('.renderprocess/Component'),
	app: require('./renderprocess/App'),
	Controller: require('./renderprocess/Controller'),
	Modal: require('./renderprocess/Modal')
}
