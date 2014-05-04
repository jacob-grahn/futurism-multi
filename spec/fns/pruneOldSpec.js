describe('pruneOld', function () {
    'use strict';

    var pruneOld = require('../../fns/pruneOld');


    var curMs;

    beforeEach(function () {
        curMs = +new Date();
    });


    describe('prune', function () {

        it('should remove dates older than ms old', function () {
            var plays = [
                new Date(curMs - 100000),
                new Date(curMs - 10000),
                new Date(curMs - 1000),
                new Date(curMs),
                new Date(curMs + 1000)
            ];
            var maxAge = 2000;
            
            var pruned = pruneOld.prune(plays, maxAge);
            
            expect(pruned).toEqual([
                new Date(curMs - 1000),
                new Date(curMs),
                new Date(curMs + 1000)
            ]);
        });

        it('should return an empty array for invalid values', function () {
            expect(pruneOld.prune({})).toEqual([]);
            expect(pruneOld.prune('lala')).toEqual([]);
            expect(pruneOld.prune(123)).toEqual([]);
            expect(pruneOld.prune(0)).toEqual([]);
            expect(pruneOld.prune(-123)).toEqual([]);
        });
        
        it('should accept an iterator function', function() {
            var plays = [
                {date: new Date(curMs - 1000)},
                {date: new Date(curMs)},
                {date: new Date(curMs + 1000)}
            ];
            var maxAge = 50;
            
            plays = pruneOld.prune(plays, maxAge, function(obj) {
                return obj.date;
            });
            
            expect(plays).toEqual([
                {date: new Date(curMs)},
                {date: new Date(curMs + 1000)}
            ]);
        });
    });

});