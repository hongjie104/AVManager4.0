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

function _video2Json(video) {
	return {
		_id: video._id,
		name: video.name,
		code: video.code,
		date: dateUtil.toTimestamp(video.date),
		category: video.category,
		series: video.series,
		actress: video.actress,
		score: video.score
	};
}

exports.video2Json = function (video) {
	return _video2Json(video);
};

exports.videoes2Json = function (videoes) {
	let result = [];
	for (let i = 0; i < videoes.length; i++) {
		result[i] = _video2Json(videoes[i]);
	}
	return result;
};

function _category2Json(category) {
	return {
		_id: category._id,
		name: category.name
	};
}

exports.category2Json = function (category) {
	return _category2Json(category);
};

exports.categorys2Json = function (categorys) {
	let result = [];
	for (let i = 0; i < categorys.length; i++) {
		result[i] = _category2Json(categorys[i]);
	}
	return result;
};

function _series2Json(series) {
	return {
		_id: series._id,
		name: series.name
	};
}

exports.series2Json = function (series) {
	return _series2Json(series);
};

exports.serieses2Json = function (serieses) {
	let result = [];
	for (let i = 0; i < serieses.length; i++) {
		result[i] = _series2Json(serieses[i]);
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