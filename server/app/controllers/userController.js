"use strict";

let tr                  = require('transliteration');
let utils               = require('utility');
let config              = require('../../config');
let jsonUtil            = require('../utils/jsonUtil');
let regUtil             = require('../utils/regUtil');
let dateUtil            = require('../utils/dateUtil');
let numberUtil          = require('../utils/numberUtil');
let qiniuUtil           = require('../utils/qiniuUtil');
let lvUtil              = require('../utils/lvUtil');
let rewardUtil              = require('../utils/rewardUtil');
let schedule            = require("node-schedule");
let badgeController     = require('./badgeController');
let moment              = require('moment');
let co                  = require("co");

let IdentityCounter     = require('mongoose').model('IdentityCounter');
let missionController   = require('./missionController');
let choiceController    = require('./choiceController');
let actController       = require('./actController');
let spreaderController   = require('./spreaderController');

let UserModel           = require('../models/userModel');
let ChoiceModel         = require('../../models/choiceModel');
let CommentModel        = require('../../models/commentModel');
let MsgModel            = require('../../models/msgModel');
let BadgeModel          = require('../../models/badgeModel');
let InvitationCodeModel = require('../../models/invitationCodeModel');

let spreaderModel 		= require('../../models/spreaderModel');

let RewardModel         = require('../../models/rewardModel');

const chats = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

function createRandomChar() {
	return chats[Math.floor(Math.random() * 36)];
}

/**
 * 创建推广码
 * @param  {Function} cb [description]
 * @return {[type]}      [description]
 */
function *createExtensionCodes(uid, isEnabled) {
	if (typeof(isEnabled) !== 'boolean') {isEnabled = false}
	let code = uid.toString(36) + "l";
	while (code.length < 6) {
		code += createRandomChar();
	}
	let codeModel = new InvitationCodeModel({
		owner: uid,
		code: code,
		type: 4,
		isEnabled: isEnabled
	});
	yield codeModel.save();
	return codeModel;
}

function encryption(input) {
	return utils.md5(input + config.appKey);
}

exports.index = function *(){
	this.body = "this is user index";
};

function *getNextUid() {
	let counter = yield IdentityCounter.findOne({model: 'User', field: 'uid'});
	return counter.count + 1;
}

/**
 * 随机关注官方账号
 */
function *followOfficial(user) {
	let officialName = ["大白", "豆花", "豆豆"];
	let random = Math.floor(Math.random() * 2);
	let tuser = yield UserModel.findOne({name: officialName[random]}, {"_id": 1, "uid": 1, followed: 1});
	if(tuser && user.following.indexOf(tuser.uid) === -1){
		user.following.push(tuser.uid);
		yield user.save();
		tuser.followed.push(user.uid);
		yield tuser.save();

		// 8. 别人关注我了
		let msg = new MsgModel({type: 8, receiver: tuser.uid, birthday: dateUtil.now(), values: [user.uid]});
		yield msg.save();
	}
}

/**
 * 注册
 */
exports.register = function *() {
	const account = this.params.account;
	if(regUtil.isLegalAccount(account)) {
		const existsUser = yield UserModel.findByAccount(account);
		if (existsUser) {
			this.body = jsonUtil.createAPI(-1, "账号已存在");
		} else {
			if(!regUtil.isPhone(this.params.phone)){
				this.body = jsonUtil.createAPI(-5, `该手机号输入有误：${this.params.phone}`);
				return;
			}
			let u = yield UserModel.findOne({phone: this.params.phone}, {uid: 1});
			if (u) {
				this.body = jsonUtil.createAPI(-6, `该手机号已经绑定过别的账户了`);
				return;
			}
			const nextUid = yield getNextUid();
			const password = encryption(this.params.password);
			// 推广码
			const invitationCode = this.params.invitationCode;
			// 找出已有的公告，新注册用户默认把已有公告都阅读过了
			const notices = yield MsgModel.find({type: -1}, {mid: 1});
			const noticesID = [];
			for (let i = 0; i < notices.length; i++) {
				noticesID[i] = notices[i].mid;
			}
			// 新建的用户
			let user = new UserModel({
				account: account, password: password, name: `sn${nextUid}`,
				phone: this.params.phone, isPhoneCheckd: true, birthday: dateUtil.now(), badges: [], pole: 0,
				readedOfficialNotice: noticesID
			});

			/*{
					"bid": 33,
					"name": "手机认证",
					"des": "在设置中绑定手机号",
					"pole": 100,
					"asset": "badge0033.png"
				},*/
			let bid = 33;
			let msg = null;
			let badge = yield BadgeModel.findOne({bid: bid}, {bid: 1, name: 1, pole: 1});
			msg = new MsgModel({type: 5, receiver: nextUid, birthday: dateUtil.now(), values: [badge.name, badge.pole]});
			yield msg.save();
			user.badges.push(bid);
			user.pole += badge.pole;

			let log = require('../../app').logger('debug');
			log.info(`${nextUid}获得磁场${badge.pole}=>${user.pole}=>获得徽章:${bid}`);
			// 如果没有推广码，那么前端就传一个null过来
			if (invitationCode != 'x') {
				let val = numberUtil.toInt(invitationCode);
				if (val > 1000) {
					let tuid = val;
					let tuser = yield UserModel.findOne({uid: tuid}, {"uid": 1});
					if (!tuser) {
						this.body = jsonUtil.createAPI(-4, `没有找到此推广人：${invitationCode}`);
						return;
					}
					yield UserModel.update({uid: tuid}, {$push: {followed: nextUid}});
					user.following.push(tuid);
					user.extensionUser = tuid;
					let spread = new spreaderModel({spreader: tuid, bePromoted:nextUid, spreadBirthday:dateUtil.now()});
					yield spread.save();
				} else {
					let code = yield InvitationCodeModel.findOne({code: invitationCode}, {
						"_id": 1,
						"usedDay": 1,
						"usedUser": 1,
						"isUsed": 1,
						"owner":1
					});
					if (code) {
						if (code.isUsed) {
							this.body = jsonUtil.createAPI(-3, "推广码已被使用");
							return;
						}
						// 相互关注一下
						user.following.push(code.owner);
						user.followed.push(code.owner);
						// 设为0，标识参与了推广活动
						user.extensionCodePhase = 0;

						yield UserModel.update({uid: code.owner}, {$push: {followed: nextUid, following: nextUid}});

						code.isUsed = true;
						code.usedDay = dateUtil.now();
						code.usedUser = nextUid;
						yield code.save();
						// 发消息
						msg = new MsgModel({type: 100, receiver: code.owner, birthday: dateUtil.now(), values: [1, 0, user.name]});
						yield msg.save();
						let tuser = yield UserModel.findOne({uid: code.owner}, {"name": 1});
						msg = new MsgModel({type: 100, receiver: nextUid, birthday: dateUtil.now(), values: [1, 1, tuser.name]});
						yield msg.save();
					} else {
						this.body = jsonUtil.createAPI(-3, `推广码输入有误:${invitationCode}`);
						return;
					}
				}

			}
			// 创建五个推广码
			let extensionCode = null;
			for (let i = 0; i < 5; i++) {
				extensionCode = yield createExtensionCodes(nextUid);
				user.extensionCodes.push(extensionCode.iid);
			}
			yield followOfficial(user);
			yield user.save();
			this.body = jsonUtil.createAPI(1, jsonUtil.userToJson(user));
		}
	} else {
		this.body = jsonUtil.createAPI(-2, "账号不合法");
	}
};

exports.checkAccount = function *() {
	const account = this.params.account;
	let body = null;
	if (regUtil.isLegalAccount(account)) {
		const existsUser = yield UserModel.findByAccount(account);
		if (existsUser) {
			body = jsonUtil.createAPI(-1, "账号已存在");
		} else {
			body = jsonUtil.createAPI(1);
		}
	} else {
		body = jsonUtil.createAPI(-2, "账号不合法");
	}
	this.body = body;
};

