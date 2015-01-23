/**
 * Stores the preferences shared across classes.
 * @attribute globals
 * @type JSON
 * @param {String} apiKey The developer API Key.
 * @param {String} region The regional server to connect to.
 * @param {String} defaultRoom The default room that joinRoom should connect to.
 * @private
 * @for Skylink
 * @since 0.6.0
 */
var globals = {
  apiKey: null,

  region: 'us2',
  
  defaultRoom: null,

  roomServer: '//api.temasys.com.sg',

  enforceSSL: false,
  
  socketTimeout: 0,
  
  TURNServer: true,
  
  STUNServer: true,
  
  ICETrickle: true,
  
  TURNTransport: 'any',
  
  dataChannel: true,
  
  audioFallback: false,
  
  credentials: null
};