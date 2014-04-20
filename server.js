'use strict';

//--- initialize
var port = process.env.PORT || 9100;
console.log('NODE_ENV: ', process.env.NODE_ENV);
console.log('futurism-multi listening on port ' + port);
var io = require('socket.io').listen(port);


//--- mongoose connect
var mongoose = require('mongoose');
require('./fns/mongoose/findByIdAndSave').attach(mongoose);
require('./fns/mongoose/findOneAndSave').attach(mongoose);
require('./fns/mongoose/validatedUpdate').attach(mongoose);
mongoose.connect(process.env.MONGO_URI);


//--- redis connect
var redisSession = require('./fns/redisSession');
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
