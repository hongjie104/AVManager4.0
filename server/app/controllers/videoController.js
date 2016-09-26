"use strict";

let ActressModel = require("../models/actressModel");
let VideoModel   = require("../models/videoModel");
let numberUtil   = require('../utils/numberUtil');
let jsonUtil     = require('../utils/jsonUtil');
let mongoose     = require('mongoose');

exports.getVideo = function *() {
	const startIndex = numberUtil.toInt(this.params.startIndex);
	const count = numberUtil.toInt(this.params.count);
	const sortType = numberUtil.toInt(this.params.sortType);
	const keyWord = jsonUtil.myDecodeURIComponent(this.params.keyWord);

	let condition = {};
	if (keyWord !== "!") {
		condition.code = {$regex: keyWord.toUpperCase()};
	}
	let sortCondition = {};
	if (sortType === 1) {
		// 按照评分排序从大到小排序
		sortCondition.score = -1;
	} else if (sortType === 2) {
		// 按照评分排序从小到大排序
		sortCondition.score = 1;
	} else if (sortType === 3) {
		// 按照生成日期排序从大到小排序
		sortCondition.date = -1;
	} else if (sortType === 4) {
		// 按照生成日期排序从小到大排序
		sortCondition.date = 1;
	} else if (sortType === 5) {
		// 按照番号排序从大到小排序
		sortCondition.code = -1;
	} else if (sortType === 6) {
		// 按照番号排序从小到大排序
		sortCondition.code = 1;
	}

	let videoes = yield VideoModel.find(condition).sort(sortCondition).limit(count).skip(startIndex);
	const totalCount = yield VideoModel.count(condition);
	this.body = jsonUtil.createAPI(1, {video: jsonUtil.videoes2Json(videoes), count: totalCount});
};
