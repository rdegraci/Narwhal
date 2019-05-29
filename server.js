// Load the TCP Library
net = require('net');
const io = require('socket.io-client')
const uuidv1 = require('uuid/v1');

// Keep track of the chat clients
var clients = [];

// Keep track of the socket.io connections

var socket_io_connections = [];

var socket2socketio = {};
var socket_cache = {};

// Start a TCP Server
net.createServer(function(socket) {

	// Identify this client
	socket.name = socket.remoteAddress + ":" + socket.remotePort

	// Put this new client in the list
	clients.push(socket);
	
	
	
	//// SOCKET IO

	var socket_io = io.connect('https://acpt-barzoom.herokuapp.com', {reconnect: true});

	socket_io_connections.push(socket_io);
	
	socket2socketio[socket.name] = socket_io;
	socket_io.name = socket.name
	socket_cache[socket.name] = socket

	// Add a connect listener
	socket_io.on('connect', function (ss) {
    		console.log('Connected to Barzoom!\n');
			
			var socket = socket_cache[socket_io.name]
			socket.write("Connected to Barzoom\n");
	});

	socket_io.on('disconnect', () => {
		console.log("socketio on disconnect\n");
		socket_io_connections.splice(clients.indexOf(socket_io), 1);
		
	});

    socket_io.on('/pong', function(msg){
		console.log("socketio on pong\n");
		socket.write(msg);
    });


    socket.on('/shout', function(msg){
		console.log("socketio on shout\n");
		socket.write(msg);
    });
	

    socket.on('/info', function(msg){
		console.log("socketio on info\n");
		socket.write(msg);
    });
	
    socket.on('/notice', function(msg){
		console.log("socketio on notice\n");
		socket.write(msg);
    });
	
    socket.on('/debug', function(msg){
		console.log("socketio on debug\n");
		socket.write(msg);
    });

	// SOCKETS

	// Send a nice welcome message and announce
	socket.write("Welcome " + socket.name + "\n");
	broadcast(socket.name + " joined the chat\n", socket);

	// Handle incoming messages from clients.
	socket.on('data', function(data) {
		
		if (data == null) {
			return;
		}
		
		if (data.toString() === 'quit' || data.toString() === 'exit' ) {
			socket.close;
			return;
		}
		 
		const params = data.toString().split(",");
		const event = params[0];
		const message = data.toString().split(/,(.+)/)[1];
		
		console.log("event =" + event + "message =" + message);
		var socket_io = socket2socketio[socket.name]
		socket_io.emit(event, message);
		
		broadcast(socket.name + "> " + data, socket);
	});

	// Remove the client from the list when it leaves
	socket.on('end', function() {
		console.log("socket on end\n");
		clients.splice(clients.indexOf(socket), 1);
		socket_io.disconnect();
		socket_io_connections.splice(clients.indexOf(socket_io), 1);
		broadcast(socket.name + " left the chat.\n");
	});

	// Send a message to all clients
	function broadcast(message, sender) {
		clients.forEach(function(client) {
			// Don't want to send it to sender
			if (client === sender) return;
			client.write(message);
		});
		// Log it to the server output too
		process.stdout.write(message)
	}

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 5000\n");
