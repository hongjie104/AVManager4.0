"use strict";

/**
 * 用户数据表
 */
let mongoose      = require('mongoose');
let autoIncrement = require('./db');
let dateUtil      = require('../../app/utils/dateUtil');

let userSchema = new mongoose.Schema({
	account: {type: String, required: true},
	password: {type: String, required: true},
	name: {type: String, required: true},
	// 昵称修改次数
	nameChangedCount: {type: Number, default: 0},
	// 认证的身份
	authentication: {type: String, default: ""},
	// 签名
	signing: {type: String, default: '我很懒,签名都没写'},
	// qq号
	qq: {type: Number, default: 0},
	headName: {type: String, default: "default.png"},
	source: {type: String, default: "snpole"},
	phone: {type: String, default: ""},
	isPhoneCheckd: {type: Boolean, default: false},
	mail: {type: String, default: ""},
	// 磁场奖励
	pole: {type: Number, default: 0},
	isMailCheckd: {type: Boolean, default: false},
	isHeadChanged: {type: Boolean, default: false},
	// 投过票的投票
	votedChoices: {type: [{cid: Number, isA: Boolean}], default: []},
	// 收藏的帖子
	choiceCollection:{type:[Number],default:[]},
	// 帖子收藏状态 true :有最新评论
	choiceCollectionStatus:{type: Boolean, default: false},
	// 创建的投票
	createdChoices: {type: [Number], default: []},
	// 关注的人
	following: {type: [Number], default: []},
	// 关注我的人
	followed: {type: [Number], default: []},
	birthday: {type: Date, require: true},
	// 权限 1：普通用户 2：船长 5:管理员
	adminType: {type: Number, default: 1},
	// 状态，1是正常
	status: {type: Number, default: 1},
	// 任务数据,mid:任务id，isA:数组，任务中的投票的结果，-1：没有投，1：投了左边的，2投了右边的，isDone：任务是否完成了 resultTexts:结果文字 resultPics：结果图片
	votedMissions: {type: [{mid: Number, choices: [{cid: Number, isA: Number}], isDone: Boolean, resultTexts: {type: String, default:""}, resultPics: {type: String, default: ""}, finishTime: Date}], default: []},
	// 测试任务数据，mid:任务id isA:数组，任务中的投票的结果，-1：没有投，1：投了左边的，2投了右边的，isDone：任务是否完成了
	MissionList:{type:[{mid:Number, choices:[{cid:Number,isA:Number}],isDone:Boolean}],default:[]},
	// 累计错过的任务数量
	missMissionCount: {type: Number, default: 0},
	// 连续做任务的次数
	continuousMissionCount: {type: Number, default: 0},
	// 对话组
	chatGroups: {type: [{gid: Number, unreadCount: Number, isDeleted: Boolean}], default: []},
	// 邀请码
	invitationCode: {type: Number, default: -1},
	// 发帖时间
	postTime:{type: Date, default:dateUtil.defaultDay},
	// 邀请码是否被使用了
	isInvitationCodeUsed: {type: Boolean, default: false},
	devicePlatform: {type: String, default: "android"},
	// 获得的徽章
	badges: {type: [Number], default: []},
	// 每天的活跃记录
	activeValue: {type: {voteCount: Number, commentCount: Number, isDone: Boolean}, default: {voteCount: 0, commentCount: 0, isDone: false}},
	// 连续达成活跃的天数
	activeValueCount: {type: Number, default: 0},
	// db.getCollection('users').update({}, {$set: {activeValue: {voteCount: NumberInt(0), commentCount: NumberInt(0), isDone: false}}}, {multi: true})
	// 上一次登录的时间
	lastLoginDay: {type: Date, default: dateUtil.defaultDay},
	// 是否领取了每天登录奖励
	isReceivedLoginAward: {type: Boolean, default: false},
	// 5个推广码
	extensionCodes: {type: [Number], default: []},
	isFrozen: {type: Boolean, default: false},

	// 推广码的进度：
	// -1：没有参与到推广活动中，默认值
	// 0: 作为被推广用户刚刚注册了
	// 1：作为被推广用户，达到了推广要求并领取了奖励，(每晚十二点判断，如果达标了那就顺便一起把奖励也发了)
	// 2：作为被推广用户，未达到推广要求
	// 3：作为推广用户，领取了推广活动的奖励
	extensionCodePhase: {type: Number, default: -1},
	// 每日获得C级磁场奖励的次数，一天只能获得3次，每天零点将此值变0
	poleAwardCount: {type: Number, default: 0},
	// 每日获得C级磁场奖励的投票ID，一天只能获得3次，每天零点将此值变空数组
	poleAwardChoice: {type: [Number], default: []},
	// 已获得C级奖励的话题id
	awardCChoices: {type: [Number], default: []},
	// 已获得B级奖励的话题id
	awardBChoices: {type: [Number], default: []},
	// 已获得A级奖励的话题id
	awardAChoices: {type: [Number], default: []},
	// 已获得S级奖励的话题id
	awardSChoices: {type: [Number], default: []},
	// 每天打破0回复话题的次数,每天晚上十二点清零
	breakZeroCommentCount: {type: Number, default: 0},
	// 每天回复好友发的话题的次数，晚上十二点清零
	commentFriendCount: {type: Number, default: 0},
	// 已经读过的官方公告ID
	readedOfficialNotice: {type: [Number], default: []},
	// 活动奖励中榜上有名的次数
	rewardCount: {type: Number, default: 0},
	// 是否获得了皮卡堂3D内测的资格
	picaTown3D: {type: Number, default: 0},
	// 绑定的ptu id和名字
	ptuUid: {type: Number, default: 0},
	ptuName: {type: String, default: ''},
	chatList: {type: [Number], default: []},
	// 推广我来注册的人
	extensionUser: {type: Number, default: 0},
	// 给我的评论点赞的用户
	praiseUsers: {type: [Number], default: []},
	// 颜值
	faceScore: {type: Number, default: 0}
}, {collection: "users"});

/**
 * 配置自增长的字段
 */
userSchema.plugin(autoIncrement.plugin, {
	// model名
	model: 'User',
	// 自增长字段名
	field: 'uid',
	// 起始数值
	startAt: 1000,
	// 自增值
	incrementBy: 1
});

userSchema.statics.findByAccount = function (account) {
	return this.findOne({account: account}, {_id: 0, uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, birthday: 1, status: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, badges: 1, password: 1, qq: 1, faceScore: 1});
};

userSchema.statics.findByPhone = function (phone) {
	return this.findOne({phone: phone}, {_id: 0, uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, birthday: 1, status: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, badges: 1, password: 1, qq: 1, faceScore: 1});
};

userSchema.statics.findByName = function (name) {
	return this.findOne({name: name});
};

userSchema.statics.findByUids = function (uids) {
	return this.find({uid: {$in: uids}}, {_id: 0, uid: 1, account: 1, name: 1, headName: 1, source: 1, phone: 1, isPhoneCheckd: 1, isHeadChanged: 1, mail: 1, isMailCheckd: 1, adminType: 1, birthday: 1, status: 1, pole: 1, signing: 1, nameChangedCount: 1, authentication: 1, badges: 1, qq: 1, faceScore: 1});
};

userSchema.statics.findUsers = function (startIndex, count) {
	return this.find()./*sort({birthday: -1}).*/limit(count).skip(startIndex);
};

userSchema.statics.getQuery = function (conditions) {
	conditions = conditions || {};
	conditions.status = 1;
	return conditions;
};

module.exports = userSchema;
