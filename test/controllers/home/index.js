'use strict';

const {Controller} = require('../../../main.js');

module.exports = class Home extends Controller{

    get viewPath(){ return __dirname+'\\view.pug'; }
    get componentsPath(){ return __dirname+'\\components'; }

    init(){
        let self = this;
        self.addChildDOMListener('main-menu', 'menuTestClick', function(){
            self._childrenManager.clear('#content');
            self.addChild("test", "#content", "test");
        });
    }

}
