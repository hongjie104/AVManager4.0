"use strict";

let router = require('koa-router')();
let actressController = require('../app/controllers/actressController');
let videoController = require('../app/controllers/videoController');

router.get('', function *(next) {
	yield this.render('index', {
		title: 'Hello World Koa!1'
	});
});

router.get('actress', actressController.index);

router.get('getActress/:lastID/:count', actressController.getActress);

router.get('getVideo/:targetID/:count/:isNext', videoController.getVideo);

router.get('searchCode/:code/:targetID/:count/:isNext', videoController.searchCode);

module.exports = router;
