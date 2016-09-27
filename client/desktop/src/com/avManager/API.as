package com.avManager
{
	import com.avManager.model.Config;
	
	import org.libra.utils.DateUtil;
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
		
		public static function addVideo(code:String, name:String, date:String, actressName:Vector.<String>, category:Vector.<String>, series:String = "undefined"):String{
			return getLocalServer() + "/addVideo/" + code + "/" + name + "/" + date + "/" + actressName.join("&") + "/" + category.join("&") + "/" + series;
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
		
		public static function getActressedByName(name:String, startIndex:int, count:int):String{
			return getLocalServer() + "/getActressedByName/" + encodeURIComponent(name) + "/" + startIndex + "/" + count;
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