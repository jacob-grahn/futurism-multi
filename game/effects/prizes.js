'use strict';

var prizeCalculator = require('../prizeCalculator');


var self = {


    activate: function(game) {
        game.eventEmitter.on(game.END, self.prizes);
    },


    deactivate: function(game) {
        game.eventEmitter.removeListener(game.END, self.prizes);
    },


    /**
     * award prizes
     */
    prizes: function(game) {
        var winningTeam = '';
        if(game.winners.length > 0) {
            winningTeam = game.winners[0].team;
        }
        prizeCalculator.run(game.players, winningTeam, game.rules.fracture, function(err) {
            if(err) {
                game.emit('error', err);
            }
        });
    }

};

module.exports = self;