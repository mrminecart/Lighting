const electron = require('electron')
const app = electron.app

const debug = require('debug')("li:main");

const WindowManager = require('./bin/window_manager.js');

var init = function(){

  debug("Starting")

  this.wm = new WindowManager();

  this.wm.createWindow();
  this.wm.createWindow();
}

app.on('ready', init)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit();
})

app.on('activate', function () {
  init();
})
