const debug = require('debug')("li:client:program");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');

var Program = function() {
	this.timing = {
		timeOffset: new Date().getTime(),
		lastTick: new Date().getTime()
	};

	this.init();
}

Program.prototype.init = function() {
	debug("Starting programming interface...");

	this.buildRenderer();
	this.handleResize();
	this.bindKeyPresses();

	this.run();

	debug("Ready to program!");

}

Program.prototype.buildRenderer = function() {

	$("#program-main-editor").css("min-height", (window.innerHeight - 63) + "px").css("max-height", (window.innerHeight - 63) + "px");

	this.renderer = new ProgramRenderer($("#program-main-editor"), {
		bpm: 120,
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

Program.prototype.run = function(){
	this.tick();
}

Program.prototype.tick = function(){
	this.calcTime();

	this.renderer.setTime(this.time);

	setTimeout(this.tick.bind(this), 1000/60)
}

Program.prototype.calcTime = function(){
	var now = new Date().getTime();
	this.timing.deltaTime = now - this.timing.lastTick;
	this.timing.lastTick = now;

	if (this.renderer.options.running) {
		this.time = new Date().getTime() - this.timing.timeOffset;
	}else{
		this.timing.timeOffset += this.timing.deltaTime;
	}
}

$(function() {
	new Program();
});