(function() {
    'use strict';

    var _ = require('lodash');
    var async = require('async');
    var request = require('request');
    var Elo = require('../fns/elo');
    var Progress = require('../shared/models/Progress');
    var redisClient = require('../shared/redisConnect')(process.env.REDIS_URI);
    var Limiter = require('ratelimiter');
    


    /**
     * Add up all the numbers in an array
     * @param {array.<number>} numbers
     * @returns {number}
     */
    var sum = function(numbers) {
        var sum = 0;
        _.each(numbers, function(number) {
            sum += number;
        });
        return sum;
    };


    /**
     * Load a user from mongo
     * @param {Player} player
     * @param {function} callback
     */
    var loadUser = function(player, callback) {
        Progress.findById(player._id, callback);
    };


    /**
     * Load array of users from mongo
     * @param {array.<Player>} players
     * @param {function} callback
     */
    var loadUsers = function(players, callback) {
        async.map(players, loadUser, callback);
    };


    /**
     * Save changed user data back to mongo
     * @param {Progress} user
     * @param {function} callback
     */
    var saveUser = function(user, callback) {
        user.save(callback);
    };


    /**
     * Save array of users to mongo
     * @param {array.<Progress>} users
     * @param {function} callback
     */
    var saveUsers = function(users, callback) {
        if(users.length === 0) {
            return callback(null);
        }
        async.map(users, saveUser, callback);
    };


    /**
     * Copy data from users to players
     * @param {array.<Player>} players - data coming from a finished game
     * @param {array.<Progress>} users - data from mongo
     */
    var mergeData = function(players, users) {
        var lookup = {};
        _.each(users, function(user) {
            lookup[user._id] = user;
        });

        _.each(players, function(player) {
            var user = lookup[player._id];
            if(user) {
                player.elo = player.oldElo = user.oldElo = user.elo;
                player.fame = player.oldFame = user.oldFame = user.fame;
                player.fractures = player.oldFractures = user.oldFractures = user.fractures;
                player.matchTimes = user.matchTimes;
            }
        });
    };


    /**
     * Copy updated data from users to players
     * @param players
     * @param users
     */
    var mergeChanges = function(players, users) {
        var lookup = {};
        _.each(users, function(user) {
            lookup[user._id] = user;
        });

        _.each(players, function(player) {
            var user = lookup[player._id];
            if(user) {
                user.elo = player.elo;
                user.fame = player.fame;
                user.fractures = player.fractures;
                user.deck = player.deck;
                user.matchTimes = player.matchTimes;
            }
        });
    };


    /**
     * Calculate new elo ratings for all players from this game
     * @param {array.<Player>} players
     * @param {String} winningTeam
     */
    var calcNewElo = function(players, winningTeam) {
        var wElo = [];
        var lElo = [];

        _.each(players, function(player) {
            if(player.team === winningTeam) {
                wElo.push(player.elo);
            }
            else {
                lElo.push(player.elo);
            }
        });

        var avWinElo = sum(wElo) / wElo.length;
        var avLosElo = sum(lElo) / lElo.length;

        var results = Elo.calcChange(avWinElo, avLosElo, 1, 0);

        _.each(players, function(player) {
            if(player.team === winningTeam) {
                if(player.elo < results.a) {
                    player.elo += (results.a-player.elo) / wElo.length;
                }
            }
            else {
                if(player.elo > results.b) {
                    player.elo += (results.b-player.elo) / lElo.length;
                }
            }
        });
    };


    /**
     * Everyone gains some fame, winners gain more
     * @param {array.<Player>} players
     * @param {number} winningTeam
     */
    var calcFame = function(players, winningTeam) {
        _.each(players, function(player) {
            if(player.team === winningTeam) {
                player.fame += player.elo - player.oldElo + module.exports.BASE_FAME_GAIN;
            }
            else {
                player.fame += module.exports.BASE_FAME_GAIN;
            }
        });
    };


    /**
     * Winners get a Time Fracture if this was a prize match
     * @param {array.<Player>} players
     * @param {number} winningTeam
     * @param {bool} prize
     */
    var calcFractures = function(players, winningTeam, prize) {
        if(prize) {
            _.each(players, function(player) {
                if(player.team === winningTeam) {
                    player.fractures++;
                }
            });
        }
    };
    
    
    /**
     * Limit the number of times a player can win fame per day
     */
    var limitPlays = function(players, callback) {
        var oneDay = 1000 * 60 * 60 * 24;
        var max = 60;
        
        async.map(players, function(player, cb) {
            var limitId = 'fm:prizes:' + player._id;
            var limit = new Limiter({ id: limitId, db: redisClient, max: max, duration: oneDay });
            
            limit.get(function(err, count) {
                if (err) {
                    return err;
                }
                if (count.remaining <= 0) {
                    player.rateLimited = true;
                    player.fame = player.oldFame;
                }
                cb();
            });
        },
        function(err) {
            return callback(err);
        });
    };
    
    
    
    var saveGp = function(player) {
        if(!player.guild) {
            return false;
        }
        
        var gp = player.gpGain;
        if(gp > 0) {
            var options = {
                form: {
                    app: process.env.APP_NAME,
                    userId: player._id,
                    inc: gp,
                    key: process.env.GLOBE_KEY
                }
            };
            
            var uri = process.env.GLOBE_URI + '/guilds/' + player.guild + '/members/' + player._id + '/gp';

            request.post(uri, options, function(err) {
                if(err) {
                    console.log('saveGp: ' + err);
                }
            });
        }
    };
    
    
    
    var calcGp = function(players, winningTeam, prize) {
        _.each(players, function(player) {
            var gp = 0;
            if(!player.rateLimited && player.team === winningTeam) {
                if(prize) {
                    gp = 5;
                }
                else {
                    gp = 1;
                }
            }
            player.gpGain = gp;
            saveGp(player);
        });
    };
            


    module.exports = {

        /**
         * The minimum amount of fame gained from completing a match
         */
        BASE_FAME_GAIN: 5,


        /**
         * Load user data from mongo
         * Calculate elo changes and prizes
         * Save updated data to mongo
         * @param {array.<Player>} players
         * @param {String} winningTeam
         * @param {bool} prize
         * @param {function} callback
         */
        run: function(players, winningTeam, prize, callback) {

            loadUsers(players, function(err, users) {
                if(err) {
                    return callback(err);
                }

                users = _.compact(users);
                mergeData(players, users);
                calcNewElo(players, winningTeam);
                calcFame(players, winningTeam);
                calcFractures(players, winningTeam, prize);
                limitPlays(players, function(err) {
                    if(err) {
                        return callback(err);
                    }
                    
                    calcGp(players, winningTeam, prize);
                    mergeChanges(players, users);
                    saveUsers(users, function(err) {
                        if(err) {
                            return callback(err);
                        }
                        return callback(null, users);
                    });
                });
            });
        }

    };

}());