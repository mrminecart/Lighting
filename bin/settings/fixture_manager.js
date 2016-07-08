const debug = require('debug')("li:settings:fixture_manager");
const electron = require('electron');
const app = electron.app;
const uuid = require('uuid');

var FixtureManager = function(parent, app){

  this.parent = parent;
  this.app = app;

  this.init();
}

FixtureManager.prototype.init = function() {

  debug("Loading fixture manager...");

  debug("Fixture Manager Loaded!")

}

FixtureManager.prototype.addFixture = function(options) {
  debug("Adding Fixture...", options)

  if (options.channel == 0) {
    return [1, "Channel can not be 0!"];
  }

  if (options.name == 0) {
    return [1, "Name can not be empty!"];
  }

  if (options.type == "none_none") {
    return [1, "Type can not be empty!"];
  }

  var fixture = {
    id: uuid.v4(),
    x: 0,
    y: Number.MAX_VALUE,
    width: 1,
    height: 1,
    data: {
      name: options.name,
      type: options.type,
      channel: options.channel
    }
  };

  this.parent.settings.fixtures.push(fixture);
  this.parent.settings.saveFixtures();

  return [0, "New fixture added!"];
}

module.exports = FixtureManager;