"use strict";

let utils     = require('utility');
let qiniuUtil = require('./qiniuUtil');
let dateUtil  = require('./dateUtil');
let lvUtil    = require('./lvUtil');
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

function _userToJson(user) {
	let lv = lvUtil.getLv(user.pole || 0);
	return {
		uid: user.uid,
		account: user.account,
		a:user.password,
		name: user.name,
		headName: user.headName ? (user.headName.startsWith('http') ? user.headName : qiniuUtil.createDownloadUrl(1, user.headName)) : null,
		source: user.source,
		phone: user.phone,
		isPhoneCheckd: user.isPhoneCheckd ? 1 : 0,
		isHeadChanged: user.isHeadChanged ? 1 : 0,
		mail: user.mail,
		isMailCheckd: user.isMailCheckd ? 1 : 0,
		adminType: user.adminType,
		birthday: dateUtil.toTimestamp(user.birthday),
		status: user.status,
		pole: user.pole,
		signing: user.signing,
		nameChangedCount: user.nameChangedCount,
		authentication: user.authentication,
		badges: user.badges,
		qq: user.qq,
		faceScore: user.faceScore,
		lv: lv,
		nextPole:lvUtil.getNextLvExp(lv)
	};
}


exports.userToJson = function (user) {
	return _userToJson(user);
};

exports.usersToJson = function (users) {
	let arr = [];
	for (let i = 0; i < users.length; i++) {
		arr[i] = _userToJson(users[i]);
	}
	return arr;
};

exports.choiceJson = function (choice,mid,user) {
	let choicesJson = [];
	let index = null;
	for (let j = 0; j < user.MissionList.length; j++) {
		if (user.MissionList[j].mid == mid) {
			index = user.MissionList[j];
			break;
		}
	}
	for (let i = 0; i < choice.length; i++) {
		let c = {};
		c.cid = choice[i].cid;
		c.title = choice[i].title;
		c.aImg = choice[i].aImg.startsWith('http') ? choice[i].aImg : qiniuUtil.createDownloadUrl(2, choice[i].aImg);
		c.bImg = choice[i].bImg.startsWith('http') ? choice[i].bImg : qiniuUtil.createDownloadUrl(2, choice[i].bImg);
		c.aVote = choice[i].aVote;
		c.bVote = choice[i].bVote;
		c.uid = choice[i].uid;
		c.birthday = dateUtil.toTimestamp(choice[i].birthday);
		c.label = choice[i].label;
		if(index != null)
		{
			c.voted = index.choices[i].isA;
		}else
		{
			c.voted = -1;
		}
		c.comment = choice[i].comment.slice(-5).reverse();
		c.commentCount = choice[i].comment.length;
		c.isQuality = choice[i].isQuality ? 1 : 0;
		c.type = choice[i].type;
		choicesJson.push(c);
	}
	return choicesJson;
};

