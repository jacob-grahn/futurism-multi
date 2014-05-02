'use strict';

var _ = require('lodash');


var self = {


    activate: function(game) {
        game.eventEmitter.on(game.TURN_BEGIN, self.deBufAllCards);
    },


    deactivate: function(game) {
        game.eventEmitter.removeListener(game.TURN_BEGIN, self.deBufAllCards);
    },


    deBufAllCards: function(game) {
        _.each(game.turnOwners, function(player) {

            // cards on the board
            var targets = game.board.playerTargets(player._id);
            _.each(targets, function(target) {
                if(target.card) {
                    self.deBufCard(target.card);
                }
            });

            // cards in player's hands
            _.each(player.hand, function(card) {
                self.deBufCard(card);
            });

            // cards in player's graveyards
            _.each(player.graveyard, function(card) {
                self.deBufCard(card);
            });
        });

        
        game.broadcastChanges('deBuf');
    },
    
    
    deBufCard: function(card) {
        card.attackBuf = 0;
        card.shield = 0;
        card.hero = 0;
    }
    
    

};

module.exports = self;