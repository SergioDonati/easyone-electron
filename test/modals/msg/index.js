'use strict';

const {Modal} = require('../../../main.js');

module.exports = class MSG extends Modal{

    get viewPath(){ return __dirname+'\\view.pug'; }

}
