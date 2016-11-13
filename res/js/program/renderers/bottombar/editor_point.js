const debug = require('debug')("li:client:program:renderers:bottombar:editor_point");

BottomBarEditorPoint = function(parent, specs){

	this.parent = parent;
	this.specs = specs;

	this.init();
}

BottomBarEditorPoint.prototype.init = function(){
	this.g = new PIXI.Graphics();
	this.g.interactive = true;
	this.g.buttonMode = true;

	this.bindEvents();
}

BottomBarEditorPoint.prototype.getGraphics = function(){
	return this.g;
}

BottomBarEditorPoint.prototype.draw = function(){
	this.g.clear();

	this.g.beginFill(parseInt(this.specs.colour.hexString().substring(1), 16));
	this.g.drawRect(this.specs.centerx - this.specs.width / 2, this.specs.centery - this.specs.width / 2, this.specs.width, this.specs.width);
	this.g.endFill();

	this.g.hitArea = this.g.getBounds();
}


BottomBarEditorPoint.prototype.bindEvents = function(){
	this.g.mousedown = this.onMouseDown.bind(this);
	this.g.mouseover = this.onMouseOver.bind(this);
	this.g.mouseout = this.onMouseOut.bind(this);
	this.g.mousemove = this.onMouseMove.bind(this);

	document.body.addEventListener('mouseup', this.onMouseUp.bind(this));
}

BottomBarEditorPoint.prototype.onMouseDown = function(event){
	this.dragging = true;

	this.opos = event.data.getLocalPosition(this.g);
}

BottomBarEditorPoint.prototype.onMouseUp = function(){
	this.dragging = false;
}

BottomBarEditorPoint.prototype.onMouseOver = function(){
	this.mouseOver = true;

	this.g.alpha = 0.8;
}

BottomBarEditorPoint.prototype.onMouseOut = function(){
	this.mouseOver = false;

	this.g.alpha = 1;
}

BottomBarEditorPoint.prototype.onMouseMove = function(event){
	if(!this.dragging) return;

	var newPosition = event.data.getLocalPosition(this.g.parent);

	var x = newPosition.x - this.opos.x;
	var y = newPosition.y - this.opos.y;

	this.g.position.x = x;
	this.g.position.y = y;

	this.updatePattern();
	this.parent.drawPatternLines();
}

BottomBarEditorPoint.prototype.updatePattern = function(){

	var pl = this.parent.parent.getPatternLocationFromPid(this.parent.parent.selectedPattern.id);

	// debug(this.g.position.x);

	this.specs.plot_x = this.specs.centerx //+ this.g.position.x;
	this.specs.plot_y = (1 - (((this.specs.centery - (this.specs.width / 2)) + this.g.position.y - this.parent.parent.timelineRenderer.timelineHeight) / (this.parent.parent.bottomBarHeight - this.specs.width))) * 100;

	// debug(this.parent.parent.timelineRenderer.timelineHeight);

	debug(this.specs.plot_y)

	this.parent.parent.parent.timelines[pl.t].patterns[pl.p].pattern.nodes[this.specs.nodeLoc].y = this.specs.plot_y;
}