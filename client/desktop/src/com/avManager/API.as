package com.avManager
{
	import com.avManager.model.Config;

	public final class API
	{
		public function API()
		{
		}
		
		private static function getLocalServer():String{
			return Config.instance.localServer;
		}
		
		public static function getVideo(count:int = 20, lastID:String = "000000000000000000000000", next:Boolean = true):String {
			return getLocalServer() + "/getVideo/" + lastID + "/" + count + "/" + (next ? 1 : 0);
		}
		
		public static function getVideoByCode(code:String, count:int = 20, lastID:String = "000000000000000000000000", next:Boolean = true):String {
			return getLocalServer() + "/searchCode/" + code + "/" + lastID + "/" + count + "/" + (next ? 1 : 0);
		}
		
		public static function getActress(count:int = 20, lastID:String = "000000000000000000000000"):String {
			return getLocalServer() + "/getActress/" + lastID + "/" + count;
		}
	}
}