const debug = require('debug')("li:client:program_renderer");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');

ProgramRenderer = function(elem, options, callback) {
	this.elem = elem;
	this.options = options;
	this.height = this.elem.height();

	this.timing = {};
	this.bottomBarHeight = 300;
	this.timelineHeight = this.height - this.bottomBarHeight;

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

	/**
	 * build
	 */
	this.buildStage(callback);
	this.listenForResize();
	this.buildLayout();
	this.buildCursor();

	this.draw();

	debug("Renderer ready!");
}

ProgramRenderer.prototype.buildStage = function(callback) {

	if (!this.elem) {
		callback("No container element supplied!", null);
		return;
	}

	this.width = this.elem.width();

	this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
		backgroundColor: 0x111111
	});

	this.elem.get(0).appendChild(this.renderer.view);

	this.stage = new PIXI.Container();

	callback(null, null);
}

ProgramRenderer.prototype.listenForResize = function() {
	$(window).on("resize", function() {

		setTimeout(function() {
			this.width = this.elem.width();
			this.height = this.elem.height() - 1;
			this.timelineHeight = this.height - this.bottomBarHeight;

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
		rightSideWidth: 200,
		lineHeight: 50
	}

	for (var attrname in options) { obj[attrname] = options[attrname]; }

	return obj;
}

ProgramRenderer.prototype.draw = function() {
	this.tick();

	this.renderer.render(this.stage);

	requestAnimationFrame(this.draw.bind(this));
}

ProgramRenderer.prototype.resize = function() {
	this.drawLayout();
}

ProgramRenderer.prototype.buildLayout = function() {
	/**
	 * Get Graphics
	 */
	this.lg = new PIXI.Graphics();
	this.stage.addChild(this.lg);

	this.drawLayout();
}

ProgramRenderer.prototype.drawLayout = function() {
	this.drawLeftSidebar();
	this.drawRightSidebar();
	this.drawTimeline();
	this.drawBottomBar();
}

ProgramRenderer.prototype.drawBottomBar = function() {
	this.lg.beginFill(0x222222);
	this.lg.drawRect(this.options.leftSideWidth, this.timelineHeight, this.width - this.options.leftSideWidth, this.bottomBarHeight);
	this.lg.endFill();

	this.lg.beginFill(0x111111);
	this.lg.drawRect(this.options.leftSideWidth, this.timelineHeight, 1, this.bottomBarHeight);
	this.lg.endFill();
}

ProgramRenderer.prototype.drawLeftSidebar = function() {
	this.lg.beginFill(0x777777);
	this.lg.drawRect(0, 0, this.options.leftSideWidth, this.height);
	this.lg.endFill();

	this.lg.beginFill(0x111111);
	this.lg.drawRect(this.options.leftSideWidth, 0, 1, this.height);
	this.lg.endFill();
}

ProgramRenderer.prototype.drawRightSidebar = function() {

	this.lg.beginFill(0x333333);
	this.lg.drawRect(this.width - this.options.rightSideWidth, 0, this.options.rightSideWidth, this.timelineHeight);
	this.lg.endFill();

	this.lg.beginFill(0x111111);
	this.lg.drawRect(this.width - this.options.rightSideWidth, 0, 1, this.timelineHeight);
	this.lg.endFill();
}

ProgramRenderer.prototype.drawTimeline = function() {
	var darkBar = false;

	var width = this.width - this.options.leftSideWidth - this.options.rightSideWidth;

	for (var i = 0; i < this.options.bars; i++) {
		this.lg.beginFill(darkBar ? 0x505050 : 0x4a4a4a);
		this.lg.drawRect(this.options.leftSideWidth + (width / this.options.bars) * i, 0, width / this.options.bars, this.timelineHeight);
		this.lg.endFill();

		darkBar = !darkBar;
	}

	for (var i = 0; i < this.options.bars * 4; i++) {
		this.lg.beginFill(0x444444);
		this.lg.drawRect(this.options.leftSideWidth + (width / this.options.bars) / 4 * i, 0, 1, this.timelineHeight);
		this.lg.endFill();
	}

	for (var i = 0; i < (this.timelineHeight / this.options.lineHeight) - 1; i++) {
		this.lg.beginFill(0x555555);
		this.lg.drawRect(this.options.leftSideWidth, (this.options.lineHeight * (i + 1)) - 1, this.width - this.options.leftSideWidth, 1);
		this.lg.endFill();
	}
}

ProgramRenderer.prototype.buildCursor = function() {
	this.cg = new PIXI.Graphics();
	this.stage.addChild(this.cg);

	this.cursor = {
		pos: 0
	}

	this.timeOffset = new Date().getTime();
}

ProgramRenderer.prototype.tick = function() {
	var now = new Date().getTime();
	this.timing.deltaTime = now - this.timing.lastTick;
	this.timing.lastTick = now;

	if (this.options.running) {
		this.time = new Date().getTime() - this.timeOffset;
	}else{
		this.timeOffset += this.timing.deltaTime;
	}

	this.drawCursor();

}

ProgramRenderer.prototype.drawCursor = function() {

	var width = this.width - this.options.leftSideWidth - this.options.rightSideWidth;
	var cursorMoveTime = this.options.bars * 60 / this.options.bpm * 4

	this.cursor.pos = ((this.time / 1000) % cursorMoveTime) * (100 / cursorMoveTime)

	this.cg.clear();
	this.cg.beginFill(0xdd2222);
	this.cg.drawRect(this.options.leftSideWidth + (width * (this.cursor.pos / 100)), 0, 1, this.timelineHeight);
	this.cg.endFill();

	app.dmx.set({
		0: (Math.cos(this.cursor.pos / 100 * Math.PI * 2) * 128) + 128,
		2: (Math.sin(this.cursor.pos / 50 * Math.PI * 2) * 64) + 128,
		5: 40,
		6: 255,
		12: (this.cursor.pos >= 50 ? 25 : 50)
	})
}