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

router.get('getVideo/:startIndex/:count/:sortType/:keyWord', videoController.getVideo);

router.get('addVideo/:code/:name/:date/:actress/:series/:category', videoController.addVideo)

router.get('addActressToVideo/:id/:actress', videoController.addActressToVideo);

router.get('getCategoryByID/:id', categoryController.getCategoryByID);

router.get('getSeriesByID/:id', seriesController.getSeriesByID);

module.exports = router;
