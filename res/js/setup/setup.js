const debug = require('debug')("li:client:home");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');

var Home = function() {
	this.init();
}

Home.prototype.init = function() {

	this.listenForNewFixture();

	this.listenForWidgetClick();

	this.buildTypeSelector();

	$(".fixture-widget").first().click();

}

Home.prototype.buildTypeSelector = function(){

	var html = '<option value="none_none">Please Select Fixture Type</option>';

	var manufacturers = app.fixture_manager.getTypesGroupByManufacturer();
	var keys = Object.keys(manufacturers);

	for (var i = 0; i < keys.length; i++) {
		html += '<optgroup label="' + keys[i] + '">'

		for (var k = 0; k < manufacturers[keys[i]].length; k++) {
			html += '<option value="' + manufacturers[keys[i]][k].type + '">' + manufacturers[keys[i]][k].name + '</option>';
		}

		html += '</optgroup>'
	}

	$("#new-fixture-type").html(html);
}

Home.prototype.listenForWidgetClick = function(){

	var widgetClick = function(elem){
		$(".fixture-widget").removeClass("active");

		debug(elem.html())

		elem.addClass("active");

		this.displayFixtureInfo(elem.parent().attr("fid"));
	}.bind(this)

	$('.grid-stack').on('dragstart', function(event, ui) {
	    widgetClick($(event.target).find(".fixture-widget"));
	}.bind(this));

	$(document).on("click", ".fixture-widget", function(event){
		widgetClick($(event.target));
	}.bind(this));
}

Home.prototype.displayFixtureInfo = function(fid){
	var fix = app.fixture_manager.getFixture(fid);

	// Set dip switch
	$("#home-footer-dip-switch-value").val(fix.data.channel);
	$("#home-footer-dip-switch-value").trigger("input")

	var channels = app.fixture_manager.fixture_types[fix.data.type].channels;

	// var html = "<h4>" + app.fixture_manager.fixture_types[fix.data.type].name + "</h4>"
	var html = '<table class="table table-bordered"><tr>';

	for (var i = 0; i < channels.length; i++) {
		html += '<th>' + channels[i].name + "</th>"
	}

	html += "</tr><tr>";

	for (var i = 0; i < channels.length; i++) {
		html += '<td>' + channels[i].type + "</td>"
	}

	html += "</tr></table>"

	$("#home-footer-channel-preview").html(html)
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

			// TEMPORARY
			window.location.reload();
		}

	})
}

$(function() {
	new Home();
});