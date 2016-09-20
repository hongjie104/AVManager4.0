"use strict";

let utils     = require('utility');
let dateUtil  = require('./dateUtil');
let numberUtil = require('./numberUtil');

exports.myDecodeURIComponent = function (str) {
	return decodeURIComponent(str).replace(/`/g, "%");
	return decodeURIComponent(escape(str));
};

exports.createAPI = function (status, jsonData) {
	status = utils.toSafeNumber(status);
	return jsonData ? {
		status: status,
		data: jsonData
	} : {
		status: status
	};
};

function _actress2Json(actress) {
	return {
		_id: actress._id,
		name: actress.name,
		alias: actress.alias,
		birthday: dateUtil.toTimestamp(actress.birthday),
		height: actress.height,
		bust: actress.bust,
		waist: actress.waist,
		hip: actress.hip,
		cup: actress.cup,
		score: actress.score,
		javBusCode: actress.javBusCode,
	};
}

exports.actress2Json = function(actress) {
	return _actress2Json(actress);
};

exports.actresses2Json = function(actresses) {
	let result = [];
	for (let i = 0; i < actresses.length; i++) {
		result[i] = _actress2Json(actresses[i]);
	}
	return result;
};

// function _deepcopy(source) {
// 	let result = source instanceof Array ? [] : {};
// 	let t = null;
// 	for (let key in source) {
// 		t = typeof(source[key]);
// 		if (key === "reply") {
// 			console.log(t);
// 		}
// 		result[key] = t === "object" ? _deepcopy(source[key]): source[key];
// 	}
// 	return result; 
// }

// exports.deepcopy = function (source) {
// 	return _deepcopy(source);
// };