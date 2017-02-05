const debug = require('debug')("li:client:program:event_handler");

ProgramEventHandler = function(parent) {
	this.parent = parent;

	this.init()
}

ProgramEventHandler.prototype.init = function(){
	debug("Binding events...");

	this.bindEvents();
}

ProgramEventHandler.prototype.bindEvents = function(){
	$("#program-save-button").click(function(){$("#saveProgramModal").modal()});
	$("#confirm-save-program-button").click(this.onSaveButtonClick.bind(this));
}

ProgramEventHandler.prototype.onSaveButtonClick = function(){

	debug("Saving program!");

	let name = $("#save-program-name").val();

	$("#saveProgramModal").modal("hide");
	$("#save-program-name").val("");


	debug("Naming '" + name +"'");


}