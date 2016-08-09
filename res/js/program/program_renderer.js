const debug = require('debug')("li:client:program_renderer");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');

ProgramRenderer = function(elem, options, callback) {
	this.elem = elem;
	this.options = options;
	this.height = this.elem.height();
	this.timelineScroll = 0;

	this.time = 0;
	this.bottomBarHeight = 300;
	this.timelineHeight = this.height - this.bottomBarHeight;
	this.timelineElementHeight = 50;
	this.timelineScrollBarWidth = 15;

	this.timelineElements = [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];

	debug(this.elem.height())

	if (!callback) {
		callback = options;
		this.options = {};
	}

	this.options = this.buildOptions(this.options);

	this.init(callback);
}

ProgramRenderer.prototype.init = function(callback) {
	debug("Loading program renderer...");

	this.buildFpsMeter();

	/**
	 * build
	 */
	this.buildStage(callback);
	this.listenForResize();
	this.buildLayout();
	this.buildCursor();
	this.buildRightClickMenu();

	this.draw();

	debug("Renderer ready!");
}

ProgramRenderer.prototype.buildFpsMeter = function() {
	this.meter = new FPSMeter($("#fps-meter").get(0), {
		theme: 'transparent',
		graph: 1
	});
}

ProgramRenderer.prototype.buildStage = function(callback) {

	if (!this.elem) {
		callback("No container element supplied!", null);
		return;
	}

	this.width = this.elem.width();

	this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
		backgroundColor: 0xff00ff
	});

	this.elem.get(0).appendChild(this.renderer.view);

	this.stage = new PIXI.Container();
	this.stage.interactive = true;

	callback(null, null);
}

ProgramRenderer.prototype.listenForResize = function() {
	$(window).on("resize", function() {

		setTimeout(function() {
			this.width = this.elem.width();
			this.height = this.elem.height() - 1;
			this.timelineHeight = this.height - this.bottomBarHeight;
			this.timelineScroll = 0;

			this.renderer.resize(this.width, this.height)

			this.resize();
		}.bind(this), 0);

	}.bind(this))
}

