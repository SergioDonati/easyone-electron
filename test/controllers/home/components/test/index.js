'use strict';

const {Component} = require('../../../../../main.js');

module.exports = class TestComponent extends Component{

    get viewPath(){ return __dirname+'\\view.pug'; }
    get componentsPath(){ return __dirname+'\\..'; }

    init(){
        this.renderArgs.locals.uniqueID = this.uniqueID;
    }

}
