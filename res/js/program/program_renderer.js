const debug = require('debug')("li:client:program_renderer");
const remote = require('electron').remote;

ProgramRenderer = function(elem, options, callback) {
	this.elem = elem;
	this.options = options;

	if(!callback){
		callback = options;
		this.options = this.buildDefaultOptions();
	}

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

	if(!this.elem){
		callback("No container element supplied!", null);
		return;
	}

	this.width = this.elem.width();
	this.height = 600;

	this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
		backgroundColor: 0x111111
	});

	this.elem.get(0).appendChild(this.renderer.view);

	this.stage = new PIXI.Container();

	callback(null, null);
}

ProgramRenderer.prototype.listenForResize = function(){
	$(window).on("resize", function(){

		this.width = this.elem.width();

		this.renderer.resize(this.width, this.height)

		this.resize();

	}.bind(this))
}

ProgramRenderer.prototype.buildDefaultOptions = function(){
	return {
		running: true,
		bpm: 120,
		bars: 4,
		sideWidth: 300
	}
}

ProgramRenderer.prototype.draw = function(){
	this.tick();

	this.renderer.render(this.stage);

	requestAnimationFrame(this.draw.bind(this));
}

ProgramRenderer.prototype.resize = function(){
	this.buildTimeline();
}

ProgramRenderer.prototype.buildLayout = function(){
	/**
	 * Get Graphics
	 */
	this.lg = new PIXI.Graphics();
	this.stage.addChild(this.lg);

	this.buildTimeline();
	this.buildSidebar();
}

ProgramRenderer.prototype.buildSidebar = function(){
	this.lg.beginFill(0x777777);
	this.lg.drawRect(0, 0, this.options.sideWidth, this.height);
	this.lg.endFill();

	this.lg.beginFill(0x111111);
	this.lg.drawRect(this.options.sideWidth, 0, 1, this.height);
	this.lg.endFill();
}

ProgramRenderer.prototype.buildTimeline = function(){
	var darkBar = false;

	var width = this.width - this.options.sideWidth;

	for (var i = 0; i < this.options.bars; i++) {
		this.lg.beginFill(darkBar ? 0x505050 : 0x4a4a4a);
		this.lg.drawRect(this.options.sideWidth + (width / this.options.bars) * i, 0, width / this.options.bars, this.height);
		this.lg.endFill();

		darkBar = !darkBar;
	}

	for (var i = 0; i < this.options.bars * 4; i++) {
		this.lg.beginFill(0x444444);
		this.lg.drawRect(this.options.sideWidth + (width / this.options.bars) / 4 * i, 0, 1, this.height);
		this.lg.endFill();
	}

	for(var i = 0 ; i < 10; i ++){
		this.lg.beginFill(0x555555);
		this.lg.drawRect(this.options.sideWidth, this.height / 10 * i, width, 1);
		this.lg.endFill();
	}
}

ProgramRenderer.prototype.buildCursor = function(){
	this.cg = new PIXI.Graphics();
	this.stage.addChild(this.cg);

	this.cursor = {
		pos: 0
	}

	this.timeOffset = new Date().getTime();
}

ProgramRenderer.prototype.tick = function(){
	this.time = new Date().getTime() - this.timeOffset;

	this.drawCursor();

}

ProgramRenderer.prototype.drawCursor = function(){
	var cursorMoveTime = this.options.bars * 60 / this.options.bpm * 4

	this.cursor.pos = ((this.time / 1000) % cursorMoveTime) * (100 / cursorMoveTime)

	this.cg.clear();
	this.cg.beginFill(0xdd2222);
	this.cg.drawRect(this.options.sideWidth + ((this.width - this.options.sideWidth) * (this.cursor.pos / 100)), 0, 1, this.height);
	this.cg.endFill();
}