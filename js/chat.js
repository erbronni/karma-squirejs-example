define('chat', ['postal'], function (postal) {

  'use strict';

  /**
   * Centralized event handler for application.
   * @exports chat
   */
  var chat = {
    /**
     * Postal channel.
     */
    CHANNEL: 'public',

    /**
     * Handler for public messages.
     */
    publicHandler: function () {
      console.log('INVOKED PUBLIC HANDLER');
    },

    /**
     * Handler for private messages.
     * @private
     */
    _privateHandler: function () {
      console.log('INVOKED PRIVATE HANDLER');
    }

  };

  // Subscribe to the public channel.
  postal.subscribe({
    channel: chat.CHANNEL,
    topic: '#',
    callback: chat.publicHandler
  });

  // Subscribe tot he private channel
  postal.subscribe({
    channel: 'private',
    topic: '#',
    callback: chat._privateHandler
  });

  return chat;

});
