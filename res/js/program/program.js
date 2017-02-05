const debug = require('debug')("li:client:program");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');
const pleasejs = require("pleasejs");
const uuid = require('uuid');

var Program = function() {

	this.options = this.buildOptions({
		bpm: 180,
		bars: 8,
	});

	this.timing = {
		timeOffset: new Date().getTime(),
		lastTick: new Date().getTime()
	};

	this.timelines = [{
		id: uuid.v4(),
		fixtures: ["51793a8f-5969-4e92-ac85-fd7c66e1142b"],
		name: "MH Pan",
		channel_type: "move_pan",
		patterns: [{
			id: uuid.v4(),
			location: 0,
			colour: pleasejs.make_color()[0],
			pattern: {
				length: 64,
				nodes: [{
					x: 0,
					y: 0
				}, {
					x: 50,
					y: 100
				}, {
					x: 100,
					y: 0
				}]
			}
		}]
	}, {
		id: uuid.v4(),
		fixtures: ["51793a8f-5969-4e92-ac85-fd7c66e1142b"],
		name: "MH Tilt",
		channel_type: "move_tilt",
		patterns: [{
			id: uuid.v4(),
			location: 0,
			colour: "#ff00ff",
			pattern: {
				length: 32,
				nodes: [{
					x: 0,
					y: 100
				}, {
					x: 50,
					y: 0
				}, {
					x: 100,
					y: 100
				}]
			}
		}, {
			id: "dfg-34tfgsghfg-345efrh-yrhfg",
			location: 32,
			colour: "#ff00ff",
			pattern: {
				length: 32,
				nodes: [{
					x: 0,
					y: 100
				}, {
					x: 50,
					y: 0
				}, {
					x: 100,
					y: 100
				}]
			}
		}]
	}];

	this.init();
}

Program.prototype.init = function() {
	debug("Starting programming interface...");

	this.buildRenderer();
	this.handleResize();
	this.bindKeyPresses();
	this.bindButtonEvents();

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
			case 32: // Space
				this.togglePause();
				break;
			case 36: // Home
				this.gotoStart();
				break;
			case 84: // T
				if (event.ctrlKey) this.addNewTimelineLane();
				break;
			default:
				debug(event.keyCode)
		}
	}.bind(this));
}

Program.prototype.bindButtonEvents = function() {
	this.eventHandler = new ProgramEventHandler(this, function(err) {
		if (err) {
			debug(err);
		}
	});
}

Program.prototype.togglePause = function() {
	debug("Toggling pause")
	this.options.running = !this.options.running;
}

Program.prototype.gotoStart = function() {
	debug("Going to start of timeline")
	this.timing.timeOffset = new Date().getTime();
	this.calcTime(true)
}

Program.prototype.run = function() {
	this.tick();
}

Program.prototype.tick = function() {
	this.calcTime();

	app.dmx.writeFixtureState(this.getFixtureDelta(this.getAllTimelineValues()));

	setTimeout(this.tick.bind(this), 1000 / 60)
}

Program.prototype.getFixtureDelta = function(timelineValues) {
	var fixtureData = {};

	var keys = Object.keys(timelineValues)

	for (var i = keys.length - 1; i >= 0; i--) {

		var fixtures = [];
		var channel_type = "";

		for (var k = 0; k < this.timelines.length; k++) {
			if (this.timelines[k].id == keys[i]) {
				fixtures = this.timelines[k].fixtures;
				channel_type = this.timelines[k].channel_type;
			}
		}

		for (var j = 0; j < fixtures.length; j++) {
			if (!fixtureData[fixtures[j]]) {
				fixtureData[fixtures[j]] = {};
			}

			fixtureData[fixtures[j]][channel_type] = timelineValues[keys[i]];

		}
	}

	return fixtureData;
}

Program.prototype.calcTime = function(force) {
	var now = new Date().getTime();
	this.timing.deltaTime = now - this.timing.lastTick;
	this.timing.lastTick = now;

	if (this.options.running || force) {
		this.time = new Date().getTime() - this.timing.timeOffset;
	} else {
		this.timing.timeOffset += this.timing.deltaTime;
	}

	// debug(this.time);
}

Program.prototype.getTimelineValue = function(timeline_id, cursorPosition) {
	for (var i = this.timelines.length - 1; i >= 0; i--) {
		if (this.timelines[i].id !== timeline_id) continue;

		/**
		 * For all patterns for this timeline
		 */
		for (var k = this.timelines[i].patterns.length - 1; k >= 0; k--) {

			/**
			 * have we gone past the start of this pattern?
			 */
			if (cursorPosition.pos - this.timelines[i].patterns[k].location < 0) continue;

			/**
			 * have we gone past it?
			 */
			if (cursorPosition.pos - this.timelines[i].patterns[k].location - this.timelines[i].patterns[k].pattern.length > 0) continue;

			/**
			 * if we are here, the pattern is currently active
			 */

			var percentThrough = ((cursorPosition.pos - this.timelines[i].patterns[k].location) / this.timelines[i].patterns[k].pattern.length) * 100;

			// debug(percentThrough);

			//Make sure nodes is in order, could be a little exspensive though? :/
			var nodes = this.timelines[i].patterns[k].pattern.nodes.sort(function(a, b) {
				return a.x - b.x;
			})

			for (var j = 0; j < nodes.length - 1; j++) {
				/**
				 * Check if we are between these points, skip if not
				 */
				if (!(percentThrough >= nodes[j].x && percentThrough < nodes[j + 1].x)) continue;

				var percThroughNode = ((percentThrough - nodes[j].x) / (nodes[j + 1].x - nodes[j].x))

				var value = nodes[j].y + ((nodes[j + 1].y - nodes[j].y) * percThroughNode)

				return value;
			}

		}
	}
}

Program.prototype.getAllTimelineValues = function() {

	var cursorPosition = this.getCursorTimelinePosition();

	var deltas = {};

	for (var i = this.timelines.length - 1; i >= 0; i--) {

		var delta = this.getTimelineValue(this.timelines[i].id, cursorPosition);

		if (typeof delta == "number") {
			// debug("Adding")
			deltas[this.timelines[i].id] = delta;
		}
	}

	return deltas;
}

Program.prototype.getCursorTimelinePosition = function() {
	var cursorMoveTime = this.options.bars * 60 / this.options.bpm * 4
	var percent = ((this.time / 1000) % cursorMoveTime) * (100 / cursorMoveTime);
	return {
		percent: percent,
		pos: (this.options.bars * 4 * 2) * (percent / 100)
	};
}

Program.prototype.addNewTimelineLane = function() {

	this.timelines.push({
		id: uuid.v4(),
		fixtures: [],
		name: "New Timeline",
		channel_type: null,
		patterns: [],
		active: true
	})

	this.renderer.drawLayout(true, false);
}

$(function() {
	new Program();
});