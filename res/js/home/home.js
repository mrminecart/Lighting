const debug = require('debug')("li:client:home");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');

var Home = function() {
	this.init();
}

Home.prototype.init = function() {

	$(".dip-switch").bootstrapSwitch()

	this.buildGrid();

	this.listenForDipSwitch();

	this.listenForNewFixture();
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

	this.fixtures = app.settings.fixtures;

	var gridOptions = {
		cellHeight: 80
	};

	$('.grid-stack').gridstack(gridOptions);

	this.fixtures = GridStackUI.Utils.sort(this.fixtures);

	var grid = $('.grid-stack').data('gridstack');
	grid.removeAll();

	_.each(this.fixtures, function(node) {
		grid.addWidget($('<div><div class="grid-stack-item-content" fid="' + node.id + '">' + node.data.name + '</div></div>'),
			node.x, node.y, node.width, node.height);
	});
}

Home.prototype.saveGrid = function(){
	var res = _.map($('.grid-stack .grid-stack-item:visible'), function (el) {
	    el = $(el);
	    var node = el.data('_gridstack_node');
	    return {
	        id: el.attr('data-custom-id'),
	        x: node.x,
	        y: node.y,
	        width: node.width,
	        height: node.height
	    };
	});
}

Home.prototype.listenForNewFixture = function(){
	$("#add-new-fixture-button").click(function(){

		var output = app.fixture_manager.addFixture({
			channel: $("#new-fixture-channel").val(),
			name: $("#new-fixture-name").val(),
			type: $("#new-fixture-type").val()
		});

		if(output[0] !== 0){
			$("#new-fixture-error").show().text(output[1]);
		}else{
			$("#createFixtureModal").modal("hide")
			$("#new-fixture-error").hide();
		}

	})
}

$(function() {
	new Home();
});