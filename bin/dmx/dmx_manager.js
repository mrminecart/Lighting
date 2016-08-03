const debug = require('debug')("li:dmx:dmx_manager");
const redis = require("redis");
const path = require("path");
const spawn = require('child_process').spawn;

const DmxManager = function() {
	debug("Starting DMX...");

	this.init();
}

DmxManager.prototype.init = function(callback) {

	this.running = true;

	this.landscape = {};
	this.lastlandscape = {};

	this.publisher = redis.createClient();

	this.startPythonWriter();

	setTimeout(function() {
		this.initDMX();

		// this.test();

		this.run();
	}.bind(this), 1000);
}

DmxManager.prototype.startPythonWriter = function() {

	debug("Starting ola writer...");

	this.prc = spawn('python', [path.dirname(__dirname) + '/python/ola_writer.py']);

	this.prc.stdout.setEncoding('utf8');

	this.prc.stdout.on('data', function(data) {
		var str = data.toString()
		var lines = str.split(/(\r?\n)/g);
		debug(lines.join(""));
	});

	this.prc.stderr.on('data', function(data) {
		var str = data.toString()
		var lines = str.split(/(\r?\n)/g);
		debug(lines.join(""));
	});

	this.prc.on('close', function(code) {
		debug("Dmx writer stopped");
	});
}

DmxManager.prototype.stop = function() {

	this.running = false;

	this.initDMX();

	setTimeout(function() {
		this.prc.kill("SIGTERM");

		setTimeout(function() {
			process.exit(0)
		}, 100);
	}.bind(this), 100)
}

DmxManager.prototype.initDMX = function() {
	var data = {};

	for (var i = 0; i < 512; i++) {
		if (!data[i]) data[i] = 1;
	}

	this.landscape = {
		1: data
	};

	this.sendData();
}

DmxManager.prototype.sendData = function() {

	var universes = Object.keys(this.landscape);
	var diff = {};

	for (var u = 0; u < universes.length; u++) {

		if (Object.keys(this.lastlandscape).indexOf(universes[u]) === -1) {
			this.lastlandscape[universes[u]] = {};
		}

		for (var i = 0; i < 512; i++) {

			if (this.landscape[universes[u]][i] !== this.lastlandscape[universes[u]][i]) {

				if (!diff[universes[u]]) {
					diff[universes[u]] = {};
				}

				this.lastlandscape[universes[u]][i] = diff[universes[u]][i] = this.landscape[universes[u]][i];
			}
		}
	}

	if(Object.keys(diff).length > 0){
		// debug(diff)
		this.publisher.publish("dmx_input", JSON.stringify(diff));	
	}
}

DmxManager.prototype.set = function(packet) {
	var universes = Object.keys(packet);

	for (var u = 0; u < universes.length; u++) {
		var channels = Object.keys(packet[universes]);

		for (var c = 0; c < channels.length; c++) {

			if (typeof packet[universes[u]][channels[c]] == "number") {

				this.landscape[universes[u]][channels[c]] = Number.parseInt(packet[universes[u]][channels[c]])

			} else {
				debug("GOT NON NUMBER FOR DMX VALUE!?");
				debug(packet[universes[u]][channels[c]])
			}

		}
	}
}

DmxManager.prototype.run = function() {
	if (!this.running) return;

	this.sendData();

	setTimeout(this.run.bind(this), 1000 / 30);
}

DmxManager.prototype.test = function() {
	this.set({
		0: 255,
		7: 255,
		15: 255,
		6: 255,
		13: 255,
		14: 255
	})

	var x = 0;

	setInterval(function() {
		if (!this.running) return;

		x += 0.1;

		this.set({
			6: Number.parseInt(Math.sin(x) * 256 / 2) + 128,
			13: Number.parseInt(Math.sin(x) * 256 / 2) + 128,
			14: Number.parseInt(Math.sin(x) * 128 / 2) + 128 / 2
		});

	}.bind(this), 1000 / 30);
}

module.exports = DmxManager;