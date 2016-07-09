const debug = require('debug')("li:settings:fixture_manager");
const electron = require('electron');
const app = electron.app;
const uuid = require('uuid');

var FixtureManager = function(parent, app) {

  this.parent = parent;
  this.app = app;

  this.init();
}

FixtureManager.prototype.init = function() {

  debug("Loading fixture manager...");

  debug("Fixture Manager Loaded!")

}

FixtureManager.prototype.getFixture = function(fid) {

  var fix = null;

  for (var i = 0; i < this.parent.settings.fixtures.length; i++) {
    if (fid == this.parent.settings.fixtures[i].id) {
      var fix = this.parent.settings.fixtures[i];
      break;
    }
  }

  if(!fix){
    return fix;
  }

  return fix
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

FixtureManager.prototype.saveFixtureGrid = function(grid) {
  for (var i = 0; i < this.parent.settings.fixtures.length; i++) {
    for (var k = 0; k < grid.length; k++) {
      if (grid[k].id == this.parent.settings.fixtures[i].id) {

        debug("Updating " + this.parent.settings.fixtures[i].data.name)

        this.parent.settings.fixtures[i].x = grid[k].x;
        this.parent.settings.fixtures[i].y = grid[k].y;
        this.parent.settings.fixtures[i].width = grid[k].width;
        this.parent.settings.fixtures[i].height = grid[k].height;
      }
    }
  }

  this.parent.settings.saveFixtures();
}

module.exports = FixtureManager;