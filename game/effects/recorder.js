'use strict';

var Recorder = require('../Recorder');


var self = {


    activate: function (game) {
        game.recorder = new Recorder();
        game.eventEmitter.on(game.PRIZES_SAVED, self.saveRecord);
    },


    deactivate: function (game) {
        game.eventEmitter.removeListener(game.PRIZES_SAVED, self.saveRecord);
    },


    /**
     * save a record of this game
     */
    saveRecord: function (game) {
        game.recorder.users = game.players;
        game.recorder.save(game._id, function (err) {
            if (err) {
                game.emit('error', err);
            }
            game.eventEmitter.emit(game.RECORD_SAVED, game);
        });
    }

};

module.exports = self;