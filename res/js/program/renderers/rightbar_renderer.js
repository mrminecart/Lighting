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

	this.rstbg = new PIXI.Graphics();
	this.rstbg.interactive = true;

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

	this.parent.parent.stage.addChild(this.rsbg);
	this.parent.parent.stage.addChild(this.rstbg);

}

RightBarRenderer.prototype.init = function() {
	debug("init...");

	this.xpos = 0;
}

RightBarRenderer.prototype.redraw = function(redraw, initial) {

	debug("Redrawing");

	this.xpos = this.parent.parent.width - this.parent.parent.parent.options.rightSideWidth - this.parent.parent.timelineRenderer.timelineScrollBarWidth;

	this.rsbg.clear();
	this.rstbg.clear();

	this.drawBackground();

	this.drawTimelineBars();

}

RightBarRenderer.prototype.drawTimelineBars = function() {

	for (var i = this.rstbg.children.length - 1; i >= 0; i--) {
		this.rstbg.removeChild(this.rstbg.children[i]);
	};

	for (var i = 0; i < this.parent.parent.parent.timelines.length; i++) {
		var name = this.parent.parent.parent.timelines[i].name;
		var y = this.parent.parent.timelineRenderer.timelineLaneHeight * i;

		this.rstbg.beginFill(0x111111);
		this.rstbg.drawRect(this.xpos, y + this.parent.timelineScroll, this.parent.parent.parent.options.rightSideWidth, this.parent.parent.timelineRenderer.timelineLaneHeight);
		this.rstbg.endFill();

		this.rstbg.beginFill(0x555555);
		this.rstbg.drawRect(this.xpos + 1, y + 1 + this.parent.timelineScroll, this.parent.parent.parent.options.rightSideWidth - 2, this.parent.parent.timelineRenderer.timelineLaneHeight - 2);
		this.rstbg.endFill();

		var text = new PIXI.Text(name, {
			font: '15px Arial',
			fill: 0x888888,
			align: 'left'
		});
		text.x = this.xpos + 5;
		text.y = y + 3 + this.parent.timelineScroll;

		this.rstbg.addChild(text);

	}
}

RightBarRenderer.prototype.drawBackground = function() {
	this.rsbg.beginFill(0x333333);
	this.rsbg.drawRect(this.xpos, 0, this.parent.parent.parent.options.rightSideWidth, this.parent.parent.timelineRenderer.timelineHeight);
	this.rsbg.endFill();

	this.rsbg.beginFill(0x111111);
	this.rsbg.drawRect(this.xpos, 0, 1, this.parent.parent.timelineRenderer.timelineHeight);
	this.rsbg.endFill();

	this.rsbg.hitArea = this.rsbg.getBounds();
}