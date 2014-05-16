'use strict';

/**
 * @class Represents a player in a game
 * @param {object} account
 */
var Player = function(account) {
    console.log('account', account);
    return {
        _id: account._id,
        guild: account.guild,
        team: account._id,
        name: account.name,
        site: account.site,
        hand: [],
        graveyard: [],
        cards: [],
        futures: [],
        pride: 0,
        deckSize: 0,
        deck: {}
    };

};

module.exports = Player;