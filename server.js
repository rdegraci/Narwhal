// Load the TCP Library
net = require('net');
const io = require('socket.io-client')
const uuidv1 = require('uuid/v1');


var clients = [];
var socket_io_connections = [];
var socket2socketio = {};
var socket_cache = {};

const SERVER = "https://acpt-barzoom.herokuapp.com";

net.createServer(function(socket) {

	socket.name = socket.remoteAddress + ":" + socket.remotePort

	clients.push(socket);

	var socket_io = io.connect(SERVER, {
		reconnect: true
	});

	socket_io_connections.push(socket_io);

	socket2socketio[socket.name] = socket_io;
	socket_io.name = socket.name
	socket_cache[socket.name] = socket


	socket_io.on('connect', function(ss) {
		console.log('Connected to Barzoom!\n');
		var socket = socket_cache[socket_io.name]
		socket.write("Connected to Barzoom\n");
	});

	socket_io.on('disconnect', () => {
		console.log("socketio on disconnect\n");
		
		var socket = socket_cache[socket_io.name]
		socket.write("Disconnected from Barzoom\n");
		socket.close
		

	});

	socket_io.on('/pong', function(msg) {
		console.log("socketio on pong\n");
		
		var socket = socket_cache[socket_io.name]
		socket.write(msg + '\n');
	});


	socket_io.on('/shout', function(msg) {
		console.log("socketio on shout\n");
		
		var socket = socket_cache[socket_io.name]
		socket.write('SHOUT:' + msg + '\n');
	});


	socket_io.on('/info', function(msg) {
		console.log("socketio on info\n");
		
		var socket = socket_cache[socket_io.name]
		socket.write('INFO:' + msg + '\n');
	});

	socket_io.on('/notice', function(msg) {
		
		var d =new Date();
		console.log("socketio on notice" + d.toString() + "\n");
		
		var socket = socket_cache[socket_io.name]
		socket.write('NOTICE:' + msg + '\n');
	});

	socket_io.on('/debug', function(msg) {
		console.log("socketio on debug\n");
		
		var socket = socket_cache[socket_io.name]
		socket.write('DEBUG:' + msg + '\n');
	});

	socket.write("Welcome " + socket.name + "\n");
	//broadcast(socket.name + " joined the chat\n", socket);


	socket.on('data', function(data) {

		if (data == null) {
			return;
		}

		if (data.toString() === 'quit' || data.toString() === 'exit') {
			socket.close;
			return;
		}

		const params = data.toString().split(" ");
		const event = params[0];
		const message = data.toString().split(/ (.+)/)[1];
		
		console.log("socket event = " + event + "socket message = " + message);
		var socket_io = socket2socketio[socket.name]
		socket_io.emit(event, message);

		//broadcast(socket.name + "> " + data, socket);
	});


	socket.on('end', function() {
		console.log("Socket on end\n");
		clients.splice(clients.indexOf(socket), 1);
		socket_io.disconnect();
		socket_io_connections.splice(clients.indexOf(socket_io), 1);
		//broadcast(socket.name + " left the chat.\n");
	});


	function broadcast(message, sender) {
		clients.forEach(function(client) {
			if (client === sender) return;
			client.write(message);
		});

		process.stdout.write(message)
	}

}).listen(5000);


console.log("Socket server running at port 5000\n");
