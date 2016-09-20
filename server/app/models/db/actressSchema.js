"use strict";

/**
 * 演员数据表
 */
let mongoose      = require('mongoose');
let autoIncrement = require('./db');
let dateUtil      = require('../../../app/utils/dateUtil');

let userSchema = new mongoose.Schema({
	name: {type: String, required: true},
	alias: {type: String, required: true},
	birthday: {type: Date, default: new Date(1969, 12, 31)},
	height: {type: Number, default: 0},
	bust: {type: Number, default: 0},
	waist: {type: Number, default: 0},
	hip: {type: Number, default: 0},
	cup: {type: String, default: "X"},
	score: {type: Number, default: 0},
	javBusCode: {type: String, require: true}
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
