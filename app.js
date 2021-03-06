var socket_io = require('socket.io');
var http = require('http');
var express = require('express');
var Transform = require('stream').Transform;
var util = require('util');
var split = require("split");

var tailStream = require('tail-stream');
var tail_stream = tailStream.createReadStream('/tmp/log.txt', {interval: 100});

var app = express();

app.use(express.static('public'));

app.get('/_status', function (req, res) {
	console.log("hey");
	res.send("ok");
});

var server = http.createServer(app);
io = socket_io(server);

util.inherits(GetDataStream, Transform);

function GetDataStream() {
	Transform.call(this);
}

io.on('connection', function (socket) {
	console.log("connected");
	socket.on('disconnect', function () {
		console.log("disconnected");
	});
	/*socket.on('message sent', function (data) {
		io.emit('chat1', {message: data.message});
	});*/
});

GetDataStream.prototype._transform = function(line, encoding, processed) {
	var data_to_send;
	var red_color = false, parsed_data;
	var utf_string = line.toString('utf8');
	try {
		parsed_data = JSON.parse(utf_string);
		if (parsed_data.error) {
			red_color = true;
		}
		data_to_send = JSON.stringify(parsed_data, null, 1);
	} catch(e) {
		data_to_send = utf_string;
	}
	io.emit('chat', {message: data_to_send, red: red_color});
	processed();
}

tail_stream.pipe(split()).pipe(new GetDataStream());

server.listen('8081', '0.0.0.0');
