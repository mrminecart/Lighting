const debug = require('debug')("li:dmx");
const redis = require("redis");
const path = require("path");
const spawn = require('child_process').spawn;

const DmxManager = function(){
	debug("Starting...");

	this.init();
}

DmxManager.prototype.init = function(){
	this.publisher = redis.createClient();

	this.startPythonWriter();

	setTimeout(function(){
		this.initDMX();

		this.test();
	}.bind(this), 1000);
}

DmxManager.prototype.startPythonWriter = function(){

	debug("Starting ola writer...");

	this.prc = spawn('python',  [path.dirname(__dirname) + '/python/ola_writer.py']);

	//noinspection JSUnresolvedFunction
	this.prc.stdout.setEncoding('utf8');

	this.prc.stdout.on('data', function (data) {
	    var str = data.toString()
	    var lines = str.split(/(\r?\n)/g);
	    console.log(lines.join(""));
	});

	this.prc.on('close', function (code) {
	    debug("Dmx writer stopped");
	});
}

DmxManager.prototype.stop = function(){
	this.prc.kill("SIGTERM");
}

DmxManager.prototype.initDMX = function(){
	var data = {};

	for(var i = 0 ; i < 512; i++){
		data[i] = 0;
	}

	this.sendData(data);
}

DmxManager.prototype.sendData = function(data){
	this.publisher.publish("dmx_input", JSON.stringify(data));
}

DmxManager.prototype.test = function(){
	this.sendData({
		0: 255,
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 255,
	})

	var x = 0;

	setInterval(function(){
		x+=0.1;

		this.sendData({6: Number.parseInt(Math.sin(x) * 255 / 2) + 127});

	}.bind(this), 1000/30);
}

module.exports = DmxManager;