const debug = require('debug')("li:settings:fixture_manager");
const electron = require('electron');
const app = electron.app;

var FixtureManager = function(){
  this.init();
}

FixtureManager.prototype.init = function(){

  debug("Loading fixture manager...");

  debug("Fixture Manager Loaded!")

}

FixtureManager.prototype.addFixture = function(options){
  debug("Adding Fixture")
}

module.exports = FixtureManager;