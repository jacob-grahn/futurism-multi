(function() {
    'use strict';

    var _ = require('lodash');


    /**
     * Keep track of who's turn it is
     * mark players with active = true when it is their turn
     * put a time limit on turn durations
     * @param {array.<Player>} players
     * @param {number} timePerTurn
     * @constructor
     */
    var TurnTicker = function(players, timePerTurn) {
        var self = this;
        var running = false;
        var playerCount = players.length;
        var intervalId;
        var beginCallback;
        var endCallback;

        self.turn = 1;
        self.turnOwners = [];
        self.startTime = 0;
        self.timePerTurn = timePerTurn || 30000;


        /**
         * Start turn progression
         * @param {function} [beginCb]
         * @param {function} [endCb]
         */
        self.start = function(beginCb, endCb) {
            beginCallback = beginCb;
            endCallback = endCb;
            running = true;
            nextTurn();
        };


        /**
         * Pause turn progression
         */
        self.stop = function() {
            running = false;
            beginCallback = null;
            endCallback = null;
            clearTimeout(intervalId);
        };


        /**
         * Return how long this turn has lasted
         * @returns {number}
         */
        self.getElapsed = function() {
            return (+new Date()) - self.startTime;
        };
        
        
        /**
         * @returns {Number}
         */
        self.getTimeLeft = function() {
            return self.timePerTurn - self.getElapsed();
        };


        /**
         * Called when a turn is completed
         */
        self.endTurn = function() {
            clearTimeout(intervalId);
            if(running) {
                if(endCallback) {
                    endCallback(self.getElapsed(), self.turnOwners);
                }
                nextTurn();
            }
        };


        /**
         * Test if it is a players turn
         * @param player
         * @returns {boolean}
         */
        self.isTheirTurn = function(player) {
            return (self.turnOwners.indexOf(player) !== -1);
        };

        

        /**
         * select players based on which turn it is
         */
        var getTurnOwners = function(turn) {
            var index = turn % playerCount;
            var player = players[index];
            var owners = [player];
            return owners;
        };


        /**
         * Return an array of userIds that are active this turn
         */
        self.getTurnOwnerIds = function() {
            return _.map(self.turnOwners, function(player) {
                return player._id;
            });
        };


        /**
         * Return numbers of active players there are this turn
         * @param {Number} turn
         * @returns {number}
         */
        self.getActiveTurnOwners = function(turn) {
            var turnOwners = getTurnOwners(turn);
            var activePlayers = _.filter(turnOwners, function(player) {
                return !player.forfeited;
            });
            return activePlayers;
        };


        /**
         * Move a turn to the next player in line
         */
        var nextTurn = function() {
            
            self.turn++;
            while(self.getActiveTurnOwners(self.turn).length === 0 && self.turn < 999) {
                self.turn++;
            }
            
            self.startTime = +new Date();
            self.turnOwners = getTurnOwners(self.turn);
            intervalId = setTimeout(self.endTurn, self.timePerTurn);

            if(beginCallback) {
                beginCallback(self.startTime, self.turnOwners);
            }
        };
    };


    module.exports = TurnTicker;

}());