ProgramRenderer.prototype.buildOptions = function(options) {

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

ProgramRenderer.prototype.draw = function() {
	this.tick();

	this.renderer.render(this.stage);

	requestAnimationFrame(this.draw.bind(this));
}

ProgramRenderer.prototype.resize = function() {
	this.drawLayout(true, false);
}

ProgramRenderer.prototype.buildLayout = function() {
	/**
	 * Get Graphics
	 */

	/**
	 * Timeline graphics
	 * @type {PIXI}
	 */
	this.tlg = new PIXI.Graphics();
	this.tlg.interactive = true;
	this.stage.addChild(this.tlg);

	this.tlrsg = new PIXI.Graphics();
	this.tlrsg.interactive = true;
	this.stage.addChild(this.tlrsg);

	this.tlgbg = new PIXI.Graphics();
	this.tlgbg.interactive = true;
	this.stage.addChild(this.tlgbg);

	this.tsbbg = new PIXI.Graphics();
	this.stage.addChild(this.tsbbg);

	this.tsbg = new PIXI.Graphics();
	this.tsbg.interactive = true;
	this.tsbg.buttonMode = true;
	this.stage.addChild(this.tsbg);

	/**
	 * Right sidebar graphics
	 * @type {PIXI}
	 */
	this.rsbg = new PIXI.Graphics();
	this.rsbg.interactive = true;
	this.stage.addChild(this.rsbg);

	/**
	 * Left sidebar graphics
	 * @type {PIXI}
	 */
	this.lsbg = new PIXI.Graphics();
	this.stage.addChild(this.lsbg);

	/**
	 * Bottom bar graphics
	 * @type {PIXI}
	 */
	this.bbg = new PIXI.Graphics();
	this.bbg.interactive = true;
	this.stage.addChild(this.bbg);

	this.drawLayout(true, true);
}

ProgramRenderer.prototype.buildRightClickMenu = function() {

	var width = 115;

	var outerContainer = new PIXI.Container();

	this.stage.addChild(outerContainer);

	outerContainer.visible = false;

	var innerContainer = new PIXI.Container();
	outerContainer.addChild(innerContainer);

	/**
	 * itemContainer1
	 * @type {PIXI}
	 */
	var itemContainer1 = new PIXI.Container();

	itemContainer1.interactive = true;
	itemContainer1.buttonMode = true;

	itemContainer1.position.y = 0;

	var rcg1 = new PIXI.Graphics();
	rcg1.interactive = true;
	itemContainer1.addChild(rcg1);

	rcg1.beginFill(0xaaaaaa);
	rcg1.drawRect(0, 0, width, 25);
	rcg1.endFill();

	var text1 = new PIXI.Text('Add Pattern lane',{font : '14px Lato', fill : 0x111111, align : 'left'});
	text1.position.x = 5;
	text1.position.y = 5;

	itemContainer1.addChild(text1);

	itemContainer1.hitArea = itemContainer1.getBounds();

	itemContainer1.mousedown = function(event){
		this.addNewTimelineLane();
	}.bind(this)

	innerContainer.addChild(itemContainer1);

	/**
	 * itemContainer2
	 * @type {PIXI}
	 */
	var itemContainer2 = new PIXI.Container();

	itemContainer2.interactive = true;
	itemContainer2.buttonMode = true;

	itemContainer2.position.y = 25;

	var rcg2 = new PIXI.Graphics();
	rcg2.interactive = true;
	itemContainer2.addChild(rcg2);

	rcg2.beginFill(0xaaaaaa);
	rcg2.drawRect(0, 0, width, 25);
	rcg2.endFill();

	var text2 = new PIXI.Text('Other Thing',{font : '14px Lato', fill : 0x111111, align : 'left'});
	text2.position.x = 5;
	text2.position.y = 5;

	itemContainer2.addChild(text2);

	itemContainer2.hitArea = itemContainer2.getBounds();

	itemContainer2.mousedown = function(event){
		alert("Ayyy")
	}

	innerContainer.addChild(itemContainer2);


	document.body.addEventListener('mousedown', function(event) {
		if (event.button == 2 && (this.tlg.mouseIn || this.tlgbg.mouseIn || this.rsbg.mouseIn)) {
			outerContainer.position.x = this.renderer.plugins.interaction.mouse.global.x;
			outerContainer.position.y = this.renderer.plugins.interaction.mouse.global.y;
			outerContainer.visible = true;

			return;
		}

		outerContainer.visible = false;
	}.bind(this));

}

ProgramRenderer.prototype.addNewTimelineLane = function(){
	this.timelineElements.push({

	})

	this.drawLayout(true);
}

ProgramRenderer.prototype.drawLayout = function(redraw, initial) {
	if (redraw) this.drawLeftSidebar();
	this.drawRightSidebar(redraw, initial);

	if (redraw) this.drawTimeline(initial);
	this.buildTimelineScrollBar(redraw, initial);
	this.drawTimelineRowSeperators();
	this.drawGreyedOutTimelineArea(initial);

	this.drawBottomBar();
}

ProgramRenderer.prototype.buildTimelineScrollBar = function(redraw, initial) {

	var xpos = this.width - this.timelineScrollBarWidth;

	if (redraw || initial) {
		this.tsbbg.clear();

		this.tsbbg.beginFill(0x252525);
		this.tsbbg.drawRect(xpos, 0, this.timelineScrollBarWidth, this.timelineHeight);
		this.tsbbg.endFill();


		this.scrollBarHeight = 0;
		var scrollBarPadding = 3;

		this.scrollBarHeight = this.timelineHeight / (this.timelineElementHeight * (this.timelineElements.length + 1))

		if (this.scrollBarHeight > 1) {
			this.scrollBarHeight = 1;
		}

		this.scrollBarHeight = this.scrollBarHeight * this.timelineHeight

		this.tsbg.clear();
		this.tsbg.beginFill(0x555555);
		this.tsbg.drawRect(xpos + scrollBarPadding, scrollBarPadding, this.timelineScrollBarWidth - (scrollBarPadding * 2), this.scrollBarHeight - (scrollBarPadding * 2));
		this.tsbg.endFill();
		this.tsbg.hitArea = this.tsbg.getBounds();
		this.tsbg.position.y = 0;

	}

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

				self.timelineScroll = -(sperc * (Math.max(0, (self.timelineElements.length + 1) - (self.timelineHeight / self.timelineElementHeight)) * self.timelineElementHeight));

				self.drawLayout();

			}

		}

		document.body.addEventListener('mouseup', function() {
			self.tsbg.dragging = false;
			self.tsbg.alpha = 1;
		}.bind(this));

	}
}

