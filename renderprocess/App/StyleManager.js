'use strict';

const utils = require('../utils');

module.exports = class StyleManager{
    constructor(app){
        this._app = app;
        this._appOptions = app._options;
    }

    get _defaultOptions(){
        return {
            compress: true,
            logLevel: 2
        };
    }

    removeStyle(id){
        let style = document.getElementById(id);
        if (style) style.parentNode.removeChild(style);
    }

    injectStyle(id, css){
        let style = document.createElement('style');
    	style.type = 'text/css';
    	style.innerHTML = css;
    	style.setAttribute('id', id);
    	document.getElementsByTagName('head')[0].appendChild(style);
    }

    injectStyleFile(id, filePath, wrapWith){
        let manager = this;
        utils.renderLessFile(filePath, wrapWith, this._defaultOptions, function(err, css){
            if(err) return;
            manager.injectStyle(id, css);
        });
    }
}
