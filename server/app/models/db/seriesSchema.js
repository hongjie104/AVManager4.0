"use strict";

/**
 * 系列数据表
 */
let mongoose      = require('mongoose');
let autoIncrement = require('./db');
let dateUtil      = require('../../../app/utils/dateUtil');

let seriesSchema = new mongoose.Schema({
	name: {type: String, required: true}
}, {collection: "series"});

module.exports = seriesSchema;
