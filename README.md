# easyone-electron

A framework for develop your electron application.

Help you to focus on contents.

## How Work

In example folder you can see a simple example application.

Applications are structured by many **components**. Each *component* define how render to view, the style, handle events and much more.

The main *components* that define the current window are called **controllers**. *Controllers* are *components* but their take care of all the view of application. You can see *controllers* like pages of a site.

- ### MainProcess
	In **MainProcess** simple do:

	```javascript
	const easyone = require('easyone-electron');
	// Initialize
	easyone([options]);
	```

	This add some listener on ipcMain of electron.
	#### `options` (optional)
	- `less`
		- `basedir`
			path of the directory to lookup for includes

			by default when compiling less file also the current file directory is watched
	- `pug`
		- `basedir`
			path of the directory to lookup for includes
- ### RenderProcess

	#### Application Start

	In **RenderProcess** firstly you have to create an `app`:
	```javascript
	const {App} = require('easyone-electron');
	const app = new App([options, readyCallback]);
	```
	#### `options` (optional)
	- `controllersPath`
		path of the directory to lookup for controllers

		if setted controllers can be loaded by name
	- `modalsPath`
		path of the directory to lookup for modals

		if setted modals can be loaded by name
	- `componentsPath`
		path of the directory to lookup for shared application components

		if setted, when a component is required, this directory is watched as last chance to find the component

	- `container_id` id of the HTMLelement where render the controllers, by default is document.body

	You can pass a `readyCallback` or register for `ready` event.
	```javascript
	app.on('ready', function(app){

		// Your iniziarization logic here

		app.start('dashboard')
	});
	```
	After you had inizialize what you need, call `app.start(nameOfController)`.
	A file named 'dashboard' is searched and loaded.

	The file must export a function
	```javascript
	/**
	 * @param  App app					- the app that you created
	 * @param  Controller controller	- the controller created for this call
	 * @param  spreaded args			- optional arguments passed when request a new controller
	 */
	module.exports = function(app, controller, ...args){
		// here you have access to the controller and initialize it

		// by default a file called 'view.pug' is loaded and compiled when this component will be rendered
		// also a file called 'style.less' is loaded into the page as css
		// you can change the default paths, for example
		controller.setRelativeViewPath('myView.pug');
		// setRelativeViewPath search the file in the directory of this file
		// you can also specify a full path
		controller.setViewPath(__dirname+'/myView.pug');

		// for inject values to pug file
		controller.addRenderLocals('mykey', myvalue);

		// there are multiple way to add component children into the view
		// one way is add a child here by name
		controller.addChild(component_id, container_selector, name_of_component);
		// a component called name_of_component is searched in componentsPath and in sharedComponentsFolder
		// the component is rendered inside the container identified by container_selector

		// you can register event handler. Attention! the event must be registered also in the view, see below how
		controller.addDOMListener(your_event_name, function(){
	        // handle your event
	    });
		// if you whant handle here a event of a child, use the follow method
		controller.addChildDOMListener(component_id, your_event_name, function(){
	        // handle your event
	    });
	}
	```

	```pug
	// view.pug

	h1 #{title}

	// this register the event and now can be handled by component
	a(href='#', bind-event=true, bind-event-click=your_event_name) myButton

	```
	```less
	/* style.less */
	/* all style of a component is enclosed in a selector that identify your componet instance */
	background: #000;
	color: #fff;
	a {
		color: blue;
	}
	```

## Package dependencies
- pug - [github](https://github.com/pugjs/pug)

- less - [github](https://github.com/less/less.js)
