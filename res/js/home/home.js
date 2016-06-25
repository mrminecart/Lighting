const remote = require('electron').remote;
const debug = require('debug')("li:client:home");
const app = remote.getGlobal('app_main');

var Home = function() {
	this.init();
}

Home.prototype.init = function() {

	$(".dip-switch").bootstrapSwitch()

	this.buildGrid();

	this.listenForDipSwitch();
}

Home.prototype.listenForDipSwitch = function() {
	var _this = this;

	$(".dip-switch-input").bind("input", function() {
		_this.buildDip($(this))
	})

	$(".dip-switch").on("switchChange.bootstrapSwitch", function() {
		var value = 0;


		var container = $(this).closest(".dip-switch-container")

		container.find(".dip-switch").each(function() {
			if ($(this).prop("checked")) {
				value += parseInt($(this).attr("channel"));
			}
		})

		container.find(".dip-switch-input").val(value)

	})
}

Home.prototype.buildDip = function(elem) {

	var container = elem.closest(".dip-switch-container")

	var wantedValue = elem.val();
	var curentValue = 0;

	// Clear
	container.find(".dip-switch").each(function() {
		if ($(this).prop("checked")) {
			$(this).click()
		}
	})

	//Set
	$(container.find(".dip-switch").get().reverse()).each(function() {

		if (curentValue + parseInt($(this).attr("channel")) <= wantedValue) {
			$(this).click();

			curentValue += parseInt($(this).attr("channel"));
		}

	})
}

Home.prototype.buildGrid = function() {

	this.lights = [{
		x: 0,
		y: 0,
		width: 1,
		height: 1,
		some_other_thing: 1
	}];

	var gridOptions = {
		cellHeight: 80
	};

	$('.grid-stack').gridstack(gridOptions);

	this.lights = GridStackUI.Utils.sort(this.lights);

	var grid = $('.grid-stack').data('gridstack');
	grid.removeAll();

	_.each(this.lights, function(node) {
		grid.addWidget($('<div><div class="grid-stack-item-content">' + node.some_other_thing + '</div></div>'),
			node.x, node.y, node.width, node.height);
	});
}

$(function() {
	new Home();
});