"use strict";

let ActressModel = require("../models/actressModel");
let VideoModel   = require("../models/videoModel");
let numberUtil   = require('../utils/numberUtil');
let jsonUtil     = require('../utils/jsonUtil');
let dateUtil     = require('../utils/dateUtil');
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
		// 按照DMM评分降序
		sortCondition.dmmScore = -1;
	} else if (sortType === 4) {
		// 按照身高排序从大到小排序
		sortCondition.height = -1;
	} else if (sortType === 5) {
		// 按照身高排序从小到大排序
		sortCondition.height = 1;
	} else if (sortType === 6) {
		// 按照生日排序从大到小排序
		sortCondition.birthday = -1;
	} else if (sortType === 7) {
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

exports.getActressedByName = function *() {
	const name = jsonUtil.myDecodeURIComponent(this.params.name);
	const startIndex = numberUtil.toInt(this.params.startIndex);
	const count = numberUtil.toInt(this.params.count);

	let condition = {};
	if (name !== "!") {
		condition.$or = [
			{name: {$regex: name}},
			{alias: {$regex: name}}
		];
	}
	let actresses = yield ActressModel.find(condition).limit(count).skip(startIndex);
	const totalCount = yield ActressModel.count(condition);
	this.body = jsonUtil.createAPI(1, {actress: jsonUtil.actresses2Json(actresses), count: totalCount});
};

exports.getActresVideo = function *() {
	const actressID = this.params.actressID;
	const startIndex = numberUtil.toInt(this.params.startIndex);
	const count = numberUtil.toInt(this.params.count);
	const sortType = numberUtil.toInt(this.params.sortType);

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

	let videoes = yield VideoModel.find({actress: actressID}).sort(sortCondition).limit(count).skip(startIndex);
	let totalCount = yield VideoModel.count({actress: actressID});
	this.body = jsonUtil.createAPI(1, {video: jsonUtil.videoes2Json(videoes), count: totalCount});
};

exports.modifyActress = function *() {
	let arr = this.params.birthday.split('-');
	const birthday = dateUtil.toMongoDate(new Date(arr[0], arr[1], arr[2]));
	yield ActressModel.update({_id: this.params.id}, {$set: {
		alias: this.params.alias === "!" ? "" : jsonUtil.myDecodeURIComponent(this.params.alias),
		birthday: birthday,
		height: numberUtil.toInt(this.params.height),
		bust: numberUtil.toInt(this.params.bust),
		waist: numberUtil.toInt(this.params.waist),
		hip: numberUtil.toInt(this.params.hip),
		score: numberUtil.toInt(this.params.score),
		cup: this.params.cup,
	}});
	let a = yield ActressModel.findOne({_id: this.params.id});
	this.body = jsonUtil.createAPI(1, jsonUtil.actress2Json(a));
};

exports.getLastestActressJavBusNum = function *() {
	let actress = yield ActressModel.find({}, {javBusNum: 1}).sort({javBusNum: -1}).limit(1);
	this.body = jsonUtil.createAPI(1, actress.length > 0 ? actress[0].javBusNum : 0);
};

exports.addActress = function *() {
	let arr = this.params.birthday.split('-');
	const birthday = dateUtil.toMongoDate(new Date(arr[0], arr[1], arr[2]));

	let actress = new ActressModel({
		name: this.params.name,
		alias: this.params.alias === "!" ? "" : this.params.alias,
		birthday: birthday,
		height: numberUtil.toInt(this.params.height),
		bust: numberUtil.toInt(this.params.bust),
		waist: numberUtil.toInt(this.params.waist),
		hip: numberUtil.toInt(this.params.hip),
		cup: this.params.cup,
		javBusCode: this.params.javBusCode,
		javBusNum: parseInt(this.params.javBusCode, 36)
	});
	yield actress.save();
	this.body = jsonUtil.createAPI(1, jsonUtil.actress2Json(actress));
};