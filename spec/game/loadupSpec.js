'use strict';

describe('loadup', function() {

    var mongoose = require('mongoose');
    var mockgoose = require('mockgoose');
    var sinon = require('sinon');
    mockgoose(mongoose);

    var DeckGoose = require('../../shared/models/Deck');
    var CardGoose = require('../../shared/models/Card');
    var Progress = require('../../shared/models/Progress');
    var futures = require('../../shared/futures');
    var Loadup = require('../../game/Loadup');
    var Player = require('../../game/Player');

    var player1;
    var player2;
    var players;
    var rules;
    
    
    describe('selectCards', function() {
        beforeEach(function(done) {
            player1 = new Player({_id:mongoose.Types.ObjectId()});
            player2 = new Player({_id:mongoose.Types.ObjectId()});
            rules = {pride: 10};
            players = [player1, player2];

            DeckGoose.create({_id:'1-deck', userId:player1._id, name:'lotr', cards:['1-card','2-card']}, function(err1){
                DeckGoose.create({_id:'2-deck', userId:player2._id, name:'puppies', cards:['1-card', '1-card', '2-card', '2-card']}, function(err2){
                    CardGoose.create({_id:'1-card', userId:player1._id, name:'Gandalf', attack:1, health:2, abilities:[]}, function(err3){
                        CardGoose.create({_id:'2-card', userId:player2._id, name:'Frodo', attack:1, health:1, abilities:[]}, function(err4){
                            done(err1 || err2 || err3 || err4);
                        });
                    });
                });
            });
        });


        afterEach(function() {
            mockgoose.reset();
        });


        describe('prepareCard', function() {

            var loadup;

            beforeEach(function(done) {
                loadup = new Loadup(players, rules, function(err) {
                    done(err);
                });
            });

            it('should remove duplicate abilities', function() {
                var card = {faction: 'en', abilities: ['siph', 'siph']};
                var gameCard = loadup.prepareCard(card);
                expect(gameCard.abilities).toEqual(['siph']);
            });

            it('should remove abilities that do not belong to that cards faction', function() {
                var card = {faction: 'en', abilities: ['assn', 'tree']};
                var gameCard = loadup.prepareCard(card);
                expect(gameCard.abilities).toEqual(['tree']);
            });

            it('should give the card a cid', function() {
                var card = {faction: 'en', abilities: ['assn', 'tree']};
                var gameCard = loadup.prepareCard(card);
                expect(gameCard.cid).toBeGreaterThan(0);
            });

            it('should set the cards pride cost', function() {
                var card = {faction: 'en', abilities: ['assn', 'tree'], attack: 1, health: 1};
                var gameCard = loadup.prepareCard(card);
                expect(gameCard.pride).toBe(3);
            });

        });


        it('should not to be able to load more than one deck', function(done) {
            var loadup = new Loadup(players, rules, function() {});

            var deckId = '1-deck';
            loadup.selectDeck(player1, deckId, function(err, deck) {
                expect(err).toBe(null);
                expect(deck).toBeTruthy();

                loadup.selectDeck(player1, deckId, function(err) {
                    expect(err).toBe('a deck was already loaded for you');
                    done();
                });
            });
        });


        it('should not be able to load a deck with more cards than is allowed by the rules', function(done) {
            rules.deckSize = -5;
            var loadup = new Loadup( players, rules, function() {});

            var deckId = '1-deck';
            loadup.selectDeck(player1, deckId, function(err) {
                expect(err).toBe('this deck has too many cards');
                done();
            });
        });


        it('everyone loading their deck to trigger the callback', function(done) {
            var loadup = new Loadup(players, rules, function(err, loadedplayers) {
                expect(err).toBeNull();
                expect(loadedplayers.length).toBe(2);
                expect(player1.cards).not.toBeNull();
                done();
            });

            loadup.selectDeck(player1, '1-deck', function(err) {
                expect(err).toBeNull();
            });
            loadup.selectDeck(player2, '2-deck', function(err) {
                expect(err).toBeNull();
            });
        });


        it('deck loading to timeout', function(done) {
            rules.prepTime = 0.1;
            new Loadup(players, rules, function(err, loadedplayers) {
                expect(err).toBeNull();
                expect(loadedplayers.length).toBe(2);
                done();
            });
        });
    });


    
    
    
    describe('selectFutures', function() {
        
        var loadup;
        
        beforeEach(function() {
            sinon.stub(Progress, 'findById').yields(
                null,
                { _id: '535f5314daed8f3230428623', futures: [ futures.EDEN, futures.NUCLEAR_WAR ] }
            );
            loadup = new Loadup([], {futures: 2}, function(err) {
                expect(err).toBe(null);
            });
        });
        
        afterEach(function() {
            Progress.findById.restore();
        });
        
        it('should accept a valid selection', function(done) {
            var player = {};
            var selection = [futures.EDEN, futures.NUCLEAR_WAR];
            loadup.selectFutures(player, selection, function(err) {
                expect(err).toBe(null);
                expect(player.futures).toBe(selection);
                done();
            });
        });
        
        it('should accept less than the max number of futures', function(done) {
            var player = {};
            var selection = [];
            loadup.selectFutures(player, selection, function(err) {
                expect(err).toBe(null);
                expect(player.futures).toBe(selection);
                done();
            });
        });
        
        it('should not accept too many futures', function(done) {
            var player = {};
            var selection = [futures.EDEN, futures.NUCLEAR_WAR, futures.NUCLEAR_WAR];
            loadup.selectFutures(player, selection, function(err) {
                expect(err).toBe('too many futures');
                done();
            });
        });
        
        it('should not accept a non-existant future', function(done) {
            var player = {};
            var selection = ['wwww'];
            loadup.selectFutures(player, selection, function(err) {
                expect(err).toBe('invalid future');
                done();
            });
        });
        
        it('should not accept an un-owned future', function(done) {
            var player = {};
            var selection = [futures.Z_VIRUS];
            loadup.selectFutures(player, selection, function(err) {
                expect(err).toBe('you do not own all of these futures');
                done();
            });
        });
        
    });
    
    
});