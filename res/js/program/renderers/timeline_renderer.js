const debug = require('debug')("li:client:program:renderers:timeline");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');
const color = require("color");

TimelineRenderer = function(parent) {
	this.parent = parent;

	this.init()
}

TimelineRenderer.prototype.init = function() {

	this.timelineHeight = this.parent.height - this.parent.bottomBarHeight;
	this.timelineLaneHeight = 50;
	this.timelineScrollBarWidth = 15;
	this.timelineBarGrid = 8;
	this.timelineScroll = 0;

}

TimelineRenderer.prototype.buildGraphics = function() {
	/**
	 * Timeline graphics
	 * @type {PIXI}
	 */
	this.tlg = new PIXI.Graphics();
	this.tlg.interactive = true;
	this.parent.stage.addChild(this.tlg);

	this.tlrsg = new PIXI.Graphics();
	this.tlrsg.interactive = true;
	this.parent.stage.addChild(this.tlrsg);

	this.tlgbg = new PIXI.Graphics();
	this.tlgbg.interactive = true;
	this.parent.stage.addChild(this.tlgbg);

	this.tsbbg = new PIXI.Graphics();
	this.parent.stage.addChild(this.tsbbg);

	this.tsbg = new PIXI.Graphics();
	this.tsbg.interactive = true;
	this.tsbg.buttonMode = true;
	this.parent.stage.addChild(this.tsbg);
}

TimelineRenderer.prototype.drawTimeline = function(redraw, initial) {

	if (!redraw && !initial) return;

	var darkBar = false;

	this.tlg.clear();

	var width = this.parent.width - (this.parent.parent.options.leftSideWidth + this.parent.parent.options.rightSideWidth + this.timelineScrollBarWidth);

	for (var i = 0; i < this.parent.parent.options.bars; i++) {
		this.tlg.beginFill(darkBar ? 0x505050 : 0x4a4a4a);
		this.tlg.drawRect(this.parent.parent.options.leftSideWidth + (width / this.parent.parent.options.bars) * i, 0, width / this.parent.parent.options.bars, this.timelineHeight);
		this.tlg.endFill();

		darkBar = !darkBar;
	}

	for (var i = 0; i < this.parent.parent.options.bars * 4; i++) {
		this.tlg.beginFill(0x444444);
		this.tlg.drawRect(this.parent.parent.options.leftSideWidth + (width / this.parent.parent.options.bars) / 4 * i, 0, 1, this.timelineHeight);
		this.tlg.endFill();
	}

	this.tlg.hitArea = this.tlg.getBounds();

	if (initial) {
		this.bindTimelineWheelScroll();
	}
}

TimelineRenderer.prototype.buildTimelineScrollBar = function(redraw, initial) {

	var xpos = this.parent.width - this.timelineScrollBarWidth;

	if (redraw || initial) {
		this.tsbbg.clear();

		this.tsbbg.beginFill(0x252525);
		this.tsbbg.drawRect(xpos, 0, this.timelineScrollBarWidth, this.timelineHeight);
		this.tsbbg.endFill();


		this.scrollBarHeight = 0;
		var scrollBarPadding = 3;

		this.scrollBarHeight = this.timelineHeight / (this.timelineLaneHeight * (this.parent.parent.timelines.length + 1))

		if (this.scrollBarHeight > 1) {
			this.scrollBarHeight = 1;
		}

		this.scrollBarHeight = this.scrollBarHeight * this.timelineHeight

		this.tsbg.clear();
		this.tsbg.beginFill(0x555555);
		this.tsbg.drawRect(xpos + scrollBarPadding, scrollBarPadding, this.timelineScrollBarWidth - (scrollBarPadding * 2), this.scrollBarHeight - (scrollBarPadding * 2));
		this.tsbg.endFill();
		this.tsbg.position.y = 0;

	}

	this.tsbg.hitArea = this.tsbg.getBounds();

	if (initial) {

		var self = this;

		this.tsbg.mousedown = this.tsbg.touchstart = function(event) {
			this.alpha = 0.8;
			self.tsbg.dragging = true;
			this.sy = event.data.getLocalPosition(self.tsbg).y * self.tsbg.scale.y;
		}

		this.tsbg.mousemove = this.tsbg.touchmove = function(event) {

			if (self.tsbg.dragging) {
				// need to get parent coords..
				var newPosition = event.data.getLocalPosition(this.parent);

				var y = newPosition.y - this.sy;

				if (y + self.scrollBarHeight > self.timelineHeight) {
					y = self.timelineHeight - self.scrollBarHeight
				}

				if (y < 0) {
					y = 0;
				}

				this.position.y = y;

				var sperc = y / Math.max(1, (self.timelineHeight - self.scrollBarHeight));

				self.timelineScroll = -(sperc * (Math.max(0, (self.parent.parent.timelines.length + 1) - (self.timelineHeight / self.timelineLaneHeight)) * self.timelineLaneHeight));

				self.parent.drawLayout();

			}

		}

		document.body.addEventListener('mouseup', function() {
			self.tsbg.dragging = false;
			self.tsbg.alpha = 1;
		}.bind(this));

	}
}

