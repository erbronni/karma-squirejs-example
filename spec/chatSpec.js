/**
 * @fileoverview Test specifications for the chat module.
 */
define(['Squire'], function (Squire) {

  'use strict';

  describe('Chat test spec', function () {

    it('Should export chat module', function (done) {
      var injector = new Squire(),
        postal = jasmine.createSpyObj('postal', ['subscribe']);
      injector.mock({
        postal: postal
      }).require(['chat'], function (chat) {
        expect(chat).toBeDefined();
        done();
      });
    });

    it('Should subscribe to the public channel', function (done) {
      var injector = new Squire(),
        postal = jasmine.createSpyObj('postal', ['subscribe']);

      injector.mock({
        postal: postal
      }).require(['chat'], function (chat) {
        expect(postal.subscribe).toHaveBeenCalledWith({
          channel: 'public',
          topic: '#',
          callback: chat.publicHandler
        });
        done();
      });
    });

    it('Should subscribe to the private channel', function (done) {
      var injector = new Squire(),
        postal = jasmine.createSpyObj('postal', ['subscribe']);

      injector.mock({
        postal: postal
      }).require(['chat'], function (chat) {
        expect(postal.subscribe).toHaveBeenCalledWith({
          channel: 'private',
          topic: '#',
          callback: chat._privateHandler
        });
        done();
      });
    });

  });

});
