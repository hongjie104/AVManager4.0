"use strict";

let SeriesModel = require("../models/seriesModel");
let numberUtil   = require('../utils/numberUtil');
let jsonUtil     = require('../utils/jsonUtil');

exports.getSeriesByID = function *() {
	const id = this.params.id;
	let series = yield SeriesModel.findOne({_id: id});
	this.body = jsonUtil.createAPI(1, jsonUtil.series2Json(series));
};