package com.avManager
{
	import com.avManager.model.Config;
	
	import org.libra.utils.MathUtil;
	import org.libra.utils.text.StringUtil;

	public final class API
	{
		public function API()
		{
		}
		
		private static function getLocalServer():String{
			return Config.instance.localServer;
		}
		
		public static function getVideo(startIndex:int, count:int, sortType:int = 1, keyWord:String = "!"):String {
			return getLocalServer() + "/getVideo/" + MathUtil.max(0, startIndex) + "/" + MathUtil.max(0, count) + "/" + sortType + "/" + encodeURIComponent(keyWord);
		}
		
		public static function getActress(startIndex:int, count:int, sortType:int = 1, keyWord:String = "!"):String {
			return getLocalServer() + "/getActress/" + MathUtil.max(0, startIndex) + "/" + MathUtil.max(0, count) + "/" + sortType + "/" + encodeURIComponent(keyWord);
		}
		
		public static function getActressedByID(ids:Vector.<String>):String{
			var idStr:String = ids.join("&");
			if(StringUtil.isNullOrEmpty(idStr)){
				idStr = "!";
			}
			return getLocalServer() + "/getActressedByID/" + idStr;
		}
		
		public static function getCategoryByID(ids:Vector.<String>):String{
			var idStr:String = ids.join("&");
			if(StringUtil.isNullOrEmpty(idStr)){
				idStr = "!";
			}
			return getLocalServer() + "/getCategoryByID/" + idStr;
		}
		
		public static function getSeriesByID(id:String):String{
			return getLocalServer() + "/getSeriesByID/" + id; 
		}
	}
}