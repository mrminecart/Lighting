const electron = require('electron')
const BrowserWindow = electron.BrowserWindow

const debug = require('debug')("li:wm");
const path = require('path')

var WindowManager = function(){
    debug("Window manager loaded")

    this.mainWindow
    this.indexUrl = "file://" + path.dirname(__dirname) + "/../res/html/index.html";
}

WindowManager.prototype.createWindow = function(){

  debug("Creating window...")

  // Create the browser window.
  this.mainWindow = new BrowserWindow({width: 1280, height: 800})

  // and load the index.html of the app.
  this.mainWindow.loadURL(this.indexUrl)

  this.mainWindow.on('closed', function () {
    process.exit(0)
  })

  this.mainWindow.setMenu(null);

  // this.mainWindow.webContents.openDevTools()
}

module.exports = WindowManager;