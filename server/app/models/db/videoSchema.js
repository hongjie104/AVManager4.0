"use strict";

/**
 * 影片数据表
 */
let mongoose      = require('mongoose');
let autoIncrement = require('./db');
let dateUtil      = require('../../../app/utils/dateUtil');

let videoSchema = new mongoose.Schema({
	code: {type: String, required: true, index: true},
	name: {type: String, required: true},
	date: {type: Date, default: new Date(1969, 12, 31)},
	category: {type: [mongoose.Schema.Types.ObjectId], default: []},
	series: {type: mongoose.Schema.Types.ObjectId, required: true},
	actress: {type: [mongoose.Schema.Types.ObjectId], default: []},
	score: {type: Number, default: 0},
	isDesired: {type: Boolean, default: false, index: true}
}, {collection: "video"});

module.exports = videoSchema;
