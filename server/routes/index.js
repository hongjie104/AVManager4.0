"use strict";

let router = require('koa-router')();
let actressController = require('../app/controllers/actressController');

router.get('', function *(next) {
	yield this.render('index', {
		title: 'Hello World Koa!1'
	});
});

router.get('actress', actressController.index);

module.exports = router;
