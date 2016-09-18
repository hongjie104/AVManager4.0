"use strict";

/**
 * 过滤关键字的算法
 * @example
 * function (sensitive_words, content) {
 * 	let map = _buildMap(sensitive_words.sort());
 * 	let begin = new Date();
 * 	let words = _check(map, content);
 * 	console.log((new Date())-begin);
 * 	console.log(words);
 * }
 */

function _buildMap(wordList) {
	let result = {};
	let count = wordList.length;
	for (let i = 0; i < count; ++i) {
		let map = result;
		let word = wordList[i];
		for (let j = 0; j < word.length; ++j) {
			let ch = word.charAt(j);
			if (typeof(map[ch]) != "undefined") {
				map = map[ch];
				if (map["empty"]) {
					break;
				}
			} else {
				if (map["empty"]) { 
					delete map["empty"]; 
				}
				map[ch] = {"empty": true};
				map = map[ch];
			}
		}
	}
	return result;
}

function _check(map, content) {
	let result = [];
	let count = content.length;
	let stack = [];
	let point = map;

	for (let i = 0; i < count; ++i) {
		let ch = content.charAt(i);
		let item = point[ch];
		if (typeof(item) == "undefined") {
			i = i - stack.length;
			stack = [];
			point = map;
		} else if (item["empty"]) {
			stack.push(ch);
			result.push(stack.join(""));
			stack = [];
			point = map;
		} else {
			stack.push(ch);
			point = item;
		}
	}
	return result;
}

/**
 * 屏蔽的字库
 */
let sensitiveWords = ["互粉"];
let wordMap = _buildMap(sensitiveWords.sort());

/**
 * 获取被屏蔽的关键字
 */
exports.getSensitiveWords = function(content) {
	return _check(wordMap, content);
};