const debug = require('debug')("li:client:program:renderers:timeline:pattern");
const color = require("color");

TimelinePatternRenderer = function(parent) {
	this.parent = parent;
}

TimelinePatternRenderer.prototype.drawPatterns = function(redraw, initial) {

	if (initial) {
		this.outerContainer = new PIXI.Container();
		this.parent.parent.stage.addChild(this.outerContainer);
	}

	var timelineWidth = this.parent.parent.width - this.parent.parent.parent.options.leftSideWidth - this.parent.parent.parent.options.rightSideWidth - this.parent.timelineScrollBarWidth;
	this.barGridStepWidth = timelineWidth / this.parent.parent.parent.options.bars / this.parent.timelineBarGrid;

	for (var i = 0; i < this.parent.parent.parent.timelines.length; i++) {
		for (var k = 0; k < this.parent.parent.parent.timelines[i].patterns.length; k++) {

			this.drawPattern(this.parent.parent.parent.timelines[i].patterns[k], i, k);

		}
	}
}

TimelinePatternRenderer.prototype.drawPattern = function(pattern, timelineIndex, patternIndex) {
	/**
	 * init graphics and events
	 */
	if (!pattern.graphics) {
		this.makeTimelinePatternGraphics(timelineIndex, patternIndex, this.outerContainer);
	}

	/**
	 * Draw box
	 */
	pattern.graphics.clear();

	for (var i = pattern.graphics.children.length - 1; i >= 0; i--) {
		pattern.graphics.removeChild(pattern.graphics.children[i]);
	};

	this.drawPatternBox(pattern, timelineIndex);
	this.drawPatternLines(pattern, timelineIndex);
}

TimelinePatternRenderer.prototype.drawPatternLines = function(pattern, timelineIndex){
	var borderWidth = 2;

	var colour = color(pattern.colour);
	colour.darken(0.1);

	var timelineWidth = this.parent.parent.width - this.parent.parent.parent.options.leftSideWidth - this.parent.parent.parent.options.rightSideWidth - this.parent.timelineScrollBarWidth;
	var beatWidth = timelineWidth / (this.parent.parent.parent.options.bars * 8);
	var patternWidth = (pattern.pattern.length * beatWidth) - (borderWidth * 2);
	var xPad = (pattern.location * beatWidth) + this.parent.parent.parent.options.leftSideWidth;
	var patternheight = this.parent.timelineLaneHeight - (borderWidth * 2);
	// debug(xPad);

	for (var i = 0; i < pattern.pattern.nodes.length - 1; i++) {
		var line = new PIXI.Graphics().lineStyle(1, parseInt(colour.hexString().substring(1), 16));

		line.moveTo(borderWidth + xPad + ((pattern.pattern.nodes[i].x / 100) * patternWidth), ((timelineIndex * this.parent.timelineLaneHeight) + this.parent.timelineScroll + ((1 - pattern.pattern.nodes[i].y / 100) * patternheight)) + borderWidth);
		line.lineTo(borderWidth + xPad + ((pattern.pattern.nodes[i + 1].x / 100) * patternWidth), ((timelineIndex * this.parent.timelineLaneHeight) + this.parent.timelineScroll + ((1 - pattern.pattern.nodes[i + 1].y / 100) * patternheight)) + borderWidth);

		pattern.graphics.addChild(line);
	}
}

TimelinePatternRenderer.prototype.drawPatternBox = function(pattern, timelineIndex){
	var borderWidth = 2;

	var colour = color(pattern.colour);
	colour.darken(0.5);

	pattern.graphics.beginFill(parseInt(colour.hexString().substring(1), 16));
	pattern.graphics.drawRect(this.parent.parent.parent.options.leftSideWidth + (this.barGridStepWidth * pattern.location), (timelineIndex * this.parent.timelineLaneHeight) + this.parent.timelineScroll, pattern.pattern.length * this.barGridStepWidth, this.parent.timelineLaneHeight);
	pattern.graphics.endFill();

	colour.lighten(0.3);

	pattern.graphics.beginFill(parseInt(colour.hexString().substring(1), 16));
	pattern.graphics.drawRect(this.parent.parent.parent.options.leftSideWidth + (this.barGridStepWidth * pattern.location) + borderWidth, ((timelineIndex * this.parent.timelineLaneHeight) + borderWidth) + this.parent.timelineScroll, pattern.pattern.length * this.barGridStepWidth - (borderWidth * 2), this.parent.timelineLaneHeight - (borderWidth * 2));
	pattern.graphics.endFill();
}

TimelinePatternRenderer.prototype.makeTimelinePatternGraphics = function(laneIndex, patternIndex, outerContainer) {
	/**
	 * make graphics
	 * @type {PIXI}
	 */
	tlpg = new PIXI.Graphics();
	this.parent.parent.parent.timelines[laneIndex].patterns[patternIndex].graphics = tlpg;
	outerContainer.addChild(tlpg);

	tlpg.interactive = true;
	tlpg.buttonMode = true;

	/**
	 * Bind to pattern
	 */
	tlpg.pid = this.parent.parent.parent.timelines[laneIndex].patterns[patternIndex].id;

	// debug(tlpg.pid);

	var self = this;

	/**
	 * make draggable
	 */
	tlpg.mouseover = function() {
		setTimeout(function() {
			this.alpha = 0.7;
			this.mouseIn = true;
		}.bind(this), 0);

	}

	tlpg.mouseout = function() {
		this.alpha = 0.6;
		this.mouseIn = false;
	}

	tlpg.mousedown = tlpg.touchstart = function(event) {
		this.alpha = 0.8;
		this.dragging = true;
		this.sx = event.data.getLocalPosition(this).x * this.scale.x;
		this.xdiffMoved = 0;

		self.parent.parent.selectPattern(this.pid);
	}

	tlpg.mousemove = tlpg.touchmove = function(event) {

		if (this.dragging) {

			// need to get parent coords..
			var newPosition = event.data.getLocalPosition(this.parent.parent);

			var xdiff = (newPosition.x - this.sx) - (this.xdiffMoved * self.barGridStepWidth);

			if (Math.abs(xdiff) > self.barGridStepWidth) {

				for (var j = 0; j < self.parent.parent.parent.timelines.length; j++) {

					for (var x = 0; x < self.parent.parent.parent.timelines[j].patterns.length; x++) {

						if (self.parent.parent.parent.timelines[j].patterns[x].id == this.pid) {
							self.parent.parent.parent.timelines[j].patterns[x].location += parseInt(xdiff / self.barGridStepWidth);

							if (self.parent.parent.parent.timelines[j].patterns[x].location < 0) {
								self.parent.parent.parent.timelines[j].patterns[x].location = 0;
							}

							if (self.parent.parent.parent.timelines[j].patterns[x].location + self.parent.parent.parent.timelines[j].patterns[x].pattern.length > self.parent.parent.parent.options.bars * self.timelineBarGrid) {
								self.parent.parent.parent.timelines[j].patterns[x].location = (self.parent.parent.parent.options.bars * self.timelineBarGrid) - self.parent.parent.parent.timelines[j].patterns[x].pattern.length;
							}

						}

					}

				}

				this.xdiffMoved += parseInt(xdiff / self.barGridStepWidth);

				self.drawPatterns();
			}

		}

	}

	document.body.addEventListener('mouseup', function() {
		this.dragging = false;
		this.alpha = 1;
	}.bind(tlpg));

	return tlpg;
}