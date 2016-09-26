"use strict";

let ActressModel = require("../models/actressModel");
let numberUtil   = require('../utils/numberUtil');
let jsonUtil     = require('../utils/jsonUtil');
let mongoose     = require('mongoose');

exports.index = function *() {
	this.body = "this is actress index";
};

exports.getActress = function *() {
	const startIndex = numberUtil.toInt(this.params.startIndex);
	const count = numberUtil.toInt(this.params.count);
	const sortType = numberUtil.toInt(this.params.sortType);
	const keyWord = jsonUtil.myDecodeURIComponent(this.params.keyWord);

	let condition = {};
	if (keyWord !== "!") {
		condition.$or = [
			{name: {$regex: keyWord}},
			{alias: {$regex: keyWord}}
		];
	}
	let sortCondition = {};
	if (sortType === 1) {
		// 按照评分排序从大到小排序
		sortCondition.score = -1;
	} else if (sortType === 2) {
		// 按照评分排序从小到大排序
		sortCondition.score = 1;
	} else if (sortType === 3) {
		// 按照身高排序从大到小排序
		sortCondition.height = -1;
	} else if (sortType === 4) {
		// 按照身高排序从小到大排序
		sortCondition.height = 1;
	} else if (sortType === 5) {
		// 按照生日排序从大到小排序
		sortCondition.birthday = -1;
	} else if (sortType === 6) {
		// 按照生日排序从小到大排序
		sortCondition.birthday = 1;
	}

	let actresses = yield ActressModel.find(condition).sort(sortCondition).limit(count).skip(startIndex);
	const totalCount = yield ActressModel.count(condition);
	this.body = jsonUtil.createAPI(1, {actress: jsonUtil.actresses2Json(actresses), count: totalCount});
};

exports.getActressedByID = function *() {
	if (this.params.id === "!") {
		this.body = jsonUtil.createAPI(1, []);
	} else {
		const ids = this.params.id.split('&');
		let actresses = yield ActressModel.find({_id: {$in: ids}});
		this.body = jsonUtil.createAPI(1, jsonUtil.actresses2Json(actresses));
	}
};