'use strict';

var _ = require('lodash');
var futures = require('../../shared/futures');
var refresh = require('../effects/refresh');

var self = {


    activate: function(game) {
        game.eventEmitter.on(game.TURN_END, self.freeLove);
        
        //hacky ass way to get freeLive to run before refresh
        refresh.deactivate(game);
        refresh.activate(game);
    },


    deactivate: function(game) {
        game.eventEmitter.removeListener(game.TURN_END, self.freeLove);
    },


    freeLove: function(game) {
        _.each(game.turnOwners, function(player) {
            _.each(game.board.playerTargets(player._id), function(target) {
                if(target.card && target.card.moves > 0) {
                    target.card.health++;
                }
            });
        });

        game.broadcastChanges(futures.FREE_LOVE);
    }

};

module.exports = self;