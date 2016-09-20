package com.avManager.model
{
	import com.adobe.serialization.json.JSONDecoder;
	import com.adobe.serialization.json.JSONEncoder;
	
	import flash.filesystem.File;
	import flash.filesystem.FileMode;
	import flash.filesystem.FileStream;
	import flash.utils.describeType;

	public final class Config
	{
		
		private static var _instance:Config = null;
		
		private var _webURL:String = "https://www.javbus.me";
		
		private var _localServer:String = "http://127.0.0.1:3630";
		
		private var _videoPath:String = "";
		
		private var _videoFormat:String = "mp4;avi;wmv;rmvb;mkv";
		
		private var _actressPath:String = "E:\\codeLib\\wpf\\AVManager3\\actress";
		
		public function Config()
		{
		}
		
		public function get videoFormat():String
		{
			return _videoFormat;
		}

		public function set videoFormat(value:String):void
		{
			_videoFormat = value;
		}

		public function get actressPath():String
		{
			return _actressPath;
		}

		public function set actressPath(value:String):void
		{
			_actressPath = value;
		}

		public function get videoPath():String
		{
			return _videoPath;
		}

		public function set videoPath(value:String):void
		{
			_videoPath = value;
		}

		public function get localServer():String
		{
			return _localServer;
		}

		public function set localServer(value:String):void
		{
			_localServer = value;
		}

		public function get webURL():String
		{
			return _webURL;
		}

		public function set webURL(value:String):void
		{
			_webURL = value;
		}

		public static function getVideoPath():Array {
			return Config._instance._videoPath.split(";");
		}
		
		public static function getVideoFormat():Array {
			return Config._instance._videoFormat.split(";");
		}
		
		public static function loadConfig():void {
			var configFile:File = new File(getConfigPath());
			if(configFile.exists) {
				var fs:FileStream = new FileStream();
				fs.open(configFile, FileMode.READ);
				var configJson:String = fs.readUTFBytes(configFile.size);
				fs.close();
				
				var configObj:Object = new JSONDecoder(configJson).getValue();
				var config:Config = Config.instance;
				var classInfo:XML = describeType(config);
				for each(var v:XML in classInfo..*.(name() == "variable" || name() == "accessor"))
				{
					if(configObj.hasOwnProperty(v.@name)){
						config[v.@name] = configObj[v.@name];	
					}
				}
			}
		}
		
		public static function saveConfig():void {
			var jsonEncoder:JSONEncoder = new JSONEncoder(Config.instance);
			
			var fs:FileStream = new FileStream();
			fs.open(new File(getConfigPath()), FileMode.WRITE);
			fs.writeUTFBytes(jsonEncoder.getString());
			fs.close();
		}
		
		private static function getConfigPath():String {
			return File.applicationStorageDirectory.nativePath + File.separator + "config.json";
		}
		
		public static function get instance():Config{
			if(!_instance) {
				_instance = new Config();
			}
			return _instance;
		}
	}
}