var remote = require('electron').remote;
var Slider = require('../lib/bootstrap-slider.js');
const debug = require('debug')("li:client:index");
const app = remote.getGlobal('app_main');
var html = "";

var channel_count = 120;

for(var i = 0; i < channel_count; i++){
	html += '<input class="channel-slider" channel="' + i + '" type="text" data-slider-min="0" data-slider-max="255" data-slider-step="1" data-slider-value="0" data-slider-orientation="vertical"/>'
}

$(".channel-bank").html(html)

var sliders = [];

for(var i = 0 ; i < channel_count; i++){
	sliders.push(new Slider('.channel-slider[channel="' + i + '"]', {
		reversed : true,
		tooltip: "hide"
	}).on("slide", function(id){
		return function(value){

			var packet = {};

			packet[id] = value

			app.dmx.set(packet)

		}
	}(i)));
}


debug("Done the slider things");
