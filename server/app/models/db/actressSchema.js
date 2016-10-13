"use strict";

/**
 * 演员数据表
 */
let mongoose      = require('mongoose');
let autoIncrement = require('./db');
let dateUtil      = require('../../../app/utils/dateUtil');

let userSchema = new mongoose.Schema({
	name: {type: String, required: true},
	alias: {type: String, default: ""},
	birthday: {type: Date, default: dateUtil.toMongoDate(new Date(1970, 1, 1))},
	height: {type: Number, default: 0},
	bust: {type: Number, default: 0},
	waist: {type: Number, default: 0},
	hip: {type: Number, default: 0},
	cup: {type: String, default: "X"},
	score: {type: Number, default: 0},
	javBusCode: {type: String, require: true},
	javBusNum: {type: Number, default: 0},
	// dmm排名得分，第一名是100分，第一百名是1分
	dmmScore: {type: Number, default: 0}
}, {collection: "actress"});

// /**
//  * 配置自增长的字段
//  */
// userSchema.plugin(autoIncrement.plugin, {
// 	// model名
// 	model: 'User',
// 	// 自增长字段名
// 	field: 'uid',
// 	// 起始数值
// 	startAt: 1000,
// 	// 自增值
// 	incrementBy: 1
// });

module.exports = userSchema;
