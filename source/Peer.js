/**
 * Handles the XMLHttpPeer and API function calls.
 * @class Peer
 * @for Skylink
 * @since 0.6.0
 */
function Peer (config, listener) {
	'use strict';

	// Reference of instance
	var com = this;

	/**
	 * The peer id.
	 * @attribute id
	 * @type String
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.id = config.id || null;

	/**
	 * The user id that the peer is tied to.
	 * @attribute userId
	 * @type String
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.userId = config.userId;

	/**
	 * The peer type.
	 * - Reference: peerTypes
	 * @attribute type
	 * @type String
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.type = null;

	/**
	 * The PeerConnection constraints.
	 * @attribute constraints
	 * @type String
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.constraints = config.constraints;

	/**
	 * The PeerConnection configuration.
	 * @attribute config
	 * @type String
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.config = config.config || {
		optional: [{
			DtlsSrtpKeyAgreement: true
		}]
	};

	/**
	 * The stream object.
	 * @attribute stream
	 * @type Stream
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.stream = null;

	/**
	 * The list of DataChannels connected to Peer.
	 * @attribute datachannels
	 * @param {DataChannel} main The main DataChannel for sending chats.
	 * @param {JSON} transfers The list of datachannel(s) for transfers.
	 * @param {DataChannel} [transfers.n=*] The DataChannel for sending data.
	 * @type Stream
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.datachannels = {
		main: null,
		transfers: {}
	};

	/**
	 * The PeerConnection object.
	 * @attribute RTCPeerConnection
	 * @type Object
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.RTCPeerConnection = null;

	/**
	 * Starts the peer connection.
	 * @method connect
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Peer
	 * @since 0.6.0
	 */
	com.connect = function (config) {
		var peer  = new window.RTCPeerConnection(com.config, com.constraints);
		com.bind(peer);
	};

	/**
	 * Stops the peer connection.
	 * @method disconnect
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Peer
	 * @since 0.6.0
	 */
	com.disconnect = function (config) {
		com.RTCPeerConnection.close();
	};

	/**
   * Binds events to RTCPeerConnection object.
   * @method bind
   * @trigger StreamJoined, mediaAccessRequired
   * @for Peer
   * @since 0.6.0
   */
  com.bind = function(bindPeer) {
  	bindPeer.ondatachannel = function(event) {
	    //var dc = event.channel || event;
	    com.onDataChannel(event);
	  };

	  bindPeer.onaddstream = function(event) {
	    com.onAddStream(event);
	  };

	  bindPeer.onicecandidate = function(event) {
	    com.onIceCandidate(event, bindPeer);
	  };

	  bindPeer.oniceconnectionstatechange = function(event) {
	    com.onIceConnectionStateChange(event);
	  };

	  // bindPeer.onremovestream = function (event) {};

	  bindPeer.onsignalingstatechange = function() {
	    com.onSignalingStateChange(event);
	  };

	  bindPeer.onicegatheringstatechange = function() {
	    com.onIceGatheringStateChange(event);
	  };
  };

  /**
   * Handles the event when a datachannel is received.
   * @method onDataChannel
   * @trigger StreamJoined, mediaAccessRequired
   * @for Peer
   * @since 0.6.0
   */
  com.onDataChannel = function(event) {
    var received = event.channel || event;

    var channel = new DataChannel(received, null, function (event, data) {
  		listener(event, data);
  	});

    if (channel.label === 'main') {
    	com.datachannels.main = channel;
    } else {
    	com.datachannels.transfers[channel.label] = channel;
    }
  };

  /**
   * Handles the event when a remote stream is received.
   * @method onAddStream
   * @trigger StreamJoined, mediaAccessRequired
   * @for Peer
   * @since 0.6.0
   */
  com.onAddStream = function(event) {
    var received = event.stream || event;

    com.stream = new Stream(received, null, ffunction (event, data) {
  		listener(event, data);
  	});
  };

  /**
   * Handles the event when an ice candidate is received.
   * @method onIceCandidate
   * @trigger StreamJoined, mediaAccessRequired
   * @for Peer
   * @since 0.6.0
   */
  com.onIceCandidate = function(event, bindPeer) {
    var received = event.candidate || event;

    ICE.addCandidate(bindPeer, received);
  };

  /**
   * Handles the event when an ice connection state changes.
   * @method onIceConnectionStateChange
   * @trigger StreamJoined, mediaAccessRequired
   * @for Peer
   * @since 0.6.0
   */
  com.onIceConnectionStateChange = function(event, bindPeer) {
    var state = ICE.parseIceConnectionState(bindPeer.iceConnectionState);
  };

  /**
   * Handles the event when a peer connection state changes.
   * @method onSignalingStateChange
   * @trigger StreamJoined, mediaAccessRequired
   * @for Peer
   * @since 0.6.0
   */
  com.onSignalingStateChange = function(event, bindPeer) {
    var state = bindPeer.signalingState;
  };

  /**
   * Handles the event when an ice gathering state changes.
   * @method onIceGatheringStateChange
   * @trigger StreamJoined, mediaAccessRequired
   * @for Peer
   * @since 0.6.0
   */
  com.onIceGatheringStateChange = function(event, bindPeer) {
    var state = ICE.parseIceGatheringState(bindPeer.iceGatheringState);
  };

	// Throw an error if adapterjs is not loaded
  if (!window.RTCPeerConnection) {
		throw new Error('Required dependency adapterjs not found');
	}
}

function StreamPeer (config, constraints, listener) {
	'use strict';

	// Reference of instance
	var com = this;

	// Inherit reference from parent class
	com = new Peer(config, constraints, listener);

	/**
	 * Sends a stream to peers.
	 * @method connect
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Peer
	 * @since 0.6.0
	 */
	com.sendLocalStream = function (config) {
		var peer  = new window.RTCPeerConnection(com.config, com.constraints);
		com.bind(peer);
	};
}

