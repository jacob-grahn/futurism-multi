'use strict';

var _ = require('lodash');
var Lobby = require('./lobby');


var freq = 60 * 30 * 1000;
var duration = 30 * 1000;
var io;
var timeoutId;



var notify = function () {
    var time = new Date(new Date().getTime() + freq * 0.25);
    io.sockets.emit('notify', {
        message: 'incomingFracture',
        data: {
            time: time
        }
    });
};


var eventStart = function () {
    io.sockets.emit('notify', {
        message: 'startFracture'
    });
    startFracture();
};


var eventEnd = function () {
    io.sockets.emit('notify', {
        message: 'endFracture'
    });
    endFracture();
};




var notifyTick = function () {
    timeoutId = _.delay(eventStartTick, freq * 0.25);
    notify();
};


var eventStartTick = function () {
    timeoutId = _.delay(eventEndTick, duration);
    eventStart();
};


var eventEndTick = function () {
    timeoutId = _.delay(notifyTick, freq * 0.75);
    eventEnd();
};




var startFracture = function () {
    _.each(Lobby.lookup.toArray(), function(lobby) {
        lobby.createMatchup(null, {
            players: 999,
            fracture: true,
            big: true,
            deckSize: 20,
            futures: 3
        });
    });
};


var endFracture = function () {
    
    // every lobby
    _.each(Lobby.lookup.toArray(), function(lobby) {
        
        // every big matchup
        _.each(lobby.matchups.toArray(), function(matchup) {
            if(matchup.rules.big) {
                
                // split the players up into smaller matchups
                createFractureMatches(lobby, matchup.accounts);
                
                // close the big matchup
                matchup.accounts = [];
                lobby.cleanMatchup(matchup);
            }
        });
    });
};



/**
 * Get all accounts that have joined a big matchup
 */
/*var getEventParticipants = function() {
    var accounts = [];
    
    // every lobby
    _.each(Lobby.lookup, function(lobby) {
        
        // every big matchup
        _.each(lobby.matchups.storage, function(matchup) {
            if(matchup.rules.big) {
                
                // every player in a big matchup
                _.each(matchup.accounts, function(account) {
                    
                    //
                    accounts.push(account);
                });
            }
        });
    });
    
    accounts = uniqueAccoutns(accounts);
    
    return accounts;
};*/



/**
 * Filter out accounts that have the same _id
 */
/*var uniqueAccounts = function(accounts) {
    var dict = {};
    return _.filter(accounts, function(account) {
        var seenBefore = dict[account._id];
        dict[account._id] = true;
        return seenBefore;
    });
};*/



/**
 * Start fracture matches
 */
var createFractureMatches = function (lobby, accounts) {
    var curMatchup;

    _.each(accounts, function (account) {
        if (!curMatchup) {
            curMatchup = lobby.createMatchup(null, {
                players: 2,
                fracture: true,
                deckSize: 20,
                futures: 3
            });
        }
        
        lobby.joinMatchup(account, curMatchup.id);
        
        if(curMatchup.started) {
            curMatchup = null;
        }
    });

};




var self = {

    init: function (_io_) {
        io = _io_;
        self.start();
    },


    start: function () {
        self.stop();
        timeoutId = _.delay(notifyTick, freq * 0.75);
    },


    stop: function () {
        clearTimeout(timeoutId);
    }
};

self.start();


module.exports = self;