"use strict";

let moment     = require('moment');
let numberUtil = require('./numberUtil');

/**
 * 记录在数据库中的当前时间
 */
exports.now = function () {
	// 因为mongo里存的时间啊是UTC +0:00的，而中国是UTC +8:00，所以这里要加8小时
	return moment(new Date()).add(8, 'hours');
};

exports.defaultDay = function () {
	return new Date(2000, 0, 1);
};

exports.toTimestamp = function (date) {
	return date ? numberUtil.toInt(moment(date).subtract(8, 'hours').format('x')) : null;
};

exports.toYYMMDD = function (date) {
	return date ? moment(date).subtract(8, 'hours').format('YYYY-MM-DD') : null;
};

exports.nowTimestamp = function () {
	return new Date().getTime();
};

exports.isBetween = function (startDay, endDay) {
	if (startDay < 1 && endDay < 1) {
		return true;
	}
	const now = numberUtil.toInt(moment().format('YYYYMMDD'));
	return now >= startDay && now <= endDay;
};

const timeStrings = {
	seconds: "1分钟前",
	minute: "1分钟前",
	minutes: "%d分钟前",
	hour: "1小时前",
	hours: "%d小时前",
	day: "1天前",
	days: "%d天前",
	month: "1个月前",
	months: "%d月前",
	year: "1年前",
	years: "%d年前"
};

exports.timeAgo = function (timestamp) {
	let seconds = Math.floor((parseInt(numberUtil.toInt(moment(new Date()).add(8, 'hours').format('x'))) - timestamp) / 1000);
	let minutes = seconds / 60;
	let hours = minutes / 60;
	let days = hours / 24;
	let years = days / 365;

	function substitute (string, number) {
		return string.replace(/%d/i, number);
	}

	let words = seconds < 45 && substitute(timeStrings.seconds, Math.round(seconds)) ||
		seconds < 90 && substitute(timeStrings.minute, 1) ||
		minutes < 45 && substitute(timeStrings.minutes, Math.round(minutes)) ||
		minutes < 90 && substitute(timeStrings.hour, 1) ||
		hours < 24 && substitute(timeStrings.hours, Math.round(hours)) ||
		hours < 48 && substitute(timeStrings.day, 1) ||
		days < 30 && substitute(timeStrings.days, Math.floor(days)) ||
		days < 60 && substitute(timeStrings.month, 1) ||
		days < 365 && substitute(timeStrings.months, Math.floor(days / 30)) ||
		years < 2 && substitute(timeStrings.year, 1) ||
		substitute(timeStrings.years, Math.floor(years));
	return words;
};

exports.strToDate = function (str) {
	return moment(new Date(str)).add(8, 'hours').toDate();
};
