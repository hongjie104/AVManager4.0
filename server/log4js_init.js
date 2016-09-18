/**
 * Created by guohongxing on 2016/8/11.
 */
'use strict';
let configure = function(){
	let fs = require('fs');
	let path = require('path');
	let config = require('./config');
	let log4js = require('log4js');
	const log_path = path.resolve(process.cwd(),config.logs_path);
	if (!fs.existsSync(log_path)) {
		fs.mkdirSync(log_path);
	}
	 let appenders = [
		{type: 'console'}, //控制台输出
		{
			type: 'dateFile', //文件输出
			filename: path.resolve(log_path,'info.log'),
			maxLogSize: 1048576, // 只在 type: 'file' 中才支持
			backups: 3,
			pattern: '-yyyy-MM-dd', // 占位符，紧跟在filename后面
			alwaysIncludePattern: true, // 文件名是否始终包含占位符
			category: 'info'
		},
		{
			type: 'dateFile', //文件输出
			filename: path.resolve(log_path,'debug.log'),
			maxLogSize: 1048576, // 只在 type: 'file' 中才支持
			backups: 3,
			pattern: '-yyyy-MM-dd', // 占位符，紧跟在filename后面
			alwaysIncludePattern: true, // 文件名是否始终包含占位符
			category: 'debug'
		},
		{
			type: 'dateFile', //文件输出
			filename: path.resolve(log_path,'error.log'),
			maxLogSize: 1048576, // 只在 type: 'file' 中才支持
			backups: 3,
			pattern: '-yyyy-MM-dd', // 占位符，紧跟在filename后面
			alwaysIncludePattern: true, // 文件名是否始终包含占位符
			category: 'error'
		}
	];
	/**
	加入log记录的中间件
	app.use(logger());
	配置log4js
	 */
	log4js.configure({
		appenders: appenders,
		replaceConsole: true
	});
}();

exports.default = configure;