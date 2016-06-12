const debug = require('debug')("li:main");
const electron = require('electron')
const app = electron.app

const WindowManager = require('./bin/ui/window_manager.js');
const DmxManager = require('./bin/dmx/dmx_manager.js');

var init = function(){

  debug("Starting...");

  this.dmx = new DmxManager();
  this.wm = new WindowManager();

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
