const debug = require('debug')("li:client:program:renderers:rightbar");

RightBarRenderer = function(parent) {
	this.parent = parent;

	this.init()
}

RightBarRenderer.prototype.buildGraphics = function() {
	/**
	 * Right sidebar graphics
	 * @type {PIXI}
	 */
	this.rsbg = new PIXI.Graphics();
	this.rsbg.interactive = true;

	/**
	 * Count as in timeline
	 */

	this.rsbg.hitArea = this.rsbg.getBounds();

	this.rsbg.mouseover = function() {
		setTimeout(function() {
			this.mouseIn = true;
		}.bind(this), 0);

	}

	this.rsbg.mouseout = function() {
		this.mouseIn = false;
	}
	this.parent.stage.addChild(this.rsbg);
}

RightBarRenderer.prototype.init = function() {
	debug("init...");

	this.xpos = 0;
}

RightBarRenderer.prototype.redraw = function(redraw, initial) {

	this.xpos = this.parent.width - this.parent.parent.options.rightSideWidth - this.parent.timelineRenderer.timelineScrollBarWidth;

	this.rsbg.clear()

	this.drawBackground();


}

RightBarRenderer.prototype.drawBackground = function() {
	this.rsbg.beginFill(0x333333);
	this.rsbg.drawRect(this.xpos, 0, this.parent.parent.options.rightSideWidth, this.parent.timelineRenderer.timelineHeight);
	this.rsbg.endFill();

	this.rsbg.beginFill(0x111111);
	this.rsbg.drawRect(this.xpos, 0, 1, this.parent.timelineRenderer.timelineHeight);
	this.rsbg.endFill();
}