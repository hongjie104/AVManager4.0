"use strict";

exports.toInt = function (val) {
	val = parseInt(val);
	if(isNaN(val)) return 0;
	return val;
};

exports.toFloat = function (val) {
	val = parseFloat(val);
	if(isNaN(val)) return 0;
	return val;
};