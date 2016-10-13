"use strict";

/**
 * DMM排名数据表
 */
let mongoose      = require('mongoose');
let autoIncrement = require('./db');
let dateUtil      = require('../../../app/utils/dateUtil');

let dmmRankSchema = new mongoose.Schema({
	date: {type: Number, required: true},
	// rank: {type: [{rank: Number, name: String, id: mongoose.Schema.Types.ObjectId}], default: []}
	rank: {type: Number, default: -1},
	name: {type: String, default: ''},
	actressID: {type: mongoose.Schema.Types.ObjectId}
}, {collection: "dmmRank"});

module.exports = dmmRankSchema;