TimelineRenderer.prototype.bindTimelineWheelScroll = function() {
	this.tlg.mouseover = function() {
		setTimeout(function() {
			this.mouseIn = true;
		}.bind(this), 0);
	}

	this.tlg.mouseout = function() {
		this.mouseIn = false;
	}

	document.body.addEventListener('mousewheel', function(event) {

		if (this.tlg.mouseIn || this.tlgbg.mouseIn || this.parent.rsbg.mouseIn) {
			this.timelineScroll += event.wheelDeltaY;

			this.parent.drawLayout(false, false);
		}

	}.bind(this));
}

TimelineRenderer.prototype.verifyAndSetTimelineScroll = function() {
	if (-this.timelineScroll > (this.timelineLaneHeight * (this.parent.parent.timelines.length + 1)) - this.timelineHeight) {
		this.timelineScroll = -((this.timelineLaneHeight * (this.parent.parent.timelines.length + 1)) - this.timelineHeight);
	}

	if (-this.timelineScroll < 0) {
		this.timelineScroll = 0;
	}

	var maxHeight = (this.parent.parent.timelines.length + 1) * this.timelineLaneHeight - this.timelineHeight;

	this.tsbg.position.y = Math.abs(-this.timelineScroll / maxHeight) * (this.timelineHeight - this.scrollBarHeight)
}

TimelineRenderer.prototype.drawTimelineRowSeperators = function() {

	this.tlrsg.clear()

	var width = this.parent.width - this.parent.parent.options.leftSideWidth - this.parent.parent.options.rightSideWidth - this.timelineScrollBarWidth;


	/**
	 * Draw sepeation lines
	 */
	for (var i = 0; i < this.parent.parent.timelines.length; i++) {

		var y = (this.timelineLaneHeight * (i + 1)) - 1 + this.timelineScroll;

		if (y < 0 || y > this.timelineHeight) {
			continue;
		}

		this.tlrsg.beginFill(0x555555);
		this.tlrsg.drawRect(this.parent.parent.options.leftSideWidth, y, width, 1);
		this.tlrsg.endFill();
	}
}

TimelineRenderer.prototype.drawGreyedOutTimelineArea = function(initial) {

	var width = this.parent.width - this.parent.parent.options.leftSideWidth - this.parent.parent.options.rightSideWidth - this.timelineScrollBarWidth;

	/**
	 * Draw grey'ed out area
	 */
	var ypos = this.timelineLaneHeight * this.parent.parent.timelines.length + this.timelineScroll;

	this.tlgbg.clear();

	if (ypos >= 0 && ypos < this.timelineHeight) {
		this.tlgbg.beginFill(0x111111, 0.2);
		this.tlgbg.drawRect(this.parent.parent.options.leftSideWidth, ypos, width, this.timelineHeight - (this.timelineLaneHeight * this.parent.parent.timelines.length) - this.timelineScroll);
		this.tlgbg.endFill();
	}

	this.tlgbg.hitArea = this.tlgbg.getBounds();

	if (initial) {

		this.tlgbg.mouseover = function() {
			setTimeout(function() {
				this.mouseIn = true;
			}.bind(this), 0);
		}

		this.tlgbg.mouseout = function() {
			this.mouseIn = false;
		}

	}
}

