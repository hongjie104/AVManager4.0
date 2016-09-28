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
			var actressNameStr:String = actressName.join("&");
			if(StringUtil.isNullOrEmpty(actressNameStr)){
				actressNameStr = "!";
			}
			return getLocalServer() + "/addVideo/" + code + "/" + name + "/" + date + "/" + actressNameStr + "/" + category.join("&") + "/" + series;
		}
		
		public static function addActressToVideo(videoID:String, actressName:String):String{
			return getLocalServer() + "/addActressToVideo/" + videoID + "/" + actressName;
		}
		
		public static function filterVideoCode(codeList:Vector.<String>):String{
			return getLocalServer() + "/filterVideoCode/" + codeList.join('&');
		}
		
		//----------------------actress
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
		
		public static function getActresVideo(actressID:String, sortType:int, startIndex:int, count:int):String{
			return getLocalServer() + "/getActresVideo/" + actressID + "/" + sortType + "/" + startIndex + "/" + count;
		}
		
		public static function modifyActress(id:String, alias:String, birthday:Date, height:int, bust:int, waist:int, hip:int, cup:String, score:int):String{
			if(StringUtil.isNullOrEmpty(alias)){
				alias = "!";
			}
			var birthdayStr:String = DateUtil.toString(birthday);
			var arr:Array = birthdayStr.split('-');
			arr[1] = int(arr[1]) - 1;
			birthdayStr = arr.join('-');
			return getLocalServer() + "/modifyActress/" + id + "/" + encodeURIComponent(alias) + "/" + birthdayStr + "/" + height + "/" + bust + "/" + waist + "/" + hip + "/" + cup + "/" + score;
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