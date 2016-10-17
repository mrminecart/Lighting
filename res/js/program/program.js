const debug = require('debug')("li:client:program");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');
const pleasejs = require("pleasejs");

var Program = function() {

	this.options = this.buildOptions({
		bpm: 128,
		bars: 4,
	});

	this.timing = {
		timeOffset: new Date().getTime(),
		lastTick: new Date().getTime()
	};

	this.timelines = [{
		id: "gdsgdf",
		fixtures: ["b522f2cc-8855-4ad1-aeb9-a04dc7604682"],
		channel_type: "move_pan",
		patterns: [],
	}, {
		id: "fdsgsdf",
		fixtures: ["b522f2cc-8855-4ad1-aeb9-a04dc7604682"],
		channel_type: "move_pan",
		patterns: [{
			id: "fa3445ae-se34-531a-sdfe-345hfghfghys",
			location: 8,
			colour: pleasejs.make_color()[0],
			pattern: {
				length: 16,
				nodes: [{
					x: 0,
					y: 0
				}, {
					x: 50,
					y: 200
				}, {
					x: 100,
					y: 0
				}]
			}
		}]
	}, {
		id: "wertwert",
		fixtures: ["b522f2cc-8855-4ad1-aeb9-a04dc7604682"],
		channel_type: "move_pan",
		patterns: []
	}, {
		id: "xcvbxcvb",
		fixtures: ["b522f2cc-8855-4ad1-aeb9-a04dc7604682"],
		channel_type: "move_pan",
		patterns: []
	}, {
		id: "hjkghjk",
		fixtures: ["b522f2cc-8855-4ad1-aeb9-a04dc7604682"],
		channel_type: "move_pan",
		patterns: []
	}];

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

Program.prototype.buildOptions = function(options) {

	var obj = {
		running: true,
		bpm: 120,
		bars: 4,
		leftSideWidth: 300,
		rightSideWidth: 200
	}

	for (var attrname in options) {
		obj[attrname] = options[attrname];
	}

	return obj;
}

Program.prototype.buildRenderer = function() {

	$("#program-main-editor").css("min-height", (window.innerHeight - 63) + "px").css("max-height", (window.innerHeight - 63) + "px");

	this.renderer = new ProgramRenderer(this, $("#program-main-editor"), function(err) {
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
			case 36:
				this.gotoStart();
				break;
			default:
				debug(event.keyCode)
		}
	}.bind(this));
}

Program.prototype.togglePause = function() {
	debug("Toggling pause")
	this.options.running = !this.options.running;
}

Program.prototype.gotoStart = function(){
	debug("Going to start of timeline")
	this.timing.timeOffset = new Date().getTime();
}

Program.prototype.run = function() {
	this.tick();
}

Program.prototype.tick = function() {
	this.calcTime();

	var channelValues = this.getChannelValues();

	if(channelValues.length > 0){
		debug(channelValues);
	}

	setTimeout(this.tick.bind(this), 1000 / 60)
}

Program.prototype.calcTime = function() {
	var now = new Date().getTime();
	this.timing.deltaTime = now - this.timing.lastTick;
	this.timing.lastTick = now; 

	if (this.options.running) {
		this.time = new Date().getTime() - this.timing.timeOffset;
	} else {
		this.timing.timeOffset += this.timing.deltaTime;
	}

	// debug(this.time);
}

Program.prototype.getTimelineValue = function(timeline_id, cursorPosition) {
	for (var i = this.timelines.length - 1; i >= 0; i--) {
		if(this.timelines[i].id !== timeline_id) continue;

		/**
		 * For all patterns for this timeline
		 */
		for (var k = this.timelines[i].patterns.length - 1; k >= 0; k--) {

			/**
			 * have we gone past the start of this pattern?
			 */
			if(cursorPosition - this.timelines[i].patterns[k].location < 0) continue;

			/**
			 * have we gone past it?
			 */
			if(cursorPosition - this.timelines[i].patterns[k].location - this.timelines[i].patterns[k].pattern.length > 0) continue;

			/**
			 * if we are here, the pattern is currently active
			 */
			
			debug("yay!");

		}
	}
}

Program.prototype.getChannelValues = function() {

	var cursorPosition = this.getCursorTimelinePosition();

	var deltas = [];

	for (var i = this.timelines.length - 1; i >= 0; i--) {
		
		var delta = this.getTimelineValue(this.timelines[i].id, cursorPosition);

		if(delta instanceof Array && delta.length > 0) deltas.push(delta);
	}

	return deltas;
}

Program.prototype.getCursorTimelinePosition = function(){
	var cursorMoveTime = this.options.bars * 60 / this.options.bpm * 4
	var percent = ((this.time / 1000) % cursorMoveTime) * (100 / cursorMoveTime);
	return (this.options.bars * 4 * 2) * (percent / 100)
}

Program.prototype.addNewTimelineLane = function() {

	this.timelines.push({
		fixtures: [],
		channel_type: null,
		patterns: [],
		active: true
	})

	this.renderer.drawLayout(true, false);
}

$(function() {
	new Program();
});