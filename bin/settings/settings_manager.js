const debug = require('debug')("li:settings:settings_manager");
const path = require('path');
const fs = require('fs');
var SettingsManager = function(parent, app){

  this.parent = parent;
  this.app = app;

  this.settings = {};

  this.init();
}

SettingsManager.prototype.init = function(){

  debug("Loading settings...")

  var home_folder = this.app.getPath("home");
  this.conf_folder = path.join(home_folder, ".lighting");
  this.settingsFileLocation = path.join(this.conf_folder, "settings.json")

  debug("Using " + home_folder + " as home folder");

  this.makeHomeFolder();

  this.loadSettings();

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

module.exports = SettingsManager;