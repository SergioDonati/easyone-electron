'use strict';

const {Controller, app} = require('../../../main.js');

module.exports = class Home extends Controller{

    get viewPath(){ return __dirname+'\\view.pug'; }
    get componentsPath(){ return __dirname+'\\components'; }

    init(){
        let self = this;
        self.addChildDOMListener('main-menu', 'menuTestClick', function(){
            self._childrenManager.clear('#content');
            self.addChild("test", "#content", "test");
        });

        self.addChildDOMListener('main-menu', 'testModal', function(){
            app.modalManager.startNew("msg").catch(function(e){
                console.error(e.stack);
            });
        });
    }

}
