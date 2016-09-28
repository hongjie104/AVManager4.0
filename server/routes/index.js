"use strict";

let router             = require('koa-router')();
let actressController  = require('../app/controllers/actressController');
let videoController    = require('../app/controllers/videoController');
let categoryController = require('../app/controllers/categoryController');
let seriesController   = require('../app/controllers/seriesController');

router.get('', function *(next) {
	yield this.render('index', {
		title: 'Hello World Koa!1'
	});
});

router.get('actress', actressController.index);

router.get('getActress/:startIndex/:count/:sortType/:keyWord', actressController.getActress);

router.get('getActressedByID/:id', actressController.getActressedByID);

router.get('getActressedByName/:name/:startIndex/:count', actressController.getActressedByName);

router.get('getActresVideo/:actressID/:sortType/:startIndex/:count', actressController.getActresVideo);

router.get('modifyActress/:id/:alias/:birthday/:height/:bust/:waist/:hip/:cup/:score', actressController.modifyActress);

router.get('getVideo/:startIndex/:count/:sortType/:keyWord', videoController.getVideo);

router.get('addVideo/:code/:name/:date/:actress/:series/:category', videoController.addVideo)

router.get('addActressToVideo/:id/:actress', videoController.addActressToVideo);

/**
 * 过滤番号，将已有的番号过滤掉
 */
router.get('filterVideoCode/:codeList', videoController.filterVideoCode);

router.get('getCategoryByID/:id', categoryController.getCategoryByID);

router.get('getSeriesByID/:id', seriesController.getSeriesByID);

module.exports = router;
