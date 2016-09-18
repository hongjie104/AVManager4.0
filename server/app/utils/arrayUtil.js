"use strict";

/**
 * 去掉数组中的重复项
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
exports.unique = function (arr) {
	let result = [], hash = {};
	for (let i = 0, elem; (elem = arr[i]) != null; i++) {
		if (!hash[elem]) {
			result.push(elem);
			hash[elem] = true;
		}
	}
	return result;
};

exports.isArray = function (suspect) {
	return toString.call(suspect)==='[object Array]';
};
