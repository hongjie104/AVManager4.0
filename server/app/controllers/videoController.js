"use strict";

let ActressModel = require("../models/actressModel");
let VideoModel   = require("../models/videoModel");
let numberUtil   = require('../utils/numberUtil');
let jsonUtil     = require('../utils/jsonUtil');
let mongoose     = require('mongoose');

exports.getVideo = function *() {
	let targetID = this.params.targetID;
	if (typeof(targetID) !== "string" || targetID.length !== 24) {
		targetID = "000000000000000000000000";
	}
	targetID = mongoose.Types.ObjectId(targetID);
	const count = numberUtil.toInt(this.params.count);
	const isNext = numberUtil.toInt(this.params.isNext) === 1;

	let videoes = isNext ? yield VideoModel.find({_id: {$gt: targetID}}).limit(count) : yield VideoModel.find({_id: {$lt: targetID}}).limit(count).sort({_id: -1});
	if (!isNext) {
		videoes = videoes.reverse();
	}
	const totalCount = yield VideoModel.count();
	this.body = jsonUtil.createAPI(1, {video: jsonUtil.videoes2Json(videoes), count: totalCount});
};

exports.searchCode = function *() {
	let code = this.params.code;
	let targetID = this.params.targetID;
	if (typeof(targetID) !== "string" || targetID.length !== 24) {
		targetID = "000000000000000000000000";
	}
	targetID = mongoose.Types.ObjectId(targetID);
	const count = numberUtil.toInt(this.params.count);
	const isNext = numberUtil.toInt(this.params.isNext) === 1;

	let result = [];
	let totalCount = 0;
	if (code !== "") {
		let videoes = isNext ? yield VideoModel.find({code: {$regex: code.toUpperCase()}, _id: {$gt: targetID}}).limit(count) : yield VideoModel.find({code: {$regex: code.toUpperCase()}, _id: {$lt: targetID}}).limit(count).sort({_id: -1});
		if (!isNext) {
			videoes = videoes.reverse();
		}
		result = jsonUtil.videoes2Json(videoes);

		totalCount = yield VideoModel.count({code: {$regex: code.toUpperCase()}});
	}
	this.body = jsonUtil.createAPI(1, {video: result, count: totalCount});
};