ProgramRenderer.prototype.drawBottomBar = function() {

	this.bbg.clear();

	this.bbg.beginFill(0x222222);
	this.bbg.drawRect(this.options.leftSideWidth, this.timelineHeight, this.width - this.options.leftSideWidth, this.bottomBarHeight);
	this.bbg.endFill();

	this.bbg.beginFill(0x111111);
	this.bbg.drawRect(this.options.leftSideWidth, this.timelineHeight, 1, this.bottomBarHeight);
	this.bbg.endFill();
}

ProgramRenderer.prototype.drawLeftSidebar = function() {

	this.lsbg.clear()

	this.lsbg.beginFill(0x777777);
	this.lsbg.drawRect(0, 0, this.options.leftSideWidth, this.height);
	this.lsbg.endFill();

	this.lsbg.beginFill(0x111111);
	this.lsbg.drawRect(this.options.leftSideWidth, 0, 1, this.height);
	this.lsbg.endFill();
}

ProgramRenderer.prototype.drawRightSidebar = function(redraw, initial) {

	var xpos = this.width - this.options.rightSideWidth - this.timelineScrollBarWidth;

	this.rsbg.clear()

	/**
	 * background
	 */

	this.rsbg.beginFill(0x333333);
	this.rsbg.drawRect(xpos, 0, this.options.rightSideWidth, this.timelineHeight);
	this.rsbg.endFill();

	this.rsbg.beginFill(0x111111);
	this.rsbg.drawRect(xpos, 0, 1, this.timelineHeight);
	this.rsbg.endFill();

	/**
	 * Count as in timeline
	 */

	this.rsbg.hitArea = this.rsbg.getBounds();

	if (initial) {

		this.rsbg.mouseover = function() {
			setTimeout(function() {
				this.mouseIn = true;
			}.bind(this), 0);

		}

		this.rsbg.mouseout = function() {
			this.mouseIn = false;
		}

	}
}

ProgramRenderer.prototype.drawTimeline = function(initial) {
	var darkBar = false;

	this.tlg.clear();

	var width = this.width - this.options.leftSideWidth - this.options.rightSideWidth - this.timelineScrollBarWidth;

	for (var i = 0; i < this.options.bars; i++) {
		this.tlg.beginFill(darkBar ? 0x505050 : 0x4a4a4a);
		this.tlg.drawRect(this.options.leftSideWidth + (width / this.options.bars) * i, 0, width / this.options.bars, this.timelineHeight);
		this.tlg.endFill();

		darkBar = !darkBar;
	}

	for (var i = 0; i < this.options.bars * 4; i++) {
		this.tlg.beginFill(0x444444);
		this.tlg.drawRect(this.options.leftSideWidth + (width / this.options.bars) / 4 * i, 0, 1, this.timelineHeight);
		this.tlg.endFill();
	}

	this.tlg.hitArea = this.tlg.getBounds();

	if (initial) {
		this.bindTimelineWheelScroll();
	}
}

