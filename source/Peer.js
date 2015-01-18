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
	 * The PeerConnection constraints.
	 * @attribute constraints
	 * @type String
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.config = config.constraints;

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
	 * The PeerConnection object.
	 * @attribute RTCPeerConnection
	 * @type Object
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.RTCPeerConnection = null;

	/**
	 * Starts the connection to the room.
	 * @method connect
	 * @param {Function} callback The callback triggered once Peer has been completed.
	 * @trigger peerJoined, mediaAccessRequired
	 * @for Peer
	 * @since 0.6.0
	 */
	com.connect = function (config, callback) {
		com.RTCPeerConnection = new window.PeerConnection()
	};
}