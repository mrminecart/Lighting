const debug = require('debug')("li:client:program");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');

var Program = function() {
	this.init();
}

Program.prototype.init = function() {
	debug("Starting programming interface...");

	this.buildRenderer();
	this.handleResize();
	this.bindKeyPresses();

	debug("Ready to program!");

}

Program.prototype.buildRenderer = function() {

	$("#program-main-editor").css("min-height", (window.innerHeight - 63) + "px").css("max-height", (window.innerHeight - 63) + "px");

	this.renderer = new ProgramRenderer($("#program-main-editor"), {
		bpm: 100,
		bars: 8,
	}, function(err) {
		if (err) {
			debug(err);
		}
	});
}

Program.prototype.handleResize = function() {
	$(window).on("resize", function() {
		$("#program-main-editor").css("min-height", (window.innerHeight - 63) + "px");
	}.bind(this))
}

Program.prototype.bindKeyPresses = function() {
	window.addEventListener('keydown', function(event) {
		switch (event.keyCode) {
			//Space
			case 32:
				this.togglePause();
				break;
		}
	}.bind(this));
}

Program.prototype.togglePause = function() {
	this.renderer.options.running = !this.renderer.options.running;
	// this.renderer.timeOffset = new Date();
}

$(function() {
	new Program();
});