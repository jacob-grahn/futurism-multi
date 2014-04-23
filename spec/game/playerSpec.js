'use strict';

describe('game/player', function() {

    var Player = require('../../game/Player');

    it('should set up some defaults', function() {
        var account = {
            _id: 1,
            name: 'bob',
            site: 'j'
        };

        var player = new Player(account);

        expect(player._id).toBe(1);
        expect(player.cards).toEqual([]);
    });
});