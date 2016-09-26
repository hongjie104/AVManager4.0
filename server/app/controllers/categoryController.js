"use strict";

let CategoryModel = require("../models/categoryModel");
let numberUtil   = require('../utils/numberUtil');
let jsonUtil     = require('../utils/jsonUtil');

exports.getCategoryByID = function *() {
	if (this.params.id === "!") {
		this.body = jsonUtil.createAPI(1, []);
	} else {
		const ids = this.params.id.split('&');
		let categorys = yield CategoryModel.find({_id: {$in: ids}});
		this.body = jsonUtil.createAPI(1, jsonUtil.categorys2Json(categorys));
	}
};