'use strict';

var _ = require('lodash');


module.exports = {

    prune: function (dates, maxAge, iterator) {
        var ms, date;
        var minMs = new Date() - maxAge;

        return _.filter(dates, function (dateObj) {
            if (iterator) {
                date = iterator(dateObj);
            }
            else {
                date = dateObj;
            }
            
            if (_.isNumber(date)) {
                ms = date;
            }
            else if (_.isDate(date)) {
                ms = +date;
            }
            else {
                ms = 0;
            }
            
            return (ms > minMs);
        });
    }
};