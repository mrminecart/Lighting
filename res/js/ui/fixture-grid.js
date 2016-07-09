const debug = require('debug')("li:client:ui:fixture-grid");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');

var FixtureGrid = function() {
	this.init();
}

FixtureGrid.prototype.init = function() {

	this.buildGrid();

	$("#grid-save-button").click(this.saveGrid.bind(this));

	$('.grid-stack').on('change', function(event, items) {
	    $("#grid-save-button").show();
	});
}

FixtureGrid.prototype.buildGrid = function() {

	this.fixtures = app.fixture_manager.fixtures;

	var gridOptions = {
		cellHeight: 80
	};

	$('.grid-stack').gridstack(gridOptions);

	this.fixtures = GridStackUI.Utils.sort(this.fixtures);

	var grid = $('.grid-stack').data('gridstack');
	grid.removeAll();

	_.each(this.fixtures, function(node) {
		
		var html = "";

		html += '<div fid="' + node.id + '">';
		html += '<div class="grid-stack-item-content fixture-widget">' + node.data.name + '</div>';
		html += '</div>';

		grid.addWidget($(html), node.x, node.y, node.width, node.height);
	});
}

FixtureGrid.prototype.saveGrid = function(){
	var res = _.map($('.grid-stack .grid-stack-item:visible'), function (el) {
	    el = $(el);
	    var node = el.data('_gridstack_node');
	    return {
	        id: el.attr('fid'),
	        x: node.x,
	        y: node.y,
	        width: node.width,
	        height: node.height
	    };
	});

	app.fixture_manager.saveFixtureGrid(res);

	$("#grid-save-button").hide();
}

$(document).ready(function(){
	new FixtureGrid();
})