/**
 * Handles the Socket connection.
 * @class Socket
 * @for Skylink
 * @since 0.6.0
 */
function Socket (server, listener) {
	'use strict';

	// Reference of instance
	var com = this;

	/**
	 * The signalling server.
	 * @attribute server
	 * @type String
	 * @private
	 * @for Socket
	 * @since 0.6.0
	 */
	com.server = server;

	/**
	 * The signalling server protocol to connect with.
	 * @attribute protocol
	 * @type String
	 * @private
	 * @for Socket
	 * @since 0.6.0
	 */
	com.protocol = globals.enforceSSL ? 'https:' : window.location.protocol;

	/**
	 * The signalling server port to connect with.
	 * @attribute server
	 * @type String
	 * @private
	 * @for Socket
	 * @since 0.6.0
	 */
	com.port = null;

	/**
	 * The list of available signalling server ports.
	 * @attribute ports
	 * @type JSON
	 * @private
	 * @for Socket
	 * @since 0.6.0
	 */
	com.ports = {
		http: 80,
		https: 443,
		fallbackHttp: 3000,
		fallbackHttps: 3443,
		longPollingHttp: 80,
		longPollingHttps: 443
	};

	/**
	 * The socket configuratin.
	 * @attribute config
	 * @type JSON
	 * @private
	 * @for Socket
	 * @since 0.6.0
	 */
	com.config = {};

	/**
	 * The Socket.io object.
	 * @attribute Socket
	 * @type Object
	 * @private
	 * @for Socket
	 * @since 0.6.0
	 */
	com.Socket = null;

	/**
	 * The responses attached to message events.
	 * @attribute responses
	 * @type JSON
	 * @private
	 * @for Socket
	 * @since 0.6.0
	 */
	com.responses = {};

	/**
	 * Starts the connection to the signalling server
	 * @method connect
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.connect = function () {
		com.Socket = new WebSocket();
	};

	/**
	 * Stops the connection to the Socket.
	 * @method disconnect
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.disconnect = function () {
		com.socket.disconnect();
	};

	/**
	 * Attaches a listener to a particular socket message event received.
	 * @method when
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.when = function(event, callback) {
		com.responses[event] = com.responses[event] || [];
		// Push callback for listening
		com.responses[event].push(callback);
	};

	/**
	 * Sends a socket data.
	 * @method send
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.send = function(data) {
		com.Socket.send( JSON.stringify(data) );
		listener('socket:send');
	};

	/**
	 * Starts the connection to the signalling server
	 * @method onconnect
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.onConnect = function (options) {
		listener('socket:connect');

		com.Socket.on('disconnect', com.onDisconnect);

	  com.Socket.on('message', com.onMessage);
	};

	/**
	 * Starts the connection to the signalling server
	 * @method ondisconnect
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.onDisconnect = function () {
		listener('socket:disconnect');
	};

	/**
	 * Starts the connection to the signalling server
	 * @method onmessage
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.onMessage = function (data) {
		listener('socket:message');

  	var data = JSON.parse;

  	// Check if bulk message
  	if (data.type === 'group') {
  		for (var i = 0; i < data.lists.length; i++) {
	      com.respond(data.lists[i].type, data.lists[i]);
	    }

  	} else {
  		com.respond(data.type, data);
  	}
	};

	/**
	 * Responses to the attached socket message responses.
	 * @method respond
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.respond = function(type, data) {
		// Parse for events tied to type.
		com.responses[type] = com.responses[type] || [];

		for (var i = 0; i < com.responses[type].length; i++) {
			com.responses[type][i](data);
		}
	};

	/**
	 * Starts the connection to the signalling server
	 * @method connect
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.onConnectError = function (type, error) {
		switch (type) {
		case 'WebSocket':
			log.error('Failed initializing WebSocket', error);
			// Disconnect first
			com.Socket.removeAllresponses();
			// Re-initialize as FallbackSocket
			com.Socket = com.FallbackSocket();
			break;

		case 'FallbackSocket':
			log.error('Failed initializing FallbackSocket', error);
			// Disconnect first
			com.Socket.removeAllresponses();
			// Re-initialize as FallbackSocket
			com.Socket = com.LongPollingSocket();
			break;

		case 'LongPollingSocket':
			log.error('Failed initializing LongPollingSocket', error);
			break;
		}
	};

	/**
	 * Creates a WebSocket connection in socket.io.
	 * @method WebSocket
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.WebSocket = function() {
		var options = {
	    forceNew: true,
	    reconnection: false,
	    transports: ['websocket']
	  };

	  if (globals.socketTimeout !== 0) {
	  	options.timeout = globals.socketTimeout;
	  }

		var server = com.protocol + '//' + com.server + ':' +
			(com.protocol === 'https:' ? com.ports.https : com.ports.http);

	  var socket = io.connect(url, options);

	  socket.on('connect', com.onConnect);
		socket.on('connect_error', com.onConnectError);

		return socket;
	};

	/**
	 * Creates a fallback WebSocket connection in socket.io.
	 * @method FallbackSocket
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.FallbackSocket = function(successFn, failureFn) {
		var options = {
	    forceNew: true,
	    reconnection: false,
	    transports: ['websocket']
	  };

	  if (globals.socketTimeout !== 0) {
	  	options.timeout = globals.socketTimeout;
	  }

		var server = com.protocol + '//' + com.server + ':' +
			(com.protocol === 'https:' ? com.ports.fallbackHttps :
			com.ports.fallbackHttp);

	  var socket = io.connect(url, options);

	  socket.on('connect', com.onConnect);
		socket.on('connect_error', com.onConnectError);

		return socket;
	};

	/**
	 * Creates a XHR Long-polling connection in socket.io.
	 * @method LongPollingSocket
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Socket
	 * @since 0.6.0
	 */
	com.LongPollingSocket = function(successFn, failureFn) {
		var options = {
	    forceNew: true,
	    reconnection: true,
	    transports: ['xhr-polling', 'jsonp-polling', 'polling']
	  };

	  if (globals.socketTimeout !== 0) {
	  	options.timeout = globals.socketTimeout;
	  }

		var server = com.protocol + '//' + com.server + ':' +
			(com.protocol === 'https:' ? com.ports.longPollingHttps :
			com.ports.longPollingHttp);

	  var socket = io.connect(url, options);

	  socket.on('connect', com.onConnect);
		socket.on('reconnect', com.onConnect);
		socket.on('connect_error', com.onConnectError);
		socket.on('reconnect_failed', com.onConnectError);

		return socket;
	};

}