function _choiceToJson(choice, user, mission) {
	let isCollection = 0 ;
	let voted = -1;
	// 普通的投票，看看用户是否投过
	if (choice.type === 1 || choice.type === 3 || choice.type === 4) {
		if(user){
			if(user.choiceCollection.indexOf(choice.cid) !== -1){
				isCollection = 1;
			}
			for(let i of user.votedChoices){
				if(i.cid === choice.cid){
					voted = i.isA ? 1 : 2;
					break;
				}
			}
		}
	} else if (choice.type === 2) {
		// 任务类型的还得判断下user是否投过了
		if (mission && user) {
			if(user.choiceCollection.indexOf(choice.cid) !== -1){
				isCollection = 1;
			}
			// user的votedMissions结构如下:
			// [{mid: Number, choices: [{cid: Number, isA: Number}], isDone: Boolean}]
			for (let i = 0; i < user.votedMissions.length; i++) {
				if (user.votedMissions[i].mid === mission.mid) {
					for (let j = 0; j < user.votedMissions[i].choices.length; j++) {
						if (user.votedMissions[i].choices[j].cid === choice.cid) {
							voted = user.votedMissions[i].choices[j].isA;
							break;
						}
					}
					break;
				}
			}
		}
	}

	let label = choice.label || {};
	if (label.labelA === null && label.labelB === null) {
		label = {};
	}
	if (typeof(label.labelA) === "undefined" && typeof(label.labelB) === "undefined") {
		label = {
			labelA: "---uf",
			labelAX: 0,
			labelAY: 0,
			labelAStyle: 0,
			labelADir: 0,
			labelB: "---uf",
			labelBX: 0,
			labelBY: 0,
			labelBStyle: 0,
			labelBDir: 0
		}
	}

	// 这个帖子的标签B有问题，直接屏蔽掉
	// 这是临时的做法，之后要把这个if删掉的
	if (choice.cid === 37176) {
		label.labelB = "---uf";
	}
	return {
		cid: choice.cid,
		uid: choice.uid,
		title: choice.title,
		aImg: choice.aImg.startsWith('http') ? choice.aImg : qiniuUtil.createDownloadUrl(2, choice.aImg),
		bImg: choice.bImg.startsWith('http') ? choice.bImg : qiniuUtil.createDownloadUrl(2, choice.bImg),
		aVote: choice.aVote,
		bVote: choice.bVote,
		birthday: dateUtil.toTimestamp(choice.birthday),
		// 取出前5条评论的id
		comment: choice.comment.slice(-5).reverse(),
		commentCount: choice.comment.length,
		voted: voted,
		isQuality: choice.isQuality ? 1 : 0,
		type: choice.type,
		label: label,
		// 允许未认证的用户投票
		allowUnauthorized: choice.allowUnauthorized === true ? 1 : 0,
		label: label,
		startDay: choice.startDay || 0,
		endDay: choice.endDay || 0,
		isCollection: isCollection,
		isLocked: choice.isLocked ? 1 : 0,
		isHot: choice.isHot ? 1 : 0,
		isShowCount: choice.isShowCount ? 1 : 0
	};
}

exports.choiceToJson = function (choice, user, mission) {
	return _choiceToJson(choice, user, mission);
};

exports.choicesToJson = function (choices, user, mission) {
	let arr = [];
	for (let i = 0; i < choices.length; i++) {
		arr[i] = _choiceToJson(choices[i], user, mission);
	}
	return arr;
};

function _commentToJson(comment) {
	return {
		cid: comment.cid,
		uid: comment.uid,
		content: comment.content,
		reply: comment.reply.slice(-5).reverse(),
		replyCount: comment.reply.length,
		birthday: dateUtil.toTimestamp(comment.birthday),
		choiceID: comment.choiceID,
		isHided: comment.isHided ? 1 : 0,
		floor: comment.floor,
		isParise: comment.isParise
	};
}

exports.commentToJson = function (comment) {
	return _commentToJson(comment);
};

exports.commentsToJson = function (comments) {
	let arr = [];
	for (let i = 0; i < comments.length; i++) {
		arr[i] = _commentToJson(comments[i]);
	}
	return arr;
};

function _msgToJson(msg) {
	return {
		mid: msg.mid,
		type: msg.type,
		// 发送方ID，默认为0，就是系统发送的，
		sender: msg.sender,
		// 接收方ID，默认为0，就是所有人
		receiver: msg.receiver,
		// 和通知相关的投票ID，默认是0，就是没有相关的投票
		choiceID: msg.choiceID,
		values: msg.values,
		birthday: dateUtil.toTimestamp(msg.birthday),
		isReaded: msg.isReaded ? 1 : 0
	};
}

exports.msgToJson = function (msg) {
	return _msgToJson(msg);
};

exports.msgsToJson = function (msgs) {
	let arr = [];
	for (let i = 0; i < msgs.length; i++) {
		arr[i] = _msgToJson(msgs[i]);
	}
	return arr;
};

function _replyToJson(reply) {
	return {
		rid: reply.rid,
		sender: reply.sender,
		receiver: reply.receiver,
		content: reply.content,
		birthday: dateUtil.toTimestamp(reply.birthday),
		isHided: reply.isHided ? 1 : 0,
		isPariseReply:reply.isPariseReply,
		commentID: reply.commentID
	};
}

exports.replyToJson = function(reply) {
	return _replyToJson(reply);
};

