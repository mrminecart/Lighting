const debug = require('debug')("li:settings:settings_manager");
const path = require('path');
const fs = require('fs');
const electron = require('electron');
const app = electron.app;

var SettingsManager = function(){

  this.settings = {};
  this.lights = [];

  this.init();
}

SettingsManager.prototype.init = function(){

  debug("Loading settings...")

  var home_folder = app.getPath("home");
  this.conf_folder = path.join(home_folder, ".lighting");
  this.settingsFileLocation = path.join(this.conf_folder, "settings.json")
  this.lightsFileLocation = path.join(this.conf_folder, "lights.json")

  debug("Using " + home_folder + " as home folder");

  this.makeHomeFolder();

  this.loadSettings();
  this.loadLights();

}

SettingsManager.prototype.makeHomeFolder = function(){
  debug("Checking home folder..");

  if (!fs.existsSync(this.conf_folder)){
    fs.mkdirSync(this.conf_folder);
    debug("Made conf folder")
  }

  debug("Home folder available!");
}

SettingsManager.prototype.loadSettings = function(){

  debug("Loading settings...");

  var text = "{}"; 

  try{
    text = fs.readFileSync(this.settingsFileLocation,'utf8')
  } catch(e){}

  var data = null;

  try{
    data = JSON.parse(text);
  }catch(e){
    debug("Got invalid JSON for settings! Ignoring...")
    data = {};
  }

  this.settings = data;

  debug("Settings loaded!");

  this.saveSettings();

}

SettingsManager.prototype.saveSettings = function(){

  debug("Saving settings...");

  var text = JSON.stringify(this.settings, null, 4);

  fs.writeFileSync(this.settingsFileLocation, text, 'utf8');

  debug("Settings saved!");
}

SettingsManager.prototype.loadLights = function(){
  debug("Loading lights...");

  var text = "{}"; 

  try{
    text = fs.readFileSync(this.lightsFileLocation,'utf8')
  } catch(e){}

  var data = null;

  try{
    data = JSON.parse(text);
  }catch(e){
    debug("Got invalid JSON for lights! Ignoring...")
    data = {};
  }

  this.lights = data;

  debug("Lights loaded!");

  this.saveLights();
}

SettingsManager.prototype.saveLights = function(){

  debug("Saving lights...");

  var text = JSON.stringify(this.lights, null, 4);

  fs.writeFileSync(this.lightsFileLocation, text, 'utf8');

  debug("Lights saved!");
}

module.exports = SettingsManager;