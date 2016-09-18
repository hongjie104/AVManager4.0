"use strict";

// require('tingyun');

let app     = require('koa')(),
	// 导入中间件
	koa     = require('koa-router')(),
	log4js  = require('log4js'),
	json    = require('koa-json'),
	views   = require('koa-views'),
	config  = require('./config'),
	onerror = require('koa-onerror');

// db
require('./app/models/db/db');

// xtemplate模板引擎对koa的适配
let xtpl = require('xtpl/lib/koa');
// xtemplate模板渲染
xtpl(app,{
    //配置模板目录，指向工程的view目录
    views: __dirname + '/views'
});

// 加入解析post请求中body的中间件
app.use(require('koa-bodyparser')());

// 加入解析json的中间件
app.use(json({pretty: false, param: 'pretty'}));

// app.keys = [config.session.key];
// app.use(session({
// 	store: new MongoStore({
// 		db: config.MongoDB.NAME,
// 		user: config.MongoDB.USER,
// 		password: config.MongoDB.PWD
// 	}),
// 	cookie: {
// 		maxage: 86400000
// 	}
// }));
require('./log4js_init');
app.logger = function (name){
	let logger = log4js.getLogger(name);
	logger.setLevel('DEBUG');
	return logger;
};
// 将log4js嵌入到koa中
app.use(require('./koaLog4js')());

// 收到请求时，先执行这个generator方法
app.use(function *(next){
	// 记录开始的时间
	// let start = new Date;
	// 挂起并执行next
	yield next;
	// 执行完next继续执行，记录耗时并打印
	// let ms = new Date - start;
	// console.log('%s %s - %s', this.method, this.url, ms);
});

// 设置静态资源目录
app.use(require('koa-static')(__dirname + '/public'));

// 路由
let indexRoute   = require('./routes/index');

// 定义路由
koa.use('/', indexRoute.routes(), indexRoute.allowedMethods());
// koa.use('/snapp', snAppRoute.routes(), snAppRoute.allowedMethods());
// koa.use('/util', utilRoute.routes(), utilRoute.allowedMethods());
// koa.use('/admin', adminRoute.routes(), adminRoute.allowedMethods());

// 使路由生效
app.use(koa.routes());

onerror(app);

// socket
// let server = require('./app/socket/socketHandler').createServer(app);
// server.listen(3001);

// 监听错误
app.on('error', function(err, ctx){
	// console.error('server error', err, ctx);
	let log = app.logger('error');
	log.error("====================================================");
	log.error(ctx, err);
});

module.exports = app;