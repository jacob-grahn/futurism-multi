'use strict';

var _ = require('lodash');


var playerHasCommander = function(player, board) {
    var handCommanders = _.filter(player.hand, {commander: true});
    var boardCommanders = _.filter(board.playerTargets(player._id), {card: {commander: true}});
    return handCommanders.length || boardCommanders.length;
};

var teamsWithCommanders = function(players, board) {
    var survivingTeams = [];
    _.each(players, function(player) {
        if(playerHasCommander(player, board) ) {
            survivingTeams.push(player.team);
        }
    });
    survivingTeams = _.uniq(survivingTeams);
    return survivingTeams;
};


module.exports = {

    commanderRules: function(game) {

        // make a list of teams that have a surviving commander
        var survivingTeams = teamsWithCommanders(game.players, game.board);
        
        // forfeit players that no longer have a commander
        _.each(game.players, function(player) {
            if(survivingTeams.indexOf(player.team) === -1) {
                game.forfeit(player);
            }
        });

        // if there is only one team left, they win
        if(survivingTeams.length === 1) {
            return {winner: true, team: survivingTeams[0]};
        }
        else {
            return {winner: false};
        }
    }


    /*annihilation: function(players, board) {
        var survivingTeams = [];
        _.each(players, function(player) {
            var targets = board.playerTargets(player._id)
            _.each(targets, function(target) {
                if(target.card) {
                    survivingTeams.push(player.team);
                }
            });
        });
        survivingTeams = _.uniq(survivingTeams);

        if(survivingTeams.length === 1) {
            return {winner: true, team: survivingTeams[0]};
        }
        return {winner: false}
    },*/


    /*prideFest: function(players, board) {
        _.each(players, function(player) {
            if(player.pride >= 100) {
                return {winner: true, team: player.team}
            }
        });
    }*/

};