TimelineRenderer.prototype.buildCursor = function() {
	this.cg = new PIXI.Graphics();
	this.parent.stage.addChild(this.cg);

	this.cursor = {
		pos: 0
	}
}

TimelineRenderer.prototype.drawCursor = function() {

	var width = this.parent.width - this.parent.parent.options.leftSideWidth - this.parent.parent.options.rightSideWidth - this.timelineScrollBarWidth;
	var cursorMoveTime = this.parent.parent.options.bars * 60 / this.parent.parent.options.bpm * 4

	this.cursor.pos = ((this.parent.parent.time / 1000) % cursorMoveTime) * (100 / cursorMoveTime)

	this.cg.clear();
	this.cg.beginFill(0xdd2222);
	this.cg.drawRect(this.parent.parent.options.leftSideWidth + (width * (this.cursor.pos / 100)), 0, 1, this.timelineHeight);
	this.cg.endFill();

	// app.dmx.set({
	// 	1: {
	// 		0: (Math.sin(this.cursor.pos / 100 * Math.PI * 2) * 128) + 128,
	// 		1: (Math.cos(this.cursor.pos / 100 * Math.PI * 2) * 64) + 128,
	// 		2: 250, //this.cursor.pos * 2.54,
	// 		3: (this.parent.parent.options.running ? 50 : 30),
	// 		4: (this.parent.parent.options.running ? 50 : 30),
	// 	}
	// })

}

TimelineRenderer.prototype.drawPatterns = function(redraw, initial) {

	if (initial) {

		this.outerContainer = new PIXI.Container();
		this.parent.stage.addChild(this.outerContainer);
	}



	var timelineWidth = this.parent.width - this.parent.parent.options.leftSideWidth - this.parent.parent.options.rightSideWidth - this.timelineScrollBarWidth;
	this.barGridStepWidth = timelineWidth / this.parent.parent.options.bars / this.timelineBarGrid;

	for (var i = 0; i < this.parent.parent.timelines.length; i++) {
		for (var k = 0; k < this.parent.parent.timelines[i].patterns.length; k++) {

			this.drawPattern(this.parent.parent.timelines[i].patterns[k], i, k);

		}
	}
}

