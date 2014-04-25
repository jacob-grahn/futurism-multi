'use strict';

//--- initialize
var port = process.env.PORT || 9100;

console.log('NODE_ENV: ', process.env.NODE_ENV);
console.log(process.env.APP_NAME + ' listening on port ' + port);

var app = require('http').createServer(function(){});
var io = require('socket.io').listen(app);

app.listen(port);


//--- mongoose connect
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);


//--- redis connect
var redisSession = require('./shared/redisSession');
redisSession.connect(process.env.REDIS_URI);


//--- load multi
var multiInit = require('./init');
var broadcast = require('./broadcast');
var Chat = require('./chat');
var Lobby = require('./lobby');
var eventMatcher = require('./eventMatcher');
var globeListener = require('./globeListener');

eventMatcher.init(io);
multiInit.listenForConnections(io);
broadcast.setIo(io);
globeListener.startListening(io);

module.exports = io;
