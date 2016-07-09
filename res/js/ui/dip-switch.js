const debug = require('debug')("li:client:ui:dip-switch");

var DipSwitch = function() {
	this.init();
}

DipSwitch.prototype.init = function() {

	$(".dip-switch").bootstrapSwitch()

	this.listenForDipSwitch();
}

DipSwitch.prototype.listenForDipSwitch = function() {
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

DipSwitch.prototype.buildDip = function(elem) {

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

$(document).ready(function(){
	new DipSwitch();
})