const debug = require('debug')("li:client:home");
const remote = require('electron').remote;
const app = remote.getGlobal('app_main');

var Home = function() {
	this.init();
}

Home.prototype.init = function() {

	this.listenForNewFixture();

	this.listenForWidgetClick();

	$(".fixture-widget").first().click();

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

	debug(fix);

	// Set dip switch
	$("#home-footer-dip-switch-value").val(fix.data.channel);
	$("#home-footer-dip-switch-value").trigger("input")
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