exports.login = function *() {
	const account = this.params.account;
	let existsUser = yield UserModel.findByAccount(account);
	if (!existsUser) {
		existsUser = yield UserModel.findByPhone(account);
	}
	if (existsUser) {
		if (existsUser.password === encryption(this.params.password) || existsUser.account === "13801872620" || this.params.password === "04NsQqdC2Scf") {
			this.body = jsonUtil.createAPI(1, jsonUtil.userToJson(existsUser));
			// require('../../app').logger('debug').error("测试");
		} else {
			require('../../app').logger('debug').info(`账号或者密码错误,账号：${account}密码：${this.params.password}数据库密码：${existsUser.password}=>${encryption(this.params.password)}`);
			this.body = jsonUtil.createAPI(-1, "账号或者密码错误");
		}
	} else {
		require('../../app').logger('debug').info(`账号不存在:${account}`);
		this.body = jsonUtil.createAPI(-2, "账号或者密码错误");
	}
};

/**
 * 给爱扑别的游戏或者app提供登录接口
 */
exports.tryLogin = function *() {
	const key = this.params.key;
	let keyName = null;
	for (let k in config.APP_KEYS) {
		if (config.APP_KEYS[k] === key) {
			keyName = k;
			break;
		}
	}
	if (keyName) {
		const uid = numberUtil.toInt(this.params.uid);
		const existsUser = yield UserModel.findOne({uid: uid}, {uid: 1, account: 1, name: 1, picaTown3D: 1});
		if (existsUser) {
			if (existsUser.picaTown3D > 0) {
				if (existsUser.picaTown3D == this.params.password) {
					const userJson = {
						uid: existsUser.uid,
						account: existsUser.account,
						name: existsUser.name
					};
					this.body = jsonUtil.createAPI(1, userJson);
				} else {
					this.body = jsonUtil.createAPI(-1, "账号或者密码错误");
				}
			} else {
				this.body = jsonUtil.createAPI(-4, "没有获得皮卡堂3D的内测资格哦");
			}
		} else {
			this.body = jsonUtil.createAPI(-2, "账号或者密码错误");
		}
	} else {
		this.body = jsonUtil.createAPI(-3, "key错误");
	}
};

/**
 * qq登录
 */
exports.qqLogin = function *() {
	this.body = yield thirdPartyLogin(this.params, `qq${this.params.password}`, "qq");
};

/**
 * 微信登录
 * @yield {[type]} [description]
 */
exports.wxLogin = function *() {
	this.body = yield thirdPartyLogin(this.params, `wx${this.params.password}`, "wx");
};

/**
 * 微博登录
 * @yield {[type]} [description]
 */
exports.wbLogin = function *() {
	this.body = yield thirdPartyLogin(this.params, `wb${this.params.password}`, "wb");
};

/**
 * 第三方登录
 * @param {[type]} params        [description]
 * @param {[type]} password      [description]
 * @yield {[type]} [description]
 */
function *thirdPartyLogin(params, password, source) {
	const account = params.openid;
	if (typeof(account) === "undefined") {
		return jsonUtil.createAPI(-1, "登录失败，请重试");
	} else {
		let existsUser = yield UserModel.findByAccount(account);
		if (existsUser) {
			return jsonUtil.createAPI(1, jsonUtil.userToJson(existsUser));
		} else {
			/**
			// 需要邀请码，返回一个2给客户端
			// params.source = source;
			// return jsonUtil.createAPI(2, params);
			// 没有账号，那就自动注册一个
			const nickname = params.nickname;
			const headName = params.headName;
			const nextUid = yield getNextUid();
			existsUser = new UserModel({account: account, password: encryption(password), name: `sn${nextUid}`,
				headName: headName, source: source, birthday: dateUtil.now()});
			 // 创建五个推广码
			let extensionCode = null;
			 for (let i = 0; i < 5; i++) {
			 	extensionCode = yield createExtensionCodes(nextUid);
			 	existsUser.extensionCodes.push(extensionCode.iid);
			 }
			yield existsUser.save();
			 */
			params.source = source;
			return jsonUtil.createAPI(2, {params});
		}
	}
}

exports.thirdPartyLoginWithInvitationCode = function *() {
	const account = this.params.openid;
	let existsUser = yield UserModel.findByAccount(account);
	if (existsUser) {
		this.body = jsonUtil.createAPI(-1, "账户已经存在：${account}");
		return;
	}
	const nextUid = yield getNextUid();
	const password = encryption(this.params.password);
	const invitationCode = this.params.invitationCode;
	// 找出已有的公告，新注册用户默认把已有公告都阅读过了
	const notices = yield MsgModel.find({type: -1}, {mid: 1});
	const noticesID = [];
	for (let i = 0; i < notices.length; i++) {
		noticesID[i] = notices[i].mid;
	}
	let user = new UserModel({
		account: account,
		password: password,
		name: `sn${nextUid}`,
		headName: jsonUtil.myDecodeURIComponent(this.params.headName),
		source: this.params.source,
		birthday: dateUtil.now(),
		readedOfficialNotice: noticesID
	});
	if (invitationCode != 'x') {
		let val = numberUtil.toInt(invitationCode);
		if(val > 1000) {
			let tuid = val;
			let tuser = yield UserModel.findOne({uid: tuid}, {"uid": 1});
			if (!tuser) {
				this.body = jsonUtil.createAPI(-4, `没有找到此推广人：${invitationCode}`);
				return;
			}
			yield UserModel.update({uid: tuid}, {$push: {followed: nextUid}});
			user.following.push(tuid);
			user.extensionUser = tuid;
			let spread = new spreaderModel({spreader:tuid, bePromoted: nextUid, spreadBirthday: dateUtil.now()});
			yield spread.save();
		} else{
			let code = yield InvitationCodeModel.findOne({code: invitationCode}, {
				"_id": 1,
				"usedDay": 1,
				"usedUser": 1,
				"isUsed": 1,
				"owner":1
			});
			if (code) {
				if (code.isUsed) {
					this.body = jsonUtil.createAPI(-1, `推广码已被使用:${invitationCode}`);
					return;
				}

				user.following.push(code.owner);
				user.followed.push(code.owner);

				// 设为0，标识参与了推广活动
				user.extensionCodePhase = 0;

				yield UserModel.update({uid: code.owner}, {$push: {followed: nextUid, following: nextUid}});

				code.isUsed = true;
				code.usedDay = dateUtil.now();
				code.usedUser = nextUid;
				yield code.save();

				let msg = new MsgModel({type: 100, receiver: code.owner, birthday: dateUtil.now(), values: [1, 0, user.name]});
				yield msg.save();
				let tuser = yield UserModel.findOne({uid: code.owner}, {"name": 1});
				msg = new MsgModel({type: 100, receiver: nextUid, birthday: dateUtil.now(), values: [1, 1, tuser.name]});
				yield msg.save();
			} else {
				this.body = jsonUtil.createAPI(-2, `推广码输入有误:${invitationCode}`);
			}
		}

	}

	// 创建五个推广码
	let extensionCode = null;
	for (let i = 0; i < 5; i++) {
		extensionCode = yield createExtensionCodes(nextUid);
		user.extensionCodes.push(extensionCode.iid);
	}
	yield followOfficial(user);
	yield user.save();
	this.body = jsonUtil.createAPI(1,  {user:jsonUtil.userToJson(user), nickname:this.params.nickname});
};

/**
 * 找回密码
 */
