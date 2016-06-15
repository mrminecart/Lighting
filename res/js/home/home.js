const remote = require('electron').remote;
const debug = require('debug')("li:client:index");
const app = remote.getGlobal('app_main');

var Home = function() {
	this.init();
}

Home.prototype.init = function() {
	this.gridOptions = {
		cellHeight: 80
	};

	this.lights = [{
		x: 0,
		y: 0,
		width: 2,
		height: 2,
		some_other_thing: 1
	}, {
		x: 3,
		y: 1,
		width: 1,
		height: 2,
		some_other_thing: 2
	}, {
		x: 1,
		y: 4,
		width: 1,
		height: 1,
		some_other_thing: 3
	}, {
		x: 4,
		y: 1,
		width: 1,
		height: 1,
		some_other_thing: 4
	}, {
		x: 2,
		y: 3,
		width: 3,
		height: 1,
		some_other_thing: 5
	}, {
		x: 1,
		y: 3,
		width: 1,
		height: 1,
		some_other_thing: 6
	}, {
		x: 2,
		y: 4,
		width: 1,
		height: 1,
		some_other_thing: 7
	}, {
		x: 2,
		y: 5,
		width: 1,
		height: 1,
		some_other_thing: 8
	}];

	this.buildGrid();
}

Home.prototype.buildGrid = function() {
	$('.grid-stack').gridstack(this.gridOptions);

	this.lights = GridStackUI.Utils.sort(this.lights);

	var grid = $('.grid-stack').data('gridstack');
	grid.removeAll();

	_.each(this.lights, function(node) {
		grid.addWidget($('<div><div class="grid-stack-item-content" /></div>'),
			node.x, node.y, node.width, node.height);
	});
}

$(function() {
	new Home();
});