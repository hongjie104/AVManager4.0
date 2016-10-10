"use strict";

let router             = require('koa-router')();
let actressController  = require('../app/controllers/actressController');
let videoController    = require('../app/controllers/videoController');
let categoryController = require('../app/controllers/categoryController');
let seriesController   = require('../app/controllers/seriesController');
let numberUtil = require('../app/utils/numberUtil');
let jsonUtil      = require('../app/utils/jsonUtil');
let ActressModel = require('../app/models/actressModel');

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

router.get('addVideo/:code/:name/:date/:actress/:series/:category', videoController.addVideo)

router.get('addActressToVideo/:id/:actress', videoController.addActressToVideo);

router.get('modifyVideoScore/:id/:score', videoController.modifyVideoScore);

router.get('modifyVideoIsDesired/:id/:isDesired', videoController.modifyVideoIsDesired);

/**
 * 过滤番号，将已有的番号过滤掉
 */
router.get('filterVideoCode/:codeList', videoController.filterVideoCode);

router.get('getCategoryByID/:id', categoryController.getCategoryByID);

router.get('getSeriesByID/:id', seriesController.getSeriesByID);

/*
router.get('36To10/:str', function *() {
	this.body = parseInt(this.params.str, 36);
	
	// this.body = numberUtil.toInt(this.params.str).toString(36);
});
*/

router.get('aaa', function *() {
	let actresses = yield ActressModel.find({}, {javBusCode: 1});
	let num = 0, result = "";
	for (let i = 0; i < actresses.length; i++) {
		num = parseInt(actresses[i].javBusCode, 36);
		if (isNaN(num)) {
			result += "\n" + actresses[i]._id;
		} else {
			yield ActressModel.update({_id: actresses[i]._id}, {$set: {javBusNum: num}});
		}
	}
	this.body = jsonUtil.createAPI(1, result);
	// \n0958ce0230ba5c382e248200\n0a58ce0230ba5c382e258200\n0b58ce0230ba5c382e268200
});

module.exports = router;