exports.replysToJson = function (replys) {
	let arr = [];
	for (let i = 0; i < replys.length; i++) {
		arr[i] = _replyToJson(replys[i]);
	}
	return arr;
};

function _missionToJson(mission, choices, user) {
	let choicesJson = [];
	for (let i = 0; i < choices.length; i++) {
		choicesJson[i] = _choiceToJson(choices[i], user, mission);
	}
	return {
		mid: mission.mid,
		title: mission.title,
		type: mission.type,
		year: mission.year,
		month: mission.month,
		date: mission.date,
		choices: choicesJson,
		award: mission.award,
		cover: mission.cover.startsWith('http') ? mission.cover : qiniuUtil.createDownloadUrl(2, mission.cover),
		mode: mission.mode
	};
}

exports.missionToJson = function(mission, choices, user) {
	return _missionToJson(mission, choices, user);
};

function _chatGroupToJson(chat, users) {
	// title: {type: String, required: true},
	// // 成员
	// users: {type: [Number], required: true},
	// // 对话
	// dialog: {type: [{}]},
	// birthday: {type: Date, require: true}
	let usersJson = [];
	for (let i = 0; i < users.length; i++) {
		usersJson[i] = _userToJson(users[i]);
	}
	return {
		gid: chat.gid,
		title: chat.title,
		users: usersJson,
		dialog: chat.dialog
	};
}

exports.chatGroupToJson = function (chat, users) {
	return _chatGroupToJson(chat, users);
};

function _badgeToJson(badge) {
	return {
		bid: badge.bid,
		name: badge.name,
		des: badge.des,
		pole: badge.pole,
		img: qiniuUtil.createDownloadUrl(2, badge.asset),
		grayImg: qiniuUtil.createDownloadUrl(2, "gray_" + badge.asset),
	};
}

exports.badgeToJson = function (badge) {
	return _badgeToJson(badge);
};

exports.badgesToJson = function (badges) {
	let arr = [];
	for (let i = 0; i < badges.length; i++) {
		arr[i] = _badgeToJson(badges[i]);
	}
	return arr;
};

function _awardToJson(award) {
	return {
		type: award.type,
		uid: award.uid,
		birthday: parseInt(award.date)
	};
}

exports.awardToJson = function (award) {
	return _awardToJson(award);
};


exports.awardsToJson = function (awards) {
	const r = [];
	for (let i = 0; i < awards.length; i++) {
		r[i] = _awardToJson(awards[i]);
	}
	return r;
};

function _collectionToJson(collection) {
	return {
		cid: collection.cid,
		name: collection.title,
		img: collection.cover,
		des: collection.intro,
		birthday: dateUtil.toTimestamp(collection.birthday)
	};
}

exports.collectionToJson = function(collection) {
	return _collectionToJson(collection);
};

exports.collectionsToJson = function(collections) {
	const r = [];
	for (let i = 0; i < collections.length; i++) {
		r[i] = _collectionToJson(collections[i]);
	}
	return r;
};

exports.chatToJson = function (chat, userA, userB) {
	let dialog = chat.dialog.slice(-30);
	let dialogJson = [], t = null;
	for (let i = 0; i < dialog.length; i++) {
		t = dialog[i];
		dialogJson[i] = {
			uid: t.uid,
			content: t.content,
			time: dateUtil.toTimestamp(t.time)
		};
	}
	return {
		cid: chat.cid,
		userA: {
			uid: userA.uid,
			name: userA.name,
			headName: userA.headName ? (userA.headName.startsWith('http') ? userA.headName : qiniuUtil.createDownloadUrl(1, userA.headName)) : null
		},
		userB: {
			uid: userB.uid,
			name: userB.name,
			headName: userB.headName ? (userB.headName.startsWith('http') ? userB.headName : qiniuUtil.createDownloadUrl(1, userB.headName)) : null
		},
		dialog: dialogJson
	};
};


function _deepcopy(source) {
	let result = source instanceof Array ? [] : {};
	let t = null;
	for (let key in source) {
		t = typeof(source[key]);
		if (key === "reply") {
			console.log(t);
		}
		result[key] = t === "object" ? _deepcopy(source[key]): source[key];
	}
	return result; 
}

exports.deepcopy = function (source) {
	return _deepcopy(source);
};