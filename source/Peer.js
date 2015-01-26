/**
 * Handles the Peer connections.
 * @class Peer
 * @for Skylink
 * @since 0.6.0
 */
function Peer(config, listener) {
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
   * The DataChannel connected to PeerConnection.
   * @attribute datachannel
   * @type Peer
   * @private
   * @for Connection
   * @since 0.6.0
   */
  com.datachannel = null;
  
  /**
   * Stores the list DataTransfers.
   * @attribute datatransfers
   * @type Peer
   * @private
   * @for Connection
   * @since 0.6.0
   */
  com.datatransfers = {};

  /**
   * Stores the list of stream object.
   * @attribute streams
   * @type JSON
   * @param {Stream} [n..] The stream object.
   * @private
   * @for Peer
   * @since 0.6.0
   */
  com.streams = {};

  /**
   * Stores the list of the connections.
   * @attribute connections
   * @type JSON
   * @private
   * @for Peer
   * @since 0.6.0
   */
  com.connections = {};
  
  /**
   * Stores the user data.
   * @attribute data
   * @type JSON
   * @private
   * @for Peer
   * @since 0.6.0
   */
  com.data = {};

  /**
   * Starts a DataTransfer.
   * @method transfer
   * @trigger peerJoined, mediaAccessRequired
   * @for Peer
   * @since 0.6.0
   */
  com.transfer = function (data) {
    var transfer = new DataTransfer(null, data, function (event, data) {
      listener(event, data);
    });
  };

  /**
   * Starts a peer connection with the stream.
   * @method disconnect
   * @trigger peerJoined, mediaAccessRequired
   * @for Peer
   * @since 0.6.0
   */
  com.connect = function (stream) {
    var id = Date.UTC();
    var connection = new Connection(stream, {
      id: id
    });
    
    com.connections[id] = connection;
  };

  /**
   * Stops all peer connections.
   * @method disconnect
   * @trigger peerJoined, mediaAccessRequired
   * @for Peer
   * @since 0.6.0
   */
  com.disconnect = function (config) {
    for (var key in com.connections) {
      com.connections.disconnect();
    }
  };

  /**
   * Handles the PeerConnection object.
   * @class Connection
   * @for Peer
   * @since 0.6.0
   */
  com.Connection = function(stream, config) {
    'use strict';

    // Reference of instance
    var subcom = this;

    /**
     * The connection id.
     * @attribute id
     * @type String
     * @private
     * @for Connection
     * @since 0.6.0
     */
    subcom.id = config.id || null;

    /**
     * The peer type.
     * @attribute type
     * @type String
     * @private
     * @for Connection
     * @since 0.6.0
     */
    subcom.type = config.type || 'stream';

    /**
     * The PeerConnection object.
     * @attribute RTCPeerConnection
     * @type JSON
     * @private
     * @for Connection
     * @since 0.6.0
     */
    subcom.RTCPeerConnection = null;

    /**
     * Binds events to RTCPeerConnection object.
     * @method bind
     * @trigger StreamJoined, mediaAccessRequired
     * @for Connection
     * @since 0.6.0
     */
    subcom.bind = function (bindPeer) {
      bindPeer.queueCandidate = [];
      bindPeer.iceConnectionFiredStates = [];
      bindPeer.newSignalingState = 'new';
      bindPeer.newIceConnectionState = 'checking';

      bindPeer.ondatachannel = function (event) {
        //var dc = event.channel || event;
        subcom.onDataChannel(event);
      };

      bindPeer.onaddstream = function (event) {
        subcom.onAddStream(event);
      };

      bindPeer.onicecandidate = function (event) {
        subcom.onIceCandidate(event, bindPeer);
      };

      bindPeer.oniceconnectionstatechange = function (event) {
        ICE.parseIceConnectionState(bindPeer);
      };

      bindPeer.oniceconnectionnewstatechange = function (event) {
        subcom.onIceConnectionStateChange(bindPeer);
      };

      // bindPeer.onremovestream = function (event) {};

      bindPeer.onsignalingstatechange = function (event) {
        bindPeer.newSignalingState = bindPeer.signalingState;
        subcom.onSignalingStateChange(event);
      };

      bindPeer.onicegatheringstatechange = function () {
        subcom.onIceGatheringStateChange(event);
      };
    };

    /**
     * Handles the event when a datachannel is received.
     * @method onDataChannel
     * @trigger StreamJoined, mediaAccessRequired
     * @for Connection
     * @since 0.6.0
     */
    subcom.onDataChannel = function (event) {
      var received = event.channel || event;

      if (channel.label === com.id) {
        com.datachannel = new DataChannel(received, null, function (event, data) {
          listener(event, data);
        });
      
      } else {
        com.datatransfers = new DataTransfer(received, {
          id: channel.label || Date.UTC()
        }, function (event, data) {
          listener(event, data);
        });
      }
    };

    /**
     * Handles the event when a remote stream is received.
     * @method onAddStream
     * @trigger StreamJoined, mediaAccessRequired
     * @for Connection
     * @since 0.6.0
     */
    subcom.onAddStream = function (event) {
      var received = event.stream || event;

      var stream = new Stream(received, null, function(event, data) {
        listener(event, data);
      });
  
      com.streams[stream.id] = stream;

      listener('connection:stream', {});
    };

    /**
     * Handles the event when an ice candidate is received.
     * @method onIceCandidate
     * @trigger StreamJoined, mediaAccessRequired
     * @for Connection
     * @since 0.6.0
     */
    subcom.onIceCandidate = function (event, bindPeer) {
      var received = event.candidate || event;

      ICE.addCandidate(bindPeer, received);
    };

    /**
     * Handles the event when an ice connection state changes.
     * @method onIceConnectionStateChange
     * @trigger StreamJoined, mediaAccessRequired
     * @for Connection
     * @since 0.6.0
     */
    subcom.onIceConnectionStateChange = function (event, bindPeer) {
      listener('peer:iceconnectionstate', {
        id: subcom.id,
        userId: userId,
        state: newState
      });
    };

    /**
     * Handles the event when a peer connection state changes.
     * @method onSignalingStateChange
     * @trigger StreamJoined, mediaAccessRequired
     * @for Connection
     * @since 0.6.0
     */
    subcom.onSignalingStateChange = function (event, bindPeer) {
      var state = bindPeer.signalingState;
      listener('peer:signalingstate', {
        id: subcom.id,
        userId: userId,
        state: state
      });
    };

    /**
     * Handles the event when an ice gathering state changes.
     * @method onIceGatheringStateChange
     * @trigger StreamJoined, mediaAccessRequired
     * @for Peer
     * @since 0.6.0
     */
    subcom.onIceGatheringStateChange = function (event, bindPeer) {
      var state = ICE.parseIceGatheringState(bindPeer.iceGatheringState);
    };

    /**
     * Creates an offer session description.
     * @method createOffer
     * @trigger StreamJoined, mediaAccessRequired
     * @for Connection
     * @since 0.6.0
     */
    subcom.createOffer = function () {
      subcom.RTCPeerConnection.createOffer(function (offer) {
        listener('peer:local_offer:success', offer);

        subcom.setLocalDescription(offer);

      }, function (error) {
        listener('peer:local_offer:failure', error);
      });
    };

    /**
     * Creates an answer session description.
     * @method createAnswer
     * @trigger StreamJoined, mediaAccessRequired
     * @for Connection
     * @since 0.6.0
     */
    subcom.createAnswer = function () {
      subcom.RTCPeerConnection.createAnswer(function (offer) {
        listener('peer:local_answer:success', offer);

        subcom.setLocalDescription(offer);

      }, function (error) {
        listener('peer:local_answer:failure', error);
      });
    };

    /**
     * Sets local description.
     * @method setLocalDescription
     * @for Connection
     * @since 0.6.0
     */
    subcom.setLocalDescription = function (localDescription) {
      var sdpLines = localDescription.sdp.split('\r\n');
      sdpLines = SDP.removeH264Support(sdpLines);

      if (fn.isSafe(function () { return com.stream.config.audio.stereo; ))) {
        sdpLines = SDP.addStereo(sdpLines);
      }
      if (globals.bandwidth) {
        sdpLines = SDP.setBitrate(sdpLines, globals.bandwidth);
      }

      localDescription.sdp = sdpLines.join('\r\n');

      subcom.RTCPeerConnection.setLocalDescription(localDescription, function () {
        listener('peer:local_description:success');

        if (localDescription.type === 'answer') {
          subcom.RTCPeerConnection.newSignalingState = 'have-local-answer';
        }

      }, function (error) {
        listener('peer:local_description:error', error);
      });
    };

    /**
     * Sets remote description.
     * @method setRemoteDescription
     * @for Connection
     * @since 0.6.0
     */
    subcom.setRemoteDescription = function (remoteSdp) {
      var remoteDescription = new window.RTCSessionDescription(remoteSdp);

      com.RTCPeerConnection.setRemoteDescription(remoteDescription, function () {
        listener('peer:remote_description:success');

        if (remoteDescription.type === 'answer') {
          subcom.RTCPeerConnection.newSignalingState = 'have-remote-answer';
        }

      }, function (error) {
        listener('peer:remote_description:error', error);
      });
    };
    
    /**
     * Stops the peer connection.
     * @method disconnect
     * @trigger peerJoined, mediaAccessRequired
     * @for Connection
     * @since 0.6.0
     */
    subcom.disconnect = function () {
      if (subcom.RTCPeerConnection.newSignalingState !== 'closed') {
        subcom.RTCPeerConnection.close();
      }
    };

    var peer = new window.RTCPeerConnection(com.config, com.constraints);

    if (config.stream && !fn.isEmpty(stream)) {
      peer.addStream(stream);
    }

    if (config.dataChannel) {
      var channel = peer.createDataChannel(com.id);

      com.datachannel = new DataChannel(channel, {
        id: com.id,
      }, function(event, data) {
        listener(event, data);
      });
    }
    
    subcom.bind(peer);
  };
  
  // Throw an error if adapterjs is not loaded
  if (!window.RTCPeerConnection) {
    throw new Error('Required dependency adapterjs not found');
  }
}