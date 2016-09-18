"use strict";

exports.isPhone = function (phone) {
	return RegExp(/^(0|86|17951)?(13[0-9]|15[012356789]|18[0-9]|14[57]|17[0-9])[0-9]{8}$/).test(phone);
};

exports.isEmail = function (mail) {
	return RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/).test(mail);	
};

/**
 * 验证账号是否合法，因为账号就是手机号码，所以判断手机号就行了
 * @param  {[type]}  account [description]
 * @return {Boolean}         [description]
 */
exports.isLegalAccount = function (account) {
	return RegExp(/^(0|86|17951)?(13[0-9]|15[012356789]|18[0-9]|14[57]|17[0-9])[0-9]{8}$/).test(account);
};

exports.isLegalName = function (name) {
	if (name.includes(' ')) {
		return false;
	}
	const l = name.length;
	if (l > 1 && l < 10) {
		// return RegExp(/^[\u4E00-\u9FA5A-Za-z0-9_]+$/).test(name);
		return true;
	}
	return false;
};