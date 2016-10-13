"use strict";

let ActressModel = require("../models/actressModel");
let VideoModel   = require("../models/videoModel");
let DMMRankModel = require("../models/dmmRankModel");
let numberUtil   = require('../utils/numberUtil');
let jsonUtil     = require('../utils/jsonUtil');
let dateUtil     = require('../utils/dateUtil');
let mongoose     = require('mongoose');

exports.index = function *() {
	this.body = "this is dmmRank index";
};

/**
 * 添加排名数据
 */
exports.addRank = function *() {
	let date = numberUtil.toInt(this.params.date);
	// 1:nameA&2:nameB
	let rankDataArr = this.params.rankData.split('&');
	let rankIndex = 0, name = "", arr = null, rank = null, actress = null, incVal = 0;
	for (let i = 0; i < rankDataArr.length; i++) {
		arr = rankDataArr[i].split(':');
		rankIndex = numberUtil.toInt(arr[0]);
		name = arr[1];
		rank = yield DMMRankModel.findOne({date: date, rank: rankIndex});
		if (!rank) {
			actress = yield ActressModel.findOne({name: name}, {name: 1});
			if (actress) {
				incVal = 101 - rankIndex;
				yield ActressModel.update({_id: actress._id}, {$inc: {dmmScore: incVal}});
				rank = new DMMRankModel({date: date, rank: rankIndex, name: name, actressID: actress._id});
			} else {
				rank = new DMMRankModel({date: date, rank: rankIndex, name: name, actressID: "000000000000000000000000"});
			}
			rank.save();
		}
	}
	this.body = jsonUtil.createAPI(1, "done");
};