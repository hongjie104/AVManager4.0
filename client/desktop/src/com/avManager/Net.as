package com.avManager
{
	import com.adobe.serialization.json.JSONDecoder;
	import com.adobe.serialization.json.JSONEncoder;
	
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.controls.Alert;

	public final class Net
	{
		
		private static var _instance:Net;
		
		private var _loader:URLLoader;
		
		private var _callback:Function;
		
		public function Net()
		{
			_loader = new URLLoader();
			_loader.addEventListener(Event.COMPLETE, onLoaded);
			_loader.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
		}
		
		private function onLoaded(evt:Event):void{
			var jsonObj:Object = new JSONDecoder(_loader.data).getValue();
			if(jsonObj.status == 1) {
				if(_callback != null) {
					var cb:Function = _callback;
					_callback = null;
					cb.call(this, jsonObj.data);
				}
			} else {
				Alert.show(jsonObj.data, "错误");
			}
		}
		
		private function onIOError(evt:IOErrorEvent):void{
			
		}
		
		public function fetch(api:String, cb:Function = null):void{
			_callback = cb;
			_loader.load(new URLRequest(api));
		}
		
		public static function get instance():Net{
			if(!_instance){
				_instance = new Net();
			}
			return _instance;
		}
	}
}