TimelineRenderer.prototype.drawPattern = function(pattern, timelineIndex, patternIndex) {
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

TimelineRenderer.prototype.drawPatternLines = function(pattern, timelineIndex){
	var borderWidth = 2;

	var colour = color(pattern.colour);
	colour.darken(0.1);

	var timelineWidth = this.parent.width - this.parent.parent.options.leftSideWidth - this.parent.parent.options.rightSideWidth - this.timelineScrollBarWidth;
	var beatWidth = timelineWidth / (this.parent.parent.options.bars * 8);
	var patternWidth = (pattern.pattern.length * beatWidth) - (borderWidth * 2);
	var xPad = (pattern.location * beatWidth) + this.parent.parent.options.leftSideWidth;
	var patternheight = this.timelineLaneHeight - (borderWidth * 2);
	// debug(xPad);

	for (var i = 0; i < pattern.pattern.nodes.length - 1; i++) {
		var line = new PIXI.Graphics().lineStyle(1, parseInt(colour.hexString().substring(1), 16));

		line.moveTo(borderWidth + xPad + ((pattern.pattern.nodes[i].x / 100) * patternWidth), ((timelineIndex * this.timelineLaneHeight) + this.timelineScroll + ((1 - pattern.pattern.nodes[i].y / 100) * patternheight)) + borderWidth);
		line.lineTo(borderWidth + xPad + ((pattern.pattern.nodes[i + 1].x / 100) * patternWidth), ((timelineIndex * this.timelineLaneHeight) + this.timelineScroll + ((1 - pattern.pattern.nodes[i + 1].y / 100) * patternheight)) + borderWidth);

		pattern.graphics.addChild(line);
	}
}

TimelineRenderer.prototype.drawPatternBox = function(pattern, timelineIndex){
	var borderWidth = 2;

	var colour = color(pattern.colour);
	colour.darken(0.5);

	pattern.graphics.beginFill(parseInt(colour.hexString().substring(1), 16));
	pattern.graphics.drawRect(this.parent.parent.options.leftSideWidth + (this.barGridStepWidth * pattern.location), (timelineIndex * this.timelineLaneHeight) + this.timelineScroll, pattern.pattern.length * this.barGridStepWidth, this.timelineLaneHeight);
	pattern.graphics.endFill();

	colour.lighten(0.3);

	pattern.graphics.beginFill(parseInt(colour.hexString().substring(1), 16));
	pattern.graphics.drawRect(this.parent.parent.options.leftSideWidth + (this.barGridStepWidth * pattern.location) + borderWidth, ((timelineIndex * this.timelineLaneHeight) + borderWidth) + this.timelineScroll, pattern.pattern.length * this.barGridStepWidth - (borderWidth * 2), this.timelineLaneHeight - (borderWidth * 2));
	pattern.graphics.endFill();
}

TimelineRenderer.prototype.makeTimelinePatternGraphics = function(laneIndex, patternIndex, outerContainer) {
	/**
	 * make graphics
	 * @type {PIXI}
	 */
	tlpg = new PIXI.Graphics();
	this.parent.parent.timelines[laneIndex].patterns[patternIndex].graphics = tlpg;
	outerContainer.addChild(tlpg);

	tlpg.interactive = true;
	tlpg.buttonMode = true;

	/**
	 * Bind to pattern
	 */
	tlpg.pid = this.parent.parent.timelines[laneIndex].patterns[patternIndex].id;

	// debug(tlpg.pid);

	var self = this;

	/**
	 * make draggable
	 */
	tlpg.mouseover = function() {
		setTimeout(function() {
			this.mouseIn = true;
		}.bind(this), 0);

	}

	tlpg.mouseout = function() {
		this.mouseIn = false;
	}

	tlpg.mousedown = this.tsbg.touchstart = function(event) {
		this.alpha = 0.8;
		this.dragging = true;
		this.sx = event.data.getLocalPosition(this).x * this.scale.x;
		this.xdiffMoved = 0;

		self.parent.selectPattern(this.pid);
	}

	tlpg.mousemove = tlpg.touchmove = function(event) {

		if (this.dragging) {

			// need to get parent coords..
			var newPosition = event.data.getLocalPosition(this.parent);

			var xdiff = (newPosition.x - this.sx) - (this.xdiffMoved * self.barGridStepWidth);

			if (Math.abs(xdiff) > self.barGridStepWidth) {

				for (var j = 0; j < self.parent.parent.timelines.length; j++) {

					for (var x = 0; x < self.parent.parent.timelines[j].patterns.length; x++) {

						if (self.parent.parent.timelines[j].patterns[x].id == this.pid) {
							self.parent.parent.timelines[j].patterns[x].location += parseInt(xdiff / self.barGridStepWidth);

							if (self.parent.parent.timelines[j].patterns[x].location < 0) {
								self.parent.parent.timelines[j].patterns[x].location = 0;
							}

							if (self.parent.parent.timelines[j].patterns[x].location + self.parent.parent.timelines[j].patterns[x].pattern.length > self.parent.parent.options.bars * self.timelineBarGrid) {
								self.parent.parent.timelines[j].patterns[x].location = (self.parent.parent.options.bars * self.timelineBarGrid) - self.parent.parent.timelines[j].patterns[x].pattern.length;
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