'use strict';

var _ = require('lodash');


var self = {


    activate: function(game) {
        game.eventEmitter.on(game.TURN_END, self.prideUp);
        _.each(game.players, function(player) {
            player.pride = game.rules.startPride;
        });
    },


    deactivate: function(game) {
        game.eventEmitter.removeListener(game.TURN_END, self.prideUp);
    },


    prideUp: function(game) {
        _.each(game.turnOwners, function(player) {
            player.pride++;
        });
    }

};

module.exports = self;