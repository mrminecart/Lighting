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
	
	/**
	 * Get Graphics
	 */
	this.lg = new PIXI.Graphics();
	this.cg = new PIXI.Graphics();
	this.stage.addChild(this.lg);
	this.stage.addChild(this.cg);

	/**
	 * Draw
	 */
	this.buildLayout();

	debug("Renderer ready!");
}

ProgramRenderer.prototype.buildStage = function(callback) {

	if(!this.elem){
		callback("No container element supplied!", null);
		return;
	}

	this.width = this.elem.width();
	this.height = 300;

	this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
		backgroundColor: 0x111111
	});

	this.elem.get(0).appendChild(this.renderer.view);

	this.stage = new PIXI.Container();

	this.draw();

	callback(null, null);
}

ProgramRenderer.prototype.listenForResize = function(){
	$(window).on("resize", function(){

		this.width = this.elem.width();

		this.renderer.resize(this.width, this.height)
	}.bind(this))
}

ProgramRenderer.prototype.buildDefaultOptions = function(){
	return {
		bars: 4,
		sideWidth: 300,
		cursor: {
			position: 0
		}
	}
}

ProgramRenderer.prototype.draw = function(){
	this.renderer.render(this.stage);

	requestAnimationFrame(this.draw.bind(this));
}

ProgramRenderer.prototype.buildLayout = function(){
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
		this.lg.drawRect(this.options.sideWidth + (width / this.options.bars) * i, 0, width / this.options.bars, 300);
		this.lg.endFill();

		darkBar = !darkBar;
	}

	for (var i = 0; i < this.options.bars * 4; i++) {
		this.lg.beginFill(0x444444);
		this.lg.drawRect(this.options.sideWidth + (width / this.options.bars) / 4 * i, 0, 1, 300);
		this.lg.endFill();
	}

	for(var i = 0 ; i < 10; i ++){
		this.lg.beginFill(0x555555);
		this.lg.drawRect(this.options.sideWidth, this.height / 10 * i, width, 1);
		this.lg.endFill();
	}
}