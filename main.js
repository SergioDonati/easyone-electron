'usse strict';

function isRenderer () {
  // node-integration is disabled
  if (!process) return true

  // We're in node.js somehow
  if (!process.type) return false

  return process.type === 'renderer'
}

if(isRenderer()){
	module.exports = {
		Component: require('./renderprocess/Component'),
		app: require('./renderprocess/App'),
		Controller: require('./renderprocess/Controller'),
		Modal: require('./renderprocess/Modal')
	}
}else{
	module.exports = require('./mainprocess/ipcHandlers');
}
