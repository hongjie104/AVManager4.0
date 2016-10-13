"use strict";

let router             = require('koa-router')();
let actressController  = require('../app/controllers/actressController');
let videoController    = require('../app/controllers/videoController');
let categoryController = require('../app/controllers/categoryController');
let seriesController   = require('../app/controllers/seriesController');
let dmmRankController   = require('../app/controllers/dmmRankController');
let SeriesModel        = require('../app/models/seriesModel');
let VideoModel         = require('../app/models/videoModel');
let CategoryModel         = require('../app/models/categoryModel');
let numberUtil         = require('../app/utils/numberUtil');
let jsonUtil           = require('../app/utils/jsonUtil');
let ActressModel       = require('../app/models/actressModel');

router.get('', function *(next) {
	yield this.render('index', {
		title: 'Hello World Koa!1'
	});
});

// router.get('crossdomain.xml', function *() {
// 	this.body = '<?xml version="1.0" encoding="UTF-8" ?><cross-domain-policy><site-control permitted-cross-domain-policies="all" /><allow-access-from domain="*" /><allow-http-request-headers-from domain="*" headers="*" /></cross-domain-policy>';
// });

router.get('actress', actressController.index);

router.get('getActress/:startIndex/:count/:sortType/:keyWord', actressController.getActress);

router.get('getActressedByID/:id', actressController.getActressedByID);

router.get('getActressedByName/:name/:startIndex/:count', actressController.getActressedByName);

router.get('getActresVideo/:actressID/:sortType/:startIndex/:count', actressController.getActresVideo);

router.get('modifyActress/:id/:alias/:birthday/:height/:bust/:waist/:hip/:cup/:score', actressController.modifyActress);

router.get('getLastestActressJavBusNum', actressController.getLastestActressJavBusNum);

router.get('addActress/:name/:alias/:birthday/:height/:bust/:waist/:hip/:cup/:javBusCode', actressController.addActress);

// ---------video--------------------

router.get('getVideo/:startIndex/:count/:sortType/:desired/:keyWord', videoController.getVideo);

router.get('addVideo/:code/:name/:date/:actress/:category/:series', videoController.addVideo)

router.get('addActressToVideo/:id/:actress', videoController.addActressToVideo);

router.get('modifyVideoScore/:id/:score', videoController.modifyVideoScore);

router.get('modifyVideoIsDesired/:id/:isDesired', videoController.modifyVideoIsDesired);

/**
 * 过滤番号，将已有的番号过滤掉
 */
router.get('filterVideoCode/:codeList', videoController.filterVideoCode);

router.get('getCategoryByID/:id', categoryController.getCategoryByID);

router.get('getSeriesByID/:id', seriesController.getSeriesByID);

// ---------dmm-----------------

router.get('addRank/:date/:rankData', dmmRankController.addRank);

/*
router.get('36To10/:str', function *() {
	this.body = parseInt(this.params.str, 36);
	
	// this.body = numberUtil.toInt(this.params.str).toString(36);
});
*/

router.get('aaa', function *() {
	// let actresses = yield ActressModel.find({}, {javBusCode: 1});
	// let num = 0, result = "";
	// for (let i = 0; i < actresses.length; i++) {
	// 	num = parseInt(actresses[i].javBusCode, 36);
	// 	if (isNaN(num)) {
	// 		result += "\n" + actresses[i]._id;
	// 	} else {
	// 		yield ActressModel.update({_id: actresses[i]._id}, {$set: {javBusNum: num}});
	// 	}
	// }
	// this.body = jsonUtil.createAPI(1, result);
	// \n0958ce0230ba5c382e248200\n0a58ce0230ba5c382e258200\n0b58ce0230ba5c382e268200

	let seriesArr = yield SeriesModel.find({name: {$regex: '&'}});
	let videoArr = null, video = null, category = null, series = null, seriesStr = null, seriesStrArr = null;
	let removeCategory = [], removeSeries = [];
	for (let i = 0; i < seriesArr.length; i++) {
		videoArr = yield VideoModel.find({series: seriesArr[i]._id});
		for (let j = 0; j < videoArr.length; j++) {
			video = videoArr[j];
			// 找出电影的类别，其实是系列
			category = yield CategoryModel.findOne({_id: video.category[0]});
			// 看看这个系列是否存在了，不存在的话就存进数据库
			series = category ? yield SeriesModel.findOne({name: category.name}) : null;
			if (!series) {
				if (category) {
					series = new SeriesModel({name: category.name});
					yield series.save();
				} else {
					series = yield SeriesModel.findOne({name: 'undefined'});
				}
			}
			video.series = series._id;
			if (category) {
				removeCategory.push(category._id);
				// yield CategoryModel.remove({_id: category._id});
			}

			video.category = [];
			// 找出错误的系列，其实是类别
			seriesStr = yield SeriesModel.findOne({name: seriesArr[i].name});
			seriesStrArr = seriesStr.name.split('&');
			for (let k = 0; k < seriesStrArr.length; k++) {
				category = yield CategoryModel.findOne({name: seriesStrArr[k]});
				if (!category) {
					category = new CategoryModel({name: seriesStrArr[k]});
					yield category.save();
				}
				video.category[k] = category._id;
			}
			// yield SeriesModel.remove({_id: seriesStr._id});
			removeSeries.push(seriesStr._id);
			yield VideoModel.update({_id: video._id}, {$set: {series: video.series, category: video.category}});
		}
	}
	yield CategoryModel.remove({_id: {$in: removeCategory}});
	yield SeriesModel.remove({_id: {$in: removeSeries}});
	this.body = "好了";
});

module.exports = router;
