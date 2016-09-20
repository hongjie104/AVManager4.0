"use strict";

let config        = require('../../../config');
let mongoose      = require('mongoose');
let autoIncrement = require('mongoose-auto-increment');

const options = {
	db: {native_parser: true},
	server: { 
		poolSize: 5 ,
		auto_reconnect: true,
		socketOptions: {keepAlive: 1}
	}
};

// autoIncrement.initialize(mongoose.connect(`mongodb://${config.MongoDB.USER}:${config.MongoDB.PWD}@${config.MongoDB.HOST}:${config.MongoDB.PORT}/${config.MongoDB.NAME}`), options);
autoIncrement.initialize(mongoose.connect(`mongodb://${config.MongoDB.HOST}:${config.MongoDB.PORT}/${config.MongoDB.NAME}`));

module.exports = autoIncrement;