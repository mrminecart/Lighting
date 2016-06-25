const remote = require('electron').remote;

var debug = require("debug")("li:util:inspector")

document.addEventListener("keydown", function (e) {
	if (e.which === 123) {
		debug("Opening dev tools")
		remote.getCurrentWindow().toggleDevTools();
	} else if (e.which === 116) {
		location.reload();
	}
});