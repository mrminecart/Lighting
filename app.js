const debug = require('debug')("li:main");
const electron = require('electron')
const app = electron.app

const SettingsManager = require('./bin/settings/settings_manager.js');
const FixtureManager = require('./bin/settings/fixture_manager.js');
const WindowManager = require('./bin/ui/window_manager.js');
const DmxManager = require('./bin/dmx/dmx_manager.js');

const App = function(){
	this.init();
}

App.prototype.init = function(){

  debug("Starting...");

  this.settings = new SettingsManager(this, app);
  this.fixture_manager = new FixtureManager(this, app);
  this.dmx = new DmxManager(this, app);
  this.wm = new WindowManager();

  this.wm.createWindow();
}

App.prototype.stop = function(){
	this.dmx.stop();
}

app.on('ready', function(){
	global.app_main = new App();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {

	debug("Quitting!");

	global.app_main.stop.call(global.app_main);

	app.quit();
}.bind(this))

