const debug = require('debug')("li:client:program");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');

var Program = function() {
	this.init();
}

Program.prototype.init = function() {
	debug("Starting programming interface...");

	this.renderer = new ProgramRenderer($("#program-main-editor"), function(err){
		if(err){
			debug(err);
		}
	});

	debug("Ready to program!");
}

$(function() {
	new Program();
});