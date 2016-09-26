"use strict";

/**
 * 类别数据表
 */
let mongoose      = require('mongoose');
let autoIncrement = require('./db');
let dateUtil      = require('../../../app/utils/dateUtil');

let categorySchema = new mongoose.Schema({
	name: {type: String, required: true}
}, {collection: "category"});

module.exports = categorySchema;
