'use strict';

module.exports = function Home(app, controller){

	controller.useDefaultPaths(__dirname);

	controller.addChildDOMListener('main-menu', 'menuTestClick', function(){
        controller.removeChildIn('#content');
        controller.addChild("test_id", "#content", "test");
    });

    controller.addChildDOMListener('main-menu', 'testModal', function(){
        app.modalManager.startNew("msg").catch(function(e){
            console.error(e.stack);
        });
    });
}
