"use strict";

let ActressModel = require("../models/actressModel");
let numberUtil   = require('../utils/numberUtil');
let jsonUtil     = require('../utils/jsonUtil');
let mongoose     = require('mongoose');

exports.index = function *() {
	this.body = "this is actress index";
};

exports.getActress = function *() {
	let lastID = this.params.lastID;
	if (typeof(lastID) !== "string" || lastID.length !== 24) {
		lastID = "000000000000000000000000";
	}
	lastID = mongoose.Types.ObjectId(lastID);
	const count = numberUtil.toInt(this.params.count);
	let actresses = yield ActressModel.find({_id: {$gt: lastID}}).limit(count);
	this.body = jsonUtil.createAPI(1, jsonUtil.actresses2Json(actresses));
};