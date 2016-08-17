'use strict';

const {app, BrowserWindow} = require('electron');

require('../main.js')({ stylePath: __dirname+'\\style' });

let mainWindow = null;

function createWindow(){
    mainWindow = new BrowserWindow({center:true, width:900, height:500 });

    mainWindow.loadURL('file://'+__dirname+'/index.html');

    mainWindow.setMenu(null);
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function(){
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function(){
    if(process.platform !== 'darwin'){
        app.quit();
    }
});

app.on('activate', function(){
    if(mainWindow == null) createWindow();
});