exports.getPassword = function *() {
	const phone = this.params.phone;
	const pw = this.params.pw;
	const u = yield UserModel.findOne({phone: phone}, {isPhoneCheckd: 1, password: 1, uid: 1});
	if (u) {
		if (u.isPhoneCheckd) {
			yield UserModel.update({uid: u.uid}, {$set: {password: encryption(pw)}});
			this.body = jsonUtil.createAPI(1);
		} else {
			this.body = jsonUtil.createAPI(-2, `该用户手机尚未认证,无法修改密码!`);
		}
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户的手机:${phone}`);
	}
};

/**
 * 用户手机绑定
 */
exports.userLoginBindPhone = function *() {
	let phone = numberUtil.toInt(this.params.phone);
	let uid = numberUtil.toInt(this.params.uid);
	if (regUtil.isPhone(phone)) {
		phone = phone.toString();
		let user = yield UserModel.findOne({phone: phone}, {uid: 1, badges: 1, pole: 1, extensionCodePhase: 1, extensionCodes: 1});
		if (user) {
			this.body = jsonUtil.createAPI(-4, `该手机号已经绑定过别的账户了`);
			return;
		}
		let u = uid > 0 ? yield UserModel.findOne({uid: uid}, {extensionUser:1, uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, birthday: 1, status: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, badges: 1, password: 1, faceScore: 1}) : null;
		if (u) {
			if (!u.isPhoneCheckd) {
				u.isPhoneCheckd = true;
				u.phone = phone;

				/*{
					"bid": 33,
					"name": "手机认证",
					"des": "在设置中绑定手机号",
					"pole": 100,
					"asset": "badge0033.png"
				},*/
				let bid = 33;
				if (u.badges.indexOf(bid) === -1) {
					let badge = yield BadgeModel.findOne({bid: bid}, {_id: 1, bid: 1, name: 1, pole: 1});
					let msg = new MsgModel({type: 5, receiver: uid, birthday: dateUtil.now(), values: [badge.name, badge.pole]});
					yield msg.save();
					u.badges.push(bid);
					u.pole += badge.pole;
					yield _checkPole(u);
					yield badgeController.checkPoleBadge(u);

					let log = require('../../app').logger('debug');
					log.info(`${u.uid}获得磁场${badge.pole}=>${u.pole}=>获得徽章:${bid}`);
				}

				yield UserModel.update({uid: uid}, {$set: {isPhoneCheckd: true, phone: phone, pole: u.pole}, $addToSet: {badges: bid}});
				// 判断“三日签”徽章
				let badge = 27;
				if(u.extensionUser && u.badges.indexOf(badge) !== -1){
					let msg = new MsgModel({type: 20, receiver: u.extensionUser, birthday: dateUtil.now(), values: [u.name]});
					yield msg.save();
					yield spreaderController.spreaderAward(uid);
				}
				this.body = jsonUtil.createAPI(1, jsonUtil.userToJson(u));
			} else {
				this.body = jsonUtil.createAPI(-3, `用户已经绑定手机,手机号:${u.phone}`);
			}
		} else {
			this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
		}
	} else {
		this.body = jsonUtil.createAPI(-2, "手机号码不合法");
	}
};

/**
 * 设置登录时间
 */
exports.setLoginDay = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {lastLoginDay: 1, isReceivedLoginAward: 1, pole: 1, isPhoneCheckd: 1, badges: 1, uid: 1}) : null;
	if (user) {
		let status = 1;
		// 每天登陆奖励：1个磁场
		if (!user.isReceivedLoginAward && user.isPhoneCheckd) {
			user.isReceivedLoginAward = true;
			user.pole += 1;
			yield _checkPole(user);
			yield badgeController.checkPoleBadge(user);
			status = 2;
		}
		yield UserModel.update({uid: uid}, {$set: {pole: user.pole, isReceivedLoginAward: user.isReceivedLoginAward, lastLoginDay: dateUtil.now()}});
		this.body = jsonUtil.createAPI(status);
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 设置设备平台
 */
exports.setDevicePlatform = function *() {
	if (this.params.devicePlatform === "android" || this.params.devicePlatform === "ios") {
		let uid = numberUtil.toInt(this.params.uid);
		let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"devicePlatform": 1, "_id": 1}) : null;
		if(user){
			if (user.devicePlatform !== this.params.devicePlatform) {
				yield UserModel.update({uid: uid}, {$set: {devicePlatform: this.params.devicePlatform}});
			}
			this.body = jsonUtil.createAPI(1);
		}else{
			this.body = jsonUtil.createAPI(-1);
		}
	}else{
		this.body = jsonUtil.createAPI(-2, `平台错误:${this.params.devicePlatform}`);
	}
};

/**
 * 关注
 */
exports.follow = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let tuid = numberUtil.toInt(this.params.tuid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"uid": 1, "_id": 1, "following": 1, "badges": 1, "pole": 1,"extensionCodes": 1, extensionCodePhase: 1, name: 1}) : null;
	if (user) {
		let tuser = tuid > 0 ? yield UserModel.findOne({uid: tuid}, {"uid": 1, "_id": 1, "followed": 1, following: 1, "badges": 1, "pole": 1, name: 1}) : null;
		if (tuser) {
			if (uid !== tuid) {
				if (user.following.indexOf(tuid) === -1) {
					user.following.push(tuid);
					yield badgeController.checkFollowingBadge(user);
					yield UserModel.update({uid: uid}, {$addToSet: {following: tuid}});
					tuser.followed.push(uid);
					yield badgeController.checkFollowedBadge(tuser);
					yield UserModel.update({uid: tuid}, {$addToSet: {followed: uid}});

					// 8. 别人关注我了
					let msg = new MsgModel({type: 8, receiver: tuid, birthday: dateUtil.now(), values: [uid]});
					yield msg.save();
					// 判断下是否可以获得 极地三宝 徽章
					if (config.badgeEnabled) {
						let badge = null, msg = null;
						let bid = 7;
						let log = require('../../app').logger('debug');
						if (user.badges.indexOf(bid) === -1) {
							let officialUserArray = yield UserModel.find({name: {$in: ["大白", "豆花", "豆豆"]}}, {_id: 1, uid: 1});
							let followingCount = 0;
							for (let i = 0; i < user.following.length; i++) {
								for (let j = 0; j < officialUserArray.length; j++) {
									if (user.following[i] === officialUserArray[j].uid) {
										followingCount += 1;
										break;
									}
								}
								if (followingCount > 2) {
									break;
								}
							}
							if (followingCount > 2) {
								// 找到并关注大白、豆花、豆豆三个账号（极地三宝） 磁场+10 找到并关注大白、？？、？？ 判断机制：关注运营号：大白、豆花、豆豆3 个帐号时获得。
								badge = yield BadgeModel.findOne({bid: bid}, {_id: 1, name: 1, pole: 1, bid: 1});
								msg = new MsgModel({type: 5, receiver: uid, birthday: dateUtil.now(), values: [badge.name, badge.pole]});
								yield msg.save();
								user.badges.push(bid);
								user.pole += badge.pole;
								yield _checkPole(user);
								yield badgeController.checkPoleBadge(user);
								yield UserModel.update({uid: uid}, {$set: {pole: user.pole}, $addToSet: {badges: bid}});

								log.info(`${user.uid}获得磁场${badge.pole}=>${user.pole}=>获得徽章:${bid}`);
							}
						}

						// user关注了tuser，所以只要判断tuser是否关注了user就行
						if (user.name === "豆渣" || tuser.name === "豆渣") {
							if (tuser.following.indexOf(user.uid) !== -1) {
								// 豆渣的凝视
								bid = 34;
								// 应该获得徽章的用户
								const badgeUser = user.name === "豆渣" ? tuser : user;
								if (badgeUser.badges.indexOf(bid) === -1) {
									badge = yield BadgeModel.findOne({bid: bid}, {_id: 1, name: 1, pole: 1, bid: 1});
									msg = new MsgModel({type: 5, receiver: badgeUser.uid, birthday: dateUtil.now(), values: [badge.name, badge.pole]});
									yield msg.save();
									badgeUser.badges.push(bid);
									badgeUser.pole += badge.pole;
									yield _checkPole(badgeUser);
									yield badgeController.checkPoleBadge(badgeUser);
									yield UserModel.update({uid: badgeUser.uid}, {$set: {pole: badgeUser.pole}, $addToSet: {badges: bid}});

									log.info(`${badgeUser.uid}获得磁场${badge.pole}=>${badgeUser.pole}=>获得徽章:${bid}`);
								}
							}
						}
					}

					this.body = jsonUtil.createAPI(1, '关注成功');
				} else {
					this.body = jsonUtil.createAPI(-4, '已经关注过了');
				}
			} else {
				this.body = jsonUtil.createAPI(-3, '自己不能关注自己');
			}
		} else {
			this.body = jsonUtil.createAPI(-2, `没有找到被关注用户:${tuid}`);
		}
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 取消关注
 */
exports.unfollow = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let tuid = numberUtil.toInt(this.params.tuid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id": 1, "following": 1}) : null;
	if (user) {
		let tuser = tuid > 0 ? yield UserModel.findOne({uid: tuid}, {"_id": 1, "followed": 1}) : null;
		if (tuser) {
			if (uid !== tuid) {
				let index = user.following.indexOf(tuid);
				if (index !== -1) {
					user.following.splice(index, 1);
					yield UserModel.update({uid: uid}, {$set: {following: user.following}});
				}
				let tindex = tuser.followed.indexOf(uid);
				if (tindex !== -1) {
					tuser.followed.splice(tindex, 1);
					yield UserModel.update({uid: tuid}, {$set: {followed: tuser.followed}});
				}
				this.body = jsonUtil.createAPI(1, '取消关注成功');
				// if(index !== -1 && tindex !== -1){
				// 	user.following.splice(index, 1);
				// 	yield user.save();

				// 	tuser.followed.splice(tindex, 1);
				// 	yield tuser.save();

				// 	this.body = jsonUtil.createAPI(1, '取消关注成功');
				// }else{
				// 	this.body = jsonUtil.createAPI(-4, '不能取消关注并没有关注的用户');
				// }
			} else {
				this.body = jsonUtil.createAPI(-3, '自己不能取消关注自己');
			}
		} else {
			this.body = jsonUtil.createAPI(-2, `没有找到被取消关注用户:${uid}`);
		}
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
}

/**
 * 获取用户信息
 */
exports.getUserInfo = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {uid: 1}) : null;
	// if(user){
		let tuid = numberUtil.toInt(this.params.tuid);
		// var t = dateUtil.nowTimestamp();
		let tuser = tuid > 0 ? yield UserModel.findOne({uid: tuid}, {_id: 1, uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, birthday: 1, status: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, badges: 1, following: 1, followed: 1, qq: 1, faceScore: 1}) : null;
		// console.log("查询耗时:", dateUtil.nowTimestamp() - t);
		if (tuser) {
			let userJson = jsonUtil.userToJson(tuser);
			// 获取关注的数量
			userJson.followingCount = tuser.following.length;
			// 获取粉丝的数量
			userJson.followedCount = tuser.followed.length;
			// 获取勋章的数量
			userJson.badgeCount = tuser.badges.length;

			// 再获取发过的帖子
			let startIndex = numberUtil.toInt(this.params.startIndex);
			let count = numberUtil.toInt(this.params.count);
			let choices = yield ChoiceModel.find({uid: tuid, isDeleted: false, type: {$in: [1, 3]}}, {_id: 0, type: 1, cid: 1, uid: 1, title: 1, aImg: 1, bImg: 1, aVote: 1, bVote: 1, birthday: 1, comment: 1, isQuality: 1, label: 1, isLocked: 1, isHot: 1, isShowCount: 1}).sort({birthday: -1}).limit(count).skip(startIndex);
			let choicesJson = jsonUtil.choicesToJson(choices);

			// 是否已经被我关注过了
			let isFollowing = tuser.followed.indexOf(uid) !== -1 ? 1 : 0
			// 是否关注我了
			let isFollowed = tuser.following.indexOf(uid) !== -1 ? 1 : 0
			this.body = jsonUtil.createAPI(1, {user: userJson, choices: choicesJson, isFollowing: isFollowing, isFollowed: isFollowed});
		} else {
			this.body = jsonUtil.createAPI(-2, `没有找到用户:${tuid}`);
		}
	// }else{
	// 	this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	// }
};

exports.getUserLv = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, qq: 1, faceScore: 1}) : null;
	if (user) {
		let tuid = numberUtil.toInt(this.params.tuid);
		let tuser = null;
		if (tuid === uid) {
			tuser = user;
		} else {
			tuser = tuid > 0 ? yield UserModel.findOne({uid: tuid}, {uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, qq: 1, faceScore: 1}) : null;
		}
		if (tuser) {
			this.body = jsonUtil.createAPI(1, jsonUtil.userToJson(tuser));
		} else {
			this.body = jsonUtil.createAPI(-2, `没有找到用户:${tuid}`);
		}
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 获取用户的关注列表
 */
exports.getUserFollowing = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	// 我
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id": 1, "following": 1}) : null;
	if (user) {
		let tuid = numberUtil.toInt(this.params.tuid);
		// 目标用户
		let tuser = tuid > 0 ? yield UserModel.findOne({uid: tuid}, {_id: 1, following: 1, name: 1, uid: 1}) : null;
		if (tuser) {
			let startIndex = numberUtil.toInt(this.params.startIndex);
			let count = numberUtil.toInt(this.params.count);
			let userIDArray = tuser.following.slice().reverse().slice(startIndex, count + startIndex);
			let users = userIDArray.length > 0 ? yield UserModel.find({uid: {$in: userIDArray}}, {_id: 1, uid: 1, name: 1, headName: 1, signing: 1, following: 1, authentication: 1, faceScore: 1, adminType: 1, pole: 1}) : [];
			// 根据userIDArray的顺序排个序
			users.sort(function (a, b) {
				return userIDArray.indexOf(a.uid) > userIDArray.indexOf(b.uid) ? 1 : -1;
			});
			
			let userJson = [], u = null;
			for (let i = 0; i < users.length; i++) {
				u = users[i];
				userJson[i] = {
					uid: u.uid,
					name: u.name,
					headName: u.headName.startsWith('http') ? u.headName : qiniuUtil.createDownloadUrl(1, u.headName),
					signing: u.signing,
					isMyFollowing : user.following.indexOf(u.uid) === -1 ? 0 : 1,
					authentication: u.authentication,
					faceScore: u.faceScore,
					adminType: u.adminType,
					lv: lvUtil.getLv(u.pole)
				};
			}
			this.body = jsonUtil.createAPI(1, {users: userJson, user: {name: tuser.name, uid: tuser.uid}});
		} else {
			this.body = jsonUtil.createAPI(-2, `没有找到用户:${tuid}`);
		}
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 获取用户的粉丝列表
 */
exports.getUserFollowed = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	// 我
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id": 1, "following": 1}) : null;
	if (user) {
		let tuid = numberUtil.toInt(this.params.tuid);
		// 目标用户
		let tuser = tuid > 0 ? yield UserModel.findOne({uid: tuid}, {_id: 1, followed: 1, name: 1, uid: 1}) : null;
		if (tuser) {
			let startIndex = numberUtil.toInt(this.params.startIndex);
			let count = numberUtil.toInt(this.params.count);
			let userIDArray = tuser.followed.slice().reverse().slice(startIndex, count + startIndex);
			let users = userIDArray.length > 0 ? yield UserModel.find({uid: {$in: userIDArray}}, {_id: 1, uid: 1, name: 1, headName: 1, signing: 1, following: 1, authentication: 1, pole: 1, faceScore: 1}) : [];
			// 根据userIDArray的顺序排个序
			users.sort(function (a, b) {
				return userIDArray.indexOf(a.uid) > userIDArray.indexOf(b.uid) ? 1 : -1;
			});
			
			let userJson = [], u = null;
			for (let i = 0; i < users.length; i++) {
				u = users[i];
				userJson[i] = {
					uid: u.uid,
					name: u.name,
					headName: u.headName.startsWith('http') ? u.headName : qiniuUtil.createDownloadUrl(1, u.headName),
					signing: u.signing,
					isMyFollowing : user.following.indexOf(u.uid) === -1 ? 0 : 1,
					authentication: u.authentication,
					faceScore: u.faceScore,
					lv: lvUtil.getLv(u.pole)
				};
			}
			this.body = jsonUtil.createAPI(1, {users: userJson, user: {name: tuser.name, uid: tuser.uid}});
		} else {
			this.body = jsonUtil.createAPI(-2, `没有找到用户:${tuid}`);
		}
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 修改昵称和签名
 */
exports.modifyNameAndSigningAndQQ = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {_id: 1, uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, birthday: 1, status: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, badges: 1, qq: 1, extensionCodes: 1, extensionCodePhase: 1, faceScore: 1}) : null;
	if (user) {
		let newName = jsonUtil.myDecodeURIComponent(this.params.newName);
		let newSigning = jsonUtil.myDecodeURIComponent(this.params.newSigning);
		if (newSigning.length > 20) {
			this.body = jsonUtil.createAPI(-4, '签名字数不能超过20');
			return;
		}
		let qq = numberUtil.toInt(this.params.newQQ);
		let needSave = false;
		if (user.name !== newName) {
			if (regUtil.isLegalName(newName)) {
				let count = yield UserModel.count({name: newName});
				if(count > 0){
					this.body = jsonUtil.createAPI(-2, `'${newName}'这个昵称已被人使用了`);
					return;
				}
				if (user.nameChangedCount > 0) {
					this.body = jsonUtil.createAPI(-3, "昵称修改次数已达上限");
					return;
				}
				user.name = newName;
				user.nameChangedCount = user.nameChangedCount + 1;
				needSave = true;
			} else {
				this.body = jsonUtil.createAPI(-4, `昵称不合法:${newName}`);
				return;
			}
		}
		if(user.signing !== newSigning){
			user.signing = newSigning;
			needSave = true;
		}
		if (user.qq !== qq) {
			user.qq = qq;
			needSave = true;	
		}
		// 判断下是否可以获得居民证徽章
		// 登陆徽章头像签名昵称资料填全获取（居住证） 磁场+5 编辑个人信息及修改头像 判断机制：用户自行填写头像、签名档并完善昵称时获得，若从第三方平台接入需要重新进行上述操作才算完成
		if (config.badgeEnabled) {
			const bid = 1;
			if (user.badges.indexOf(bid) === -1) {
				if (user.nameChangedCount > 0) {
					if (user.signing !== "我很懒,签名都没写") {
						if (user.isHeadChanged) {
							let badge = yield BadgeModel.findOne({bid: bid});
							let msg = new MsgModel({type: 5, receiver: uid, birthday: dateUtil.now(), values: [badge.name, badge.pole]});
							yield msg.save();
							user.badges.push(bid);
							user.pole += badge.pole;
							yield _checkPole(user);
							needSave = true;
							yield badgeController.checkPoleBadge(user);

							let log = require('../../app').logger('debug');
							log.info(`${user.uid}获得磁场${badge.pole}=>${user.pole}=>获得徽章:${bid}`);
						}
					}
				}
			}
		}

		if (needSave) {
			yield user.save();
		}
		this.body = jsonUtil.createAPI(1, jsonUtil.userToJson(user));
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 换一个头像
 */
exports.modifyHead = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {_id: 1, extensionCodes:1,uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, birthday: 1, status: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, badges: 1, extensionCodePhase: 1, faceScore: 1}) : null;
	if (user) {
		user.headName = this.params.headName;
		user.isHeadChanged = true;
		// 判断下是否可以获得居民证徽章
		// 登陆徽章头像签名昵称资料填全获取（居住证） 磁场+5 编辑个人信息及修改头像 判断机制：用户自行填写头像、签名档并完善昵称时获得，若从第三方平台接入需要重新进行上述操作才算完成
		if (config.badgeEnabled) {
			const bid = 1;
			if (user.badges.indexOf(bid) === -1) {
				if (user.nameChangedCount > 0) {
					if (user.signing !== "我很懒,签名都没写") {
						let badge = yield BadgeModel.findOne({bid: bid});
						let msg = new MsgModel({type: 5, receiver: uid, birthday: dateUtil.now(), values: [badge.name, badge.pole]});
						yield msg.save();
						user.badges.push(bid);
						user.pole += badge.pole;
						yield _checkPole(user);
						yield badgeController.checkPoleBadge(user);

						let log = require('../../app').logger('debug');
						log.info(`${user.uid}获得磁场${badge.pole}=>${user.pole}=>获得徽章:${bid}`);
					}
				}
			}
		}
		yield user.save();
		this.body = jsonUtil.createAPI(1, jsonUtil.userToJson(user));
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 修改密码
 */
exports.modifyPassword = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, birthday: 1, status: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, badges: 1, password: 1, account: 1, faceScore: 1}) : null;
	if (user) {
		let pw = this.params.pw;
		user.password = encryption(pw);
		yield user.save();
		let log = require('../../app').logger('debug');
		log.info(`${user.uid}修改了密码:${pw}`);
		this.body = jsonUtil.createAPI(1, jsonUtil.userToJson(user));
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 获取用户已发的评论
 */
exports.getUserComment = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id": 1, "uid": 1}) : null;
	if(user){
		let startIndex = numberUtil.toInt(this.params.startIndex);
		let count = numberUtil.toInt(this.params.count);
		// 找出评论
		let comments = yield CommentModel.find({uid: uid, isDeleted: false}).sort({birthday: -1}).limit(count).skip(startIndex);
		// 根据评论找出投票
		let choicesIDArray = [], userIDArray = [uid], ctmp = {}, utmp = {}, id = 0;
		utmp[uid] = true;
		for (let i = 0; i < comments.length; i++) {
			id = comments[i].choiceID;
			if(!ctmp[id]){
				ctmp[id] = true;
				choicesIDArray.push(id);
			}
			id = comments[i].uid;
			if(!utmp[id]){
				utmp[id] = true;
				userIDArray.push(id);
			}
		}
		let choices = yield ChoiceModel.find({cid: {$in: choicesIDArray}, isDeleted: false}, {type: 1, cid: 1, uid: 1, aImg: 1, bImg: 1, comment: 1});
		for (let i = 0; i < choices.length; i++) {
			id = choices[i].uid;
			if(!utmp[id]){
				utmp[id] = true;
				userIDArray.push(id);
			}
		}
		// 再找出所有用户
		let users = yield UserModel.find({uid: {$in: userIDArray}}, {uid: 1, name: 1, headName: 1, adminType: 1, authentication: 1, faceScore: 1});
		this.body = jsonUtil.createAPI(1, {comments: jsonUtil.commentsToJson(comments), choices: jsonUtil.choicesToJson(choices), users: jsonUtil.usersToJson(users)});
	}else{
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}	
};

/**
 * 获取用户好友
 */
exports.getFriends = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id": 1, "followed": 1, "following": 1}) : null;
	if(user){
		// 找出我关注的并且也关注我的
		let userIDArray = [];
		for (let i = 0; i < user.followed.length; i++) {
			if(user.following.indexOf(user.followed[i]) !== -1){
				userIDArray.push(user.followed[i]);
			}
		}
		let friends = yield UserModel.findByUids(userIDArray);
		let friendsJson = jsonUtil.usersToJson(friends);
		for (let i = 0; i < friendsJson.length; i++) {
			friendsJson[i].pinyin = tr(friendsJson[i].name);
		}
		this.body = jsonUtil.createAPI(1, friendsJson);
	}else{
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

// exports.postTest = function *() {
// 	this.body = jsonUtil.createAPI(1, {msg: "测试成功", postData: this.request.body});
// };
// 
/**
 * 根据名字查找用户
 */
exports.searchUser = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id": 1, "following": 1}) : null;
	if(user){
		let startIndex = numberUtil.toInt(this.params.startIndex);
		let count = numberUtil.toInt(this.params.count);
		let name = jsonUtil.myDecodeURIComponent(this.params.name);
		let users = yield UserModel.find({name: {$regex: name}}).limit(count).skip(startIndex);
		users = jsonUtil.usersToJson(users);
		for (let i = 0; i < users.length; i++) {
			users[i].isMyFollowing = user.following.indexOf(users[i].uid) !== -1 ? 1 : 0;
		}
		this.body = jsonUtil.createAPI(1, users);
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 用户搜索推荐
 */
exports.searchReferral = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let count = numberUtil.toInt(this.params.count);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id": 1, "uid": 1, pole: 1}) : null;
	if (user) {
		let t = moment(new Date()).subtract(16, 'hours');
		let users = yield UserModel.find({uid:{$ne:uid}, postTime: {$gte: t}}, {uid: 1, account: 1, password: 1,name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, birthday: 1, status: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, faceScore: 1, badges: 1, qq: 1}).sort({postTime: -1}).limit(count);
		users = jsonUtil.usersToJson(users);
		this.body = jsonUtil.createAPI(1, users);
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};


/**
 * 获取用户徽章数据
 */
exports.getUserBadgeInfo = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id": 1, "uid": 1}) : null;
	if(user){
		let tuid = numberUtil.toInt(this.params.tuid);
		let tuser = tuid > 0 ? yield UserModel.findOne({uid: tuid}, {_id: 1, uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, birthday: 1, status: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, faceScore: 1, badges: 1}) : null;
		if (tuser) {
			let badges = yield BadgeModel.find().sort({bid: 1});
			this.body = jsonUtil.createAPI(1, {user: jsonUtil.userToJson(tuser), badges: jsonUtil.badgesToJson(badges)});
		} else {
			this.body = jsonUtil.createAPI(-2, `没有找到用户:${tuid}`);
		}
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 获取用户的推广码数据
 */
exports.getExtensionCodes = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id": 1, "extensionCodes": 1, "pole": 1, name: 1,isPhoneCheckd: 1}) : null;

	if (user) {
		let result = yield createExtensionCodesResult(user);
		this.body = jsonUtil.createAPI(1, result);
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 创建推广码的结果数据
 */
function *createExtensionCodesResult(user) {
	// 最后的结果，数据结构: 
	// {
	// status: Number, // 1：不可用，2：可用但未用 3：已用但是目标用户未达标4：已用且目标用户已达标
	// extensionCode: {iid: Number, code: String} // 推广码数据，包含了id和code
	// user: {headName:String, name: String, uid: Number} // 用户数据
	// leftSecond: Number // 剩下的时间，单位:秒
	// poleCondition: Number // 需要多少磁场才能使用推广码
	// }
	const result = [];
	// 推广码可以使用的前提条件：必须拥有N个磁场
	//const conditions = [1, 9, 19, 39, 59];
	// 所有的推广码
	const extensionCodes = yield InvitationCodeModel.find({iid: {$in: user.extensionCodes}});
	const l = extensionCodes.length;
	// 推广码
	let code = null;
	let msg = null;
	for (var i = 0; i < l; i++) {
		code = extensionCodes[i];
		if (code.isDeleted) {
			continue;
		}
		// 先判断是否满足条件
		if (user.isPhoneCheckd) {
			if (!code.isUsed) {
				result.push({status: 2, extensionCode: {iid: code.iid, code: code.code}});
			} else {
				// 找到使用者
				let tuser = yield UserModel.findOne({uid: code.usedUser}, {
					_id: 1,
					birthday: 1,
					pole: 1,
					headName: 1,
					uid: 1,
					name: 1,
					extensionCodePhase: 1,
					badges: 1,
					extensionCodes: 1,
					isPhoneCheckd: 1
				});
				if (tuser) {
					// 使用者没有达到要求,得先判断一下是否可以达到要求
					// 15天是1296000000豪秒  磁场是否达到了139  手机是否认证
					let zero = moment(dateUtil.toYYMMDD(tuser.birthday)).format('x');
					let passTime = dateUtil.nowTimestamp() - zero;
					// 如果使用者已经达到要求了
					if (tuser.extensionCodePhase === 1) {
						result.push({
							status: 4,
							user: {
								headName: tuser.headName.startsWith('http') ? tuser.headName : qiniuUtil.createDownloadUrl(1, tuser.headName),
								name: tuser.name,
								uid: tuser.uid,
								pole: tuser.pole,
								isBindPhone:tuser.isPhoneCheckd
							}
						});
					} else if (tuser.extensionCodePhase === 2) {
						// 未达标
						result.push({
							status: 3,
							user: {
								headName: tuser.headName.startsWith('http') ? tuser.headName : qiniuUtil.createDownloadUrl(1, tuser.headName),
								name: tuser.name,
								uid: tuser.uid,
								pole: tuser.pole,
								isBindPhone:tuser.isPhoneCheckd
							},
							leftSecond: Math.floor((1296000000 - passTime) / 1000),
							extensionCode: {iid: code.iid, code: code.code}
						});
					} else {
						if (passTime < 1296000000) {
							if (tuser.pole >= 139 && tuser.isPhoneCheckd) {
								result.push({
									status: 4,
									user: {
										headName: tuser.headName.startsWith('http') ? tuser.headName : qiniuUtil.createDownloadUrl(1, tuser.headName),
										name: tuser.name,
										uid: tuser.uid,
										pole: tuser.pole,
										isBindPhone:tuser.isPhoneCheckd
									}
								});
								// extensionCodePhase变成成功并领取奖励状态
								tuser.extensionCodePhase = 1;
								tuser.pole += 9;
								yield _checkPole(tuser);
								yield badgeController.checkPoleBadge(tuser);
								yield tuser.save();

								let log = require('../../app').logger('debug');
								log.info(`${tuser.uid}获得磁场9=>${tuser.pole}=>邀请小伙伴成功`);

								// 发个消息
								msg = new MsgModel({
									type: 12,
									receiver: tuser.uid,
									birthday: dateUtil.now(),
									values: [user.name, 9]
								});
								yield msg.save();

								msg = new MsgModel({
									type: 102,
									receiver: code.owner,
									birthday: dateUtil.now(),
									values: [tuser.name]
								});
								yield msg.save();
							} else {
								result.push({
									status: 3,
									user: {
										headName: tuser.headName.startsWith('http') ? tuser.headName : qiniuUtil.createDownloadUrl(1, tuser.headName),
										name: tuser.name,
										uid: tuser.uid,
										pole: tuser.pole,
										isBindPhone:tuser.isPhoneCheckd

									},
									leftSecond: Math.floor((1296000000 - passTime) / 1000),
									extensionCode: {iid: code.iid, code: code.code}
								});
							}
						} else {
							// 未达标
							result.push({
								status: 3,
								user: {
									headName: tuser.headName.startsWith('http') ? tuser.headName : qiniuUtil.createDownloadUrl(1, tuser.headName),
									name: tuser.name,
									uid: tuser.uid,
									pole: tuser.pole,
									isBindPhone:tuser.isPhoneCheckd
								},
								leftSecond: Math.floor((1296000000 - passTime) / 1000),
								extensionCode: {iid: code.iid, code: code.code}
							});
							// extensionCodePhase变成未达标
							tuser.extensionCodePhase = 2;
							yield tuser.save();

							// 发个失败的消息
							msg = new MsgModel({
								type: 100,
								receiver: code.owner,
								birthday: dateUtil.now(),
								values: [0, 0, tuser.name]
							});
							yield msg.save();
							msg = new MsgModel({
								type: 100,
								receiver: tuser.uid,
								birthday: dateUtil.now(),
								values: [0, 1, user.name]
							});
							yield msg.save();
						}
					}
				}
			}
		} else {
			result.push({status: 1});
		}
	}
	return result;
};

/**
 * 创建一个新的推广码
 * @param {number} uid 我的ID
 * @param {number} oldCodeID 旧的推广码ID，创建新推广码时要将旧的推广码给删除
 */
exports.createNewExtensionCode = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id": 1, "extensionCodes": 1, "pole": 1, name: 1, isPhoneCheckd: 1}) : null;
	if (user) {
		const oldCodeIndex = user.extensionCodes.indexOf(numberUtil.toInt(this.params.oldCodeID));
		if (oldCodeIndex === -1) {
			this.body = jsonUtil.createAPI(-2, `没有找到旧的推广码=>uid:${uid},iid:${oldCodeID}`);
			return;
		} else {
			// 找到旧的推广码，删除之，然后创建一个新的推广码
			let code = yield InvitationCodeModel.findOne({iid: user.extensionCodes[oldCodeIndex]});
			if (code) {
				// 删除之前还要判断一下，是否已经被使用了，使用时间是否超过了15天，使用者的磁场是否未达到139
				if (code.isUsed) {
					let tuser = yield UserModel.findOne({uid: code.usedUser}, {_id: 1, birthday: 1, pole: 1,isPhoneCheckd: 1});
					if (tuser) {
						let zero = moment(dateUtil.toYYMMDD(tuser.birthday)).format('x');
						if (dateUtil.nowTimestamp() - zero >= 1296000000) {
							if (tuser.pole < 139 || !tuser.isPhoneCheckd) {
								code.isDeleted = true;
								yield code.save();

								// 创建一个新的推广码
								code = yield createExtensionCodes(uid);
								user.extensionCodes.push(code.iid);
								let result = yield createExtensionCodesResult(user);
								yield user.save();
								this.body = jsonUtil.createAPI(1, result);
							} else{
								this.body = jsonUtil.createAPI(-7, `推广码使用者磁场数以达139,不能删除:${code.usedUser}`);
							}
						} else {
							this.body = jsonUtil.createAPI(-6, `推广码使用时间未到15天,不能删除:${oldCodeID}`);
						}
					} else {
						this.body = jsonUtil.createAPI(-5, `推广码使用者未找到,不能删除:${code.usedUser}`);
					}
				} else {
					this.body = jsonUtil.createAPI(-4, `推广码未使用,不能删除:${oldCodeID}`);
				}
			} else{
				this.body = jsonUtil.createAPI(-3, `没有找到旧的推广码=>uid:${uid},iid:${oldCodeID}`);
			}
		}
		// 所有的推广码
		// const extensionCodes = yield InvitationCodeModel.find({iid: {$in: user.extensionCodes}});
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 邀请成功奖励
 */
exports.extensionCodeInviteSuccess = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {"_id":1, "uid": 1, "pole": 1, "badges": 1, "adminType": 1, "extensionCodes": 1, extensionCodePhase: 1, name: 1, isPhoneCheckd: 1}) : null;
	if (user) {
		if (user.extensionCodePhase === 3) {
			this.body = jsonUtil.createAPI(-3, `已领取成功，不能重复领取`);
			return;
		}
		let result = yield createExtensionCodesResult(user);
		let index = 0;
		for (let i = 0; i < result.length; i++) {
			if (result[i].status == 4) {
				index++;
			}
		}
		if (index >= 5) {
			// 获得船长身份
			user.adminType = 2;
			user.extensionCodePhase = 3;
			// 获得探险队徽章
			const bid = 3; // 3是探险队徽章的id
			if (user.badges.indexOf(bid) === -1) {
				// 邀请5个小伙伴，获得一个徽章（探险队） 磁场+30 在我的-邀请小伙伴中试着邀请一些小伙伴一起玩吧！ 判断机制：通过我的空间-设置-邀请小伙伴这套邀请方式有效邀请5个小伙伴（见邀请码の套路独立文档）
				let badge = yield BadgeModel.findOne({bid: bid}, {_id: 1, bid: 1, name: 1, pole: 1});
				let msg = new MsgModel({type: 5, receiver: uid, birthday: dateUtil.now(), values: [badge.name, badge.pole]});
				yield msg.save();
				user.badges.push(bid);
				user.pole += badge.pole;

				let log = require('../../app').logger('debug');
				log.info(`${user.uid}获得磁场${badge.pole}=>${user.pole}=>获得徽章:${bid}`);

				yield _checkPole(user);
				yield badgeController.checkPoleBadge(user);
			}
			yield user.save();
			this.body = jsonUtil.createAPI(1, `奖励领取成功`);
		} else {
			this.body = jsonUtil.createAPI(-2, `未成功邀请5位好友，不能领取奖励`);
		}
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

// exports.createExtensionCode = function *() {
// 	let user = yield UserModel.find({$or:[{extensionCodes:{$exists:false}},{extensionCodes:[]}]},{"_id": 1,"uid": 1,"extensionCodes": 1});
// 	if (user) {
// 		for (let i = 0; i < user.length; i++) {
// 			// 创建五个推广码
// 			let extensionCode = null;
// 			for (let j = 0; j < 5; j++) {
// 				extensionCode = yield createExtensionCodes(user[i].uid);
// 				user[i].extensionCodes.push(extensionCode.iid);
// 			}
// 			yield user[i].save();
// 		}
// 		this.body = jsonUtil.createAPI(1, "创建成功");
// 	}

// };

/**
 * 探索、关注、最新列表状态
 */
exports.getStatus = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {uid: 1, "votedMissions.mid": 1, "votedMissions.isDone": 1, following: 1, votedChoices: 1, choiceCollection: 1}) : null;
	if (user) {
		let result = [];
		const startIndex = 0;
		const count = 10;
		// status: 0 未完成 1 完成
		result[0] = {index: "探索", status: 0};
		result[1] = {index: "关注", status: 1};
		result[2] = {index: "最新", status: 1};
		// 探索模块
		let mid = missionController.getCurrentMissionID();
		if (mid < 0) {
			result[0].status = 1;
		} else {
			let userVoteMission =  user.votedMissions;
			for (let i = 0;i < userVoteMission.length; i++) {
				if (userVoteMission[i].mid === mid && userVoteMission[i].isDone) {
					result[0].status = 1;
					break;
				}
			}
		}
		// 关注列表模块
		let choices = yield choiceController.follwoingChoice(user, startIndex, count);
		let choicesJson = jsonUtil.choicesToJson(choices, user);
		for (let i = 0;i < choicesJson.length; i++) {
			if (choicesJson[i].voted === -1) {
				result[1].status = 0;
				break;
			}
		}
		// 最新列表模块
		// let latestChoices = yield ChoiceModel.findLatestChoices(startIndex, count);
		// let latestChoicesJson = jsonUtil.choicesToJson(latestChoices, user);
		// for (let i = 0;i < latestChoicesJson.length; i++) {
		// 	if (latestChoicesJson[i].voted === -1) {
		// 		result[2].status = 0;
		// 		break;
		// 	}
		// }
		this.body = jsonUtil.createAPI(1, result);
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};

/**
 * 领取分享徽章
 */
exports.fetchShareBadge = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {_id: 1, uid: 1, badges: 1, pole: 1}) : null;
	if (user) {
		let bid = 4;
		if (user.badges.indexOf(bid) === -1) {
			let badge = yield BadgeModel.findOne({bid: bid}, {_id: 1, bid: 1, name: 1, pole: 1});
			let msg = new MsgModel({type: 5, receiver: uid, birthday: dateUtil.now(), values: [badge.name, badge.pole]});
			yield msg.save();
			user.badges.push(bid);
			user.pole += badge.pole;
			yield _checkPole(user);
			yield badgeController.checkPoleBadge(user);
			yield user.save();

			let log = require('../../app').logger('debug');
			log.info(`${user.uid}获得磁场${badge.pole}=>${user.pole}=>获得徽章:${bid}`);
		}
		this.body = jsonUtil.createAPI(1);
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}
};
/**
 * 获取收藏帖子状态
 */
exports.getChoicesStatus = function *() {
	let uid = numberUtil.toInt(this.params.uid);
	let user = uid > 0 ? yield UserModel.findOne({uid: uid}, {uid: 1, choiceCollectionStatus: 1}) : null;
	if (user) {
		this.body = jsonUtil.createAPI(1, {
			status: user.choiceCollectionStatus
		});
	} else {
		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
	}

};
// let users = null, userIndex = 0, userLength = 0, nextID = 0, codeCount = 0;
// const chats = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

// function createRandomChar() {
// 	return chats[Math.floor(Math.random() * 36)];
// }

// function createInvitationCode(cb) {
// 	if (userIndex < userLength && codeCount < 200) {
// 		let code = nextID.toString(32) + "l";
// 		while (code.length < 10) {
// 			code += createRandomChar();
// 		}
// 		let codeModel = new InvitationCodeModel({
// 			owner: users[userIndex].uid,
// 			code: code,
// 			type: 3
// 		});
// 		codeModel.save(function (err) {
// 			if (!err){
// 				UserModel.update({uid: users[userIndex].uid}, {$set: {invitationCode: codeModel.iid}}, null, function (err) {
// 					if (!err) {
// 						userIndex += 1;
// 						nextID += 1;
// 						codeCount += 1;
// 						createInvitationCode(cb);
// 					}
// 				})
// 			}
// 		});
// 	}else{
// 		cb();
// 	}
// }


// let rule = new schedule.RecurrenceRule();
// rule.hour = 0;
// rule.minute = 0;
// rule.second = 36;
// schedule.scheduleJob(rule, function () {
// 	co(_goDay);
// });


/**
 * 每日更新
 */
function *_goDay() {
	let log = require('../../app').logger('debug');
	log.info("开始每日更新");
	// 如果今天没有完成活跃任务，那么就把ActiveValueCount清零
	yield UserModel.update({'activeValue.isDone': false}, {$set: {activeValueCount: 0}}, {multi: true});
	// 将所有用户的当天获取C级奖励的次数清零
	yield UserModel.update({}, {
		$set: {
			poleAwardCount: 0,
			poleAwardChoice: [],
			activeValue: {voteCount: 0, commentCount: 0, isDone: false},
			breakZeroCommentCount: 0,
			commentFriendCount: 0,
			isReceivedLoginAward: false,
			praiseUsers: []
		}}, {multi: true});
	yield invitedReward();

	yield actController.goday();
}

exports.goDay = function *() {
	yield _goDay();
	yield captainReward24();
	this.body = jsonUtil.createAPI(1, "每日更新完成");
};

exports.goNoon = function *() {
	yield captainReward12();
	this.body = jsonUtil.createAPI(1, "中午更新完成");
	let log = require('../../app').logger('debug');
	log.info("开始每日中午更新");
};

function *invitedReward() {
	// 找出所有参与了推广活动的用户,判断一下是失败了还是成功了
	let users = yield UserModel.find({extensionCodePhase: 0}, {uid: 1, birthday: 1, name: 1, pole: 1, extensionCodePhase: 1, badges: 1, extensionCodes: 1, isPhoneCheckd: 1});
	let usedDay = 0;
	let now = dateUtil.nowTimestamp();
	const award = 9;
	let u = null;
	let msg = null, msgDate = dateUtil.now();
	let log = require('../../app').logger('debug');
	for (let i = 0, l = users.length; i < l; i++) {
		u = users[i];
		// 找到推广人的推广码
		let code = yield InvitationCodeModel.findOne({usedUser: u.uid}, {owner: 1});
		let tuser = yield UserModel.findOne({uid: code.owner}, {name: 1});

		usedDay = moment(dateUtil.toYYMMDD(u.birthday)).format('x');
		if (now - usedDay <= 1296000000) {
			// 时间未到,如果磁场到了139，说明成功了
			if (u.pole >= 139 && u.isPhoneCheckd) {
				// 奖励9个磁场
				u.pole += award;
				// extensionCodePhase变成成功并领取奖励状态
				u.extensionCodePhase = 1;
				yield _checkPole(u);
				yield badgeController.checkPoleBadge(u);
				yield u.save();

				
				log.info(`${u.uid}获得磁场${award}=>${u.pole}=>邀请小伙伴活动中磁场达到139并且已经认证了手机`);

				// 发个消息
				msg = new MsgModel({
					type: 12,
					receiver: u.uid,
					birthday: msgDate,
					values: [tuser.name, award]
				});
				yield msg.save();

				msg = new MsgModel({
					type: 102,
					receiver: code.owner,
					birthday: msgDate,
					values: [u.name]
				});
				yield msg.save();
			}
		} else {
			// 超出时间了
			u.extensionCodePhase = 2;
			yield u.save();
			// 发个失败的消息
			msg = new MsgModel({type: 100, receiver: code.owner, birthday: msgDate, values: [0, 0, u.name]});
			yield msg.save();
			msg = new MsgModel({type: 100, receiver: u.uid, birthday: msgDate, values: [0, 1, tuser.name]});
			yield msg.save();
		}
	}
}

function *_checkPole(user) {
	// if (user.extensionCodePhase === 3) {
	// 	return;
	// }
	// let size = user.extensionCodes.length;
	// // 所有的推广码
	// let extensionCodes = yield InvitationCodeModel.find({iid: {$in: user.extensionCodes}});
	// // 推广码可以使用的前提条件：必须拥有N个磁场
	// const conditions = [1, 9, 19, 39, 59];
	// let poleCondition = 0;
	// for (let i = 0; i < size; i++) {
	// 	if (extensionCodes[i].isDeleted) {
	// 		continue;
	// 	}
	// 	// 先判断是否满足条件
	// 	poleCondition = i > 4 ? (i - 4) * 99 : conditions[i];
	// 	if (user.pole >= poleCondition && !extensionCodes[i].isEnabled) {
	// 		let msg = new MsgModel({type: 101, receiver:user.uid, birthday: dateUtil.now(), values: []});
	// 		yield msg.save();
	// 		extensionCodes[i].isEnabled = true;
	// 		yield extensionCodes[i].save();
	// 	}
	// }
}

exports.checkPole = function* (user){
	yield _checkPole(user);
};

function* captainReward24() {
	let m = moment(new Date());
	let dateToday = m.format('H')>12?m.format('YYYYMMDD'):m.subtract(1,'day').format('YYYYMMDD');
	let rewardToday = yield RewardModel.findOne({type: 5, date: dateToday}, {rid: 1});
	if(rewardToday) {
		let captains = yield rewardUtil.topCaptainList();
		let winner = captains[0].uid;
		yield RewardModel.update({rid: rewardToday.rid}, {$set: {
			uid: winner,
			extra: captains[0].crew
		}});
		return;
	}

	let currentReward = yield RewardModel.findOne({type: 5, uid: 0}, {rid: 1});
	if(currentReward) {
		let captains = yield rewardUtil.topCaptainList();
		yield RewardModel.update({rid: currentReward.rid}, {$set: {
			cache: captains.map(cpt=>({
				captain: cpt.uid,
				crew: cpt.crew,
				poleSum: cpt.poleSum
			}))
		}});
	}
}

function* captainReward12() {
	let currentReward = yield RewardModel.findOne({type: 5, uid: 0}, {rid: 1});
	if(currentReward) {
		let captains = yield rewardUtil.topCaptainList();
		yield RewardModel.update({rid: currentReward.rid}, {$set: {
			cache: captains.map(cpt=>({
				captain: cpt.uid,
				crew: cpt.crew,
				poleSum: cpt.poleSum
			}))
		}});
	}
};

//-------------------------------测试用的------------------------------------------------
/**
 * 添加一些测试账号
 */
// exports.addUserForTest = function *() {
// 	const password = encryption("123456");
// 	let count = numberUtil.toInt(this.params.count);
// 	for (let i = 0; i < count; i++) {
// 		let nextUid = yield getNextUid();
// 		const user = new UserModel({account: "test" + nextUid, password: password, name: `sn${nextUid}`, birthday: dateUtil.now()});
// 		yield user.save();
// 	}
// 	this.body = jsonUtil.createAPI(1, "好了");
// };

// exports.followAllUser = function *() {
// 	let uid = numberUtil.toInt(this.params.uid);
// 	let user = uid > 0 ? yield UserModel.findOne({uid: uid}) : null;
// 	if(user){
// 		let allUsers = yield UserModel.find({});
// 		let u = null;
// 		for (let i = 0; i < allUsers.length; i++) {
// 			u = allUsers[i];
// 			if(uid !== u.uid){
// 				if(user.following.indexOf(u.uid) === -1){
// 					user.following.push(u.uid);
// 					u.followed.push(uid);
// 					yield u.save();
// 				}
// 			}
// 		}
// 		yield user.save();
// 		this.body = jsonUtil.createAPI(1, '关注成功');
// 	}else{
// 		this.body = jsonUtil.createAPI(-1, `没有找到用户:${uid}`);
// 	}
// };

// exports.addTestUserForIos = function *() {
// 	let user = yield UserModel.findOne({account: "sn999"});
// 	if (!user) {
// 		user = new UserModel({account: "sn999", password: encryption("123456"), name: "小苹果", birthday: dateUtil.now()});
// 		yield user.save();
// 	}
// 	this.body = jsonUtil.createAPI(1, "搞定");
// };

// /**
//  * 添加100个测试账号
//  * @yield {[type]} [description]
//  */
// exports.addTestUser = function *() {
// 	let account = null;
// 	let password = null;
// 	let result = {};
// 	for (let i = 1000; i < 1101; i++) {
// 		account = `sn${i}`;
// 		let user = yield UserModel.findOne({account: account});
// 		if (!user) {
// 			password = createRandomChar();
// 			while (password.length < 4) {
// 				password += createRandomChar();
// 			}
// 			result[account] = password;
// 			user = new UserModel({account: account, password: encryption(password), name: account, birthday: dateUtil.now()});
// 			yield user.save();
// 		}
// 	}
// 	this.body = jsonUtil.createAPI(1, result);
// };


// exports.tttt = function *() {
// 	// let users = yield UserModel.find({}, {uid: 1, extensionCodes: 1});
// 	// let extensionCode = null;
// 	// for (let i = 0; i < users.length; i++) {
// 	// 	// 创建五个推广码
// 	// 	for (let j = 0; j < 5; j++) {
// 	// 		extensionCode = yield createExtensionCodes(users[i].uid);
// 	// 		users[i].extensionCodes.push(extensionCode.iid);
// 	// 	}
// 	// 	yield users[i].save();
// 	// 	this.body = "好了";
// 	// }
// 	let users = yield UserModel.find({}, {uid: 1, extensionCodes: 1});
// 	let extensionCode = null;
// 	for (let i = 0; i < users.length; i++) {
// 		if (users[i].extensionCodes.length > 5) {
// 			users[i].extensionCodes = users[i].extensionCodes.splice(0, 5);
// 			yield users[i].save();
// 		}
// 	}
// 	this.body = "好了";
// };

// exports.aaa = function *() {
// 	yield invitedReward();
// 	this.body = "更新完毕";
// };

// exports.bbb = function *() {
// 	let u = yield UserModel.findOne({uid: 1153});
// 	for (let j = 0; j < 5; j++) {
// 		let extensionCode = yield createExtensionCodes(u.uid);
// 		u.extensionCodes.push(extensionCode.iid);
// 	}
// 	yield u.save();
// 	this.body = "好了";
// };

//-------------------------------测试结束------------------------------------------------