ProgramRenderer.prototype.bindTimelineWheelScroll = function() {
	this.tlg.mouseover = function() {
		setTimeout(function() {
			this.mouseIn = true;
		}.bind(this), 0);
	}

	this.tlg.mouseout = function() {
		this.mouseIn = false;
	}

	document.body.addEventListener('mousewheel', function(event) {

		if (this.tlg.mouseIn || this.tlgbg.mouseIn || this.rsbg.mouseIn) {
			this.timelineScroll += event.wheelDeltaY;

			if (-this.timelineScroll > (this.timelineElementHeight * (this.timelineElements.length + 1)) - this.timelineHeight) {
				this.timelineScroll = -((this.timelineElementHeight * (this.timelineElements.length + 1)) - this.timelineHeight);
			}

			if (-this.timelineScroll < 0) {
				this.timelineScroll = 0;
			}

			var maxHeight = (this.timelineElements.length + 1) * this.timelineElementHeight - this.timelineHeight;

			this.tsbg.position.y = Math.abs(-this.timelineScroll / maxHeight) * (this.timelineHeight - this.scrollBarHeight)

			this.drawLayout(false, false);
		}

	}.bind(this));
}

ProgramRenderer.prototype.drawTimelineRowSeperators = function() {

	this.tlrsg.clear()

	var width = this.width - this.options.leftSideWidth - this.options.rightSideWidth - this.timelineScrollBarWidth;

	/**
	 * Draw sepeation lines
	 */
	for (var i = 0; i < this.timelineElements.length; i++) {

		var y = (this.timelineElementHeight * (i + 1)) - 1 + this.timelineScroll;

		if (y < 0 || y > this.timelineHeight) {
			continue;
		}

		this.tlrsg.beginFill(0x555555);
		this.tlrsg.drawRect(this.options.leftSideWidth, y, width, 1);
		this.tlrsg.endFill();
	}
}

ProgramRenderer.prototype.drawGreyedOutTimelineArea = function(initial) {

	var width = this.width - this.options.leftSideWidth - this.options.rightSideWidth - this.timelineScrollBarWidth;

	/**
	 * Draw grey'ed out area
	 */
	var ypos = this.timelineElementHeight * this.timelineElements.length + this.timelineScroll;

	this.tlgbg.clear();

	if (ypos >= 0 && ypos < this.timelineHeight) {
		this.tlgbg.beginFill(0x111111, 0.2);
		this.tlgbg.drawRect(this.options.leftSideWidth, ypos, width, this.timelineHeight - (this.timelineElementHeight * this.timelineElements.length) - this.timelineScroll);
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

ProgramRenderer.prototype.buildCursor = function() {
	this.cg = new PIXI.Graphics();
	this.stage.addChild(this.cg);

	this.cursor = {
		pos: 0
	}
}

ProgramRenderer.prototype.setTime = function(time) {
	this.time = time;
}

ProgramRenderer.prototype.tick = function() {
	if (this.meter) this.meter.tick();

	this.drawCursor();
}

ProgramRenderer.prototype.drawCursor = function() {

	var width = this.width - this.options.leftSideWidth - this.options.rightSideWidth - this.timelineScrollBarWidth;
	var cursorMoveTime = this.options.bars * 60 / this.options.bpm * 4

	this.cursor.pos = ((this.time / 1000) % cursorMoveTime) * (100 / cursorMoveTime)

	this.cg.clear();
	this.cg.beginFill(0xdd2222);
	this.cg.drawRect(this.options.leftSideWidth + (width * (this.cursor.pos / 100)), 0, 1, this.timelineHeight);
	this.cg.endFill();

	// app.dmx.set({1: {
	// 	0: (Math.sin(this.cursor.pos / 100 * Math.PI * 2) * 32) + 128,
	// 	1: (Math.cos(this.cursor.pos / 100 * Math.PI * 2) * 32) + 128,
	// 	2: 32,//this.cursor.pos * 2.54,
	// 	3: 100,
	// 	4: 255
	// }})
}