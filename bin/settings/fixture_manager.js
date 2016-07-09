const debug = require('debug')("li:settings:fixture_manager");
const electron = require('electron');
const app = electron.app;
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

var FixtureManager = function(parent, app) {

  this.parent = parent;
  this.app = app;

  var home_folder = this.app.getPath("home");
  this.conf_folder = path.join(home_folder, ".lighting");
  this.fixturesFileLocation = path.join(this.conf_folder, "fixtures.json")
  this.fixtureTypesFileLocation = path.join(this.conf_folder, "fixture_types.json")

  this.fixtures = [];
  this.fixture_types = {};

  this.init();
}

FixtureManager.prototype.init = function() {

  debug("Loading fixture manager...");

  this.loadFixtureTypes();
  this.loadFixtures();

  debug("Fixture Manager Loaded!")

}

FixtureManager.prototype.getTypesGroupByManufacturer = function(tid){
  var grouped = {};

  var keys = Object.keys(this.fixture_types);

  for (var i = 0; i < keys.length; i++) {

    debug(this.fixture_types[keys[i]].manufacturer)

    if(!(this.fixture_types[keys[i]].manufacturer in grouped)){
      grouped[this.fixture_types[keys[i]].manufacturer] = [];
    }

    var fixture = this.fixture_types[keys[i]];

    fixture.type = keys[i];

    grouped[this.fixture_types[keys[i]].manufacturer].push(fixture)
  }

  return grouped;

}

FixtureManager.prototype.getFixture = function(fid) {

  var fix = null;

  for (var i = 0; i < this.fixtures.length; i++) {
    if (fid == this.fixtures[i].id) {
      var fix = this.fixtures[i];
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

  this.fixtures.push(fixture);
  this.saveFixtures();

  return [0, "New fixture added!"];
}

FixtureManager.prototype.saveFixtureGrid = function(grid) {
  for (var i = 0; i < this.fixtures.length; i++) {
    for (var k = 0; k < grid.length; k++) {
      if (grid[k].id == this.fixtures[i].id) {

        debug("Updating " + this.fixtures[i].data.name)

        this.fixtures[i].x = grid[k].x;
        this.fixtures[i].y = grid[k].y;
        this.fixtures[i].width = grid[k].width;
        this.fixtures[i].height = grid[k].height;
      }
    }
  }

  this.saveFixtures();
}


FixtureManager.prototype.loadFixtures = function(){
  debug("Loading fixtures...");

  var text = "[]"; 

  try{
    text = fs.readFileSync(this.fixturesFileLocation,'utf8')
  } catch(e){}

  var data = null;

  try{
    data = JSON.parse(text);
  }catch(e){
    debug("Got invalid JSON for fixtures! Ignoring...")
    data = {};
  }

  this.fixtures = data;

  debug("Fixtures loaded! Found " + this.fixtures.length);

  this.saveFixtures();
}

FixtureManager.prototype.saveFixtures = function(){

  debug("Saving fixtures...");

  var text = JSON.stringify(this.fixtures, null, 4);

  fs.writeFileSync(this.fixturesFileLocation, text, 'utf8');

  debug("Fixtures saved!");
}

FixtureManager.prototype.loadFixtureTypes = function(){
  debug("Loading fixture types...");

  var text = null; 

  try{
    text = fs.readFileSync(this.fixtureTypesFileLocation,'utf8')
  } catch(e){}

  var data = null;

  try{

    data = JSON.parse(text);

    if(!data) { 
      throw new Error("No types found!");
    }

  }catch(e){

    debug("Got invalid/no JSON for fixture types! Ignoring...")
    data = require("./defaults/fixture_types.json");

  }

  this.fixture_types = data;

  debug("Fixture types loaded! Found " + Object.keys(this.fixture_types).length);

  this.saveFixtureTypes();
}

FixtureManager.prototype.saveFixtureTypes = function(){

  debug("Saving fixture types...");

  var text = JSON.stringify(this.fixture_types, null, 4);

  fs.writeFileSync(this.fixtureTypesFileLocation, text, 'utf8');

  debug("Fixture types saved!");
}

module.exports = FixtureManager;