/**
 * Handles the user information and data.
 * @class User
 * @for Skylink
 * @since 0.6.0
 */
function User(config, listener) {
  'use strict';

  // Reference of instance
  var com = this;

  /**
   * The user id.
   * @attribute id
   * @type String
   * @private
   * @for User
   * @since 0.6.0
   */
  com.id = null;

  /**
   * The user connection id.
   * @attribute connectId
   * @type String
   * @private
   * @for User
   * @since 0.6.0
   */
  com.connectId = config.connectId;

  /**
   * The user token.
   * - Used only for self user object.
   * @attribute token
   * @type String
   * @private
   * @for User
   * @since 0.6.0
   */
  com.token = config.token || null;

  /**
   * The user timestamp (ISO format).
   * - Used only for self user object.
   * @attribute timeStamp
   * @type String
   * @private
   * @for User
   * @since 0.6.0
   */
  com.timeStamp = config.timeStamp || null;

  /**
   * The main peer object that is used for communication.
   * @attribute userPeer
   * @type UserPeer
   * @private
   * @for User
   * @since 0.6.0
   */
  com.userPeer = null;

  /**
   * The stream peer objects that is used for streaming.
   * @attribute streamPeers
   * @param {StreamPeer} [n=*] The peer associated with the user.
   * @type JSON
   * @private
   * @for User
   * @since 0.6.0
   */
  com.streamPeers = {};

  /**
   * The peer configuration.
   * @attribute peerConfig
   * @param {JSON} iceServers The ICE Servers.
   * @type JSON
   * @private
   * @for User
   * @since 0.6.0
   */
  com.peerConstraints = config.peerConstraints;

  /**
   * The peer configuration.
   * @attribute peerConfig
   * @param {JSON} iceServers The ICE Servers.
   * @type JSON
   * @private
   * @for User
   * @since 0.6.0
   */
  com.peerConfig = {};

  /**
   * The user data or information.
   * @attribute data
   * @type JSON | String
   * @private
   * @for User
   * @since 0.6.0
   */
  com.data = config.data || null;


  /**
   * Connects the user to the room.
   * @method connect
   * @param {Function} callback The callback triggered once User has been completed.
   * @trigger peerJoined, mediaAccessRequired
   * @for User
   * @since 0.6.0
   */
  com.connect = function (peerConfig, callback) {
    com.peerConfig = peerConfig;

    com.userPeer = new UserPeer({
      config: peerConfig,
      constraints: com.peerConstraints
    }, function (event, data) {
      listener(event, data)
    });

    com.userPeer.connect(function () {
      callback(com.id, null);
    });
  };

  /**
   * Updates the user data.
   * @method updateData
   * @param {Function} callback The callback triggered once User has been completed.
   * @trigger peerJoined, mediaAccessRequired
   * @for User
   * @since 0.6.0
   */
  com.updateData = function (data, callback) {
    com.data = data;
    callback(data);
  };

  /**
   * Adds a Stream object to the user.
   * @method addStream
   * @param {Function} callback The callback triggered once User has been completed.
   * @trigger peerJoined, mediaAccessRequired
   * @for User
   * @since 0.6.0
   */
  com.addStream = function (options, callback) {
    options.constraints = com.peerConstraints;

    var streamPeer = new StreamPeer(options, function (event, data) {
      listener(event, data);
    });

    streamPeer.connect(function (streamPeerId) {
      com.peers[streamPeerId] = streamPeer;

      callback(com.id, streamPeerId);
    });
  };

  com.removeStream = function (streamPeerId, callback) {
    var streamPeer = com.streamPeers[streamPeerId];

    streamPeer.disconnect(function (streamPeerId) {
      delete com.streamPeers[streamPeerId];

      callback(com.id, streamPeerId);
    });
  };
}