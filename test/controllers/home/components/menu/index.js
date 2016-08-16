'use strict';

const {Component} = require('../../../../../main.js');

module.exports = class Menu extends Component{

    get viewPath(){ return __dirname+'\\view.pug'; }
    get componentsPath(){ return __dirname+'\\..